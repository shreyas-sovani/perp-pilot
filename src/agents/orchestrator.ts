import { cfg, IS_DRY } from '../config.ts';
import { db, kv } from '../db.ts';
import { busStartJournal, publish } from '../bus.ts';
import { MarketDataAgent, markHistory } from './marketData.ts';
import { fundingCarry, emaMomentum, combine } from './signals.ts';
import { decide } from './copilot.ts';
import { evaluate, type PositionLike } from './risk.ts';
import { ExecutionAgent } from './execution.ts';
import { guardIntents } from './guard.ts';
import { OrderIntent } from './schemas.ts';
import { bookLimitPrice } from './pricing.ts';

export class Orchestrator {
  private md = new MarketDataAgent();
  private exec = new ExecutionAgent();
  private halted = false;
  async start() {
    busStartJournal();
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
    return row ? { symbol: row.symbol, qty: Number(row.qty), avgEntry: Number(row.avgEntry) } : null;
  }
  private openOrderCount(): number {
    const row = db.prepare("SELECT COUNT(*) c FROM orders WHERE state IN ('PREFLIGHT','SUBMITTED','MINED') AND updatedAt > ?").get(Date.now() - 3600_000) as { c: number } | undefined;
    return row?.c ?? 0;
  }
  private async tick() {
    const snap = await this.md.snapshot();
    publish('marketData', 'market.snapshot', snap, IS_DRY());
    kv.set('equityUsdso', kv.get('equityUsdso') ?? '0');
    const position = this.positionFromDb();
    const mark = Number(snap.markPrice) / 1e18;
    db.prepare('INSERT OR REPLACE INTO equity(ts,equityUsdso,unrealizedPnl) VALUES(?,?,?)')
      .run(Date.now(), kv.get('equityUsdso')!, position ? String((mark - position.avgEntry) * position.qty) : '0');

    for (const gi of guardIntents(position, mark, snap)) {
      const v = evaluate(gi, { snapshot: snap, position, openOrders: this.openOrderCount() });
      publish('risk', 'risk.verdict', v, IS_DRY());
      if (v.approved) {
        const r = await this.exec.execute(gi);
        if (r.state === 'CONFIRMED') { this.halted = true; kv.set('halted', 'guard-close'); }
      }
    }
    if (this.halted) return;

    const sigs = [fundingCarry(snap), emaMomentum(markHistory)];
    publish('signals', 'signals.set', sigs, IS_DRY());
    const decision = await decide(snap, sigs, position);
    publish('copilot', 'copilot.decision', decision, IS_DRY());
    db.prepare('INSERT INTO decisions(ts,agent,kind,payloadJson,rationale) VALUES(?,?,?,?,?)')
      .run(Date.now(), 'copilot', 'decision', JSON.stringify(decision), decision.rationale);
    if (decision.action === 'hold' || decision.action === 'cancel_all') return;
    if (position && Math.abs(position.qty) > 1e-12 && !decision.action.startsWith('open') && decision.action !== 'increase') {
      return;
    }
    const intent = OrderIntent.parse({
      id: crypto.randomUUID(), symbol: cfg.SYMBOL,
      side: decision.action === 'open_short' || decision.action === 'reduce' ? 'sell' : 'buy',
      reduceOnly: false, notionalUsdso: decision.notionalUsdso ?? '10', tif: 'GTC',
      limitPriceUsdso: bookLimitPrice(decision.action === 'open_short' || decision.action === 'reduce' ? 'sell' : 'buy', snap),
      origin: 'copilot',
    });
    const v = evaluate(intent, { snapshot: snap, position, openOrders: this.openOrderCount() });
    publish('risk', 'risk.verdict', v, IS_DRY());
    if (!v.approved) return;
    const notional = v.adjustedNotionalUsdso ?? intent.notionalUsdso;
    const rep = await this.exec.execute({ ...intent, notionalUsdso: notional });
    if (rep.state === 'CONFIRMED' && rep.txHash) {
      const qty = Number(notional) / mark;
      const sideSign = intent.side === 'buy' ? 1 : -1;
      const p = this.positionFromDb();
      const newQty = (p ? p.qty : 0) + sideSign * qty;
      db.prepare(`INSERT INTO positions(symbol,qty,avgEntry,realizedPnl,openedAt,updatedAt) VALUES(?,?,?,?,?,?)
        ON CONFLICT(symbol) DO UPDATE SET qty=excluded.qty, avgEntry=excluded.avgEntry, updatedAt=excluded.updatedAt`)
        .run(cfg.SYMBOL, String(newQty), String(mark), '0', Date.now(), Date.now());
    }
  }
}
