import { cfg, IS_DRY } from '../config.ts';
import { db, kv } from '../db.ts';
import { busStartJournal, publish } from '../bus.ts';
import { MarketDataAgent, markHistory } from './marketData.ts';
import { fundingCarry, emaMomentum, bucketMinuteCloses, combine } from './signals.ts';
import { decide } from './copilot.ts';
import { evaluate, type PositionLike } from './risk.ts';
import { ExecutionAgent } from './execution.ts';
import { guardStep, inflightGuard, readHalted } from './guard.ts';
import { planDecision } from './actions.ts';
import { openOrderCount as countOpenOrders } from './openOrders.ts';
import { startReporter } from './reporter.ts';

export class Orchestrator {
  private md = new MarketDataAgent();
  private exec = new ExecutionAgent();
  private halted = readHalted();
  private lastSync = 0;
  private guardCooldown = 0;
  isHalted(): boolean { return this.halted; }
  async start() {
    busStartJournal();
    startReporter();
    await this.md.warmup();
    kv.set('startedAt', String(Date.now()));
    for (;;) {
      const t0 = Date.now();
      try { await this.tick(); } catch (e) { publish('orchestrator', 'tick.error', { err: String((e as Error).message).slice(0, 300) }, IS_DRY()); }
      const dt = cfg.TICK_MS - (Date.now() - t0);
      if (dt > 0) await new Promise(r => setTimeout(r, dt));
    }
  }
  private positionFromDb(): PositionLike | null {
    const row = db.prepare('SELECT * FROM positions WHERE symbol=?').get(cfg.SYMBOL) as { symbol: string; qty: string; avgEntry: string } | undefined;
    if (!row) return null;
    return { symbol: row.symbol, qty: Number(row.qty), avgEntry: Number(row.avgEntry), qtyBase: row.qty.replace(/^-/, '') };
  }
  private openOrderCount(): number { return countOpenOrders(); }
  private async tick() {
    const snap = await this.md.snapshot();
    publish('marketData', 'market.snapshot', snap, IS_DRY());
    if (Date.now() - this.lastSync >= 30_000) {
      await this.md.syncAccount();
      this.lastSync = Date.now();
    }
    const position = this.positionFromDb();
    const mark = Number(snap.markPrice) / 1e18;

    const step = guardStep({ position, cooldown: this.guardCooldown, inflight: inflightGuard(cfg.SYMBOL) }, mark, snap);
    this.guardCooldown = step.cooldown;
    for (const gi of step.intents) {
      const v = evaluate(gi, { snapshot: snap, position, openOrders: this.openOrderCount() });
      publish('risk', 'risk.verdict', v, IS_DRY());
      if (v.approved) {
        const r = await this.exec.execute(gi);
        if (r.state === 'CONFIRMED' || r.state === 'REJECTED') this.guardCooldown = 3;
        if (r.state === 'CONFIRMED') {
          await this.md.syncAccount();
          this.halted = true;
          kv.set('halted', 'guard-close');
        }
      }
    }
    if (this.halted) return;

    const sigs = [fundingCarry(snap), emaMomentum(bucketMinuteCloses(markHistory))];
    publish('signals', 'signals.set', sigs, IS_DRY());
    const decision = await decide(snap, sigs, position);
    publish('copilot', 'copilot.decision', decision, IS_DRY());
    db.prepare('INSERT INTO decisions(ts,agent,kind,payloadJson,rationale) VALUES(?,?,?,?,?)')
      .run(Date.now(), 'copilot', 'decision', JSON.stringify(decision), decision.rationale);
    const planned = planDecision(decision, position, snap, mark);
    if (planned.kind === 'none') return;
    if (planned.kind === 'cancel_all') { await this.exec.cancelAll(); return; }
    const intent = planned.intent;
    const v = evaluate(intent, { snapshot: snap, position, openOrders: this.openOrderCount() });
    publish('risk', 'risk.verdict', v, IS_DRY());
    if (!v.approved) return;
    const notional = v.adjustedNotionalUsdso ?? intent.notionalUsdso;
    if (intent.reduceOnly) await this.exec.reduce({ ...intent, notionalUsdso: notional }, intent.qtyBase ?? '0');
    else await this.exec.execute({ ...intent, notionalUsdso: notional });
  }
}
