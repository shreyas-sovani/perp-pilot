import Anthropic from '@anthropic-ai/sdk';
import { cfg } from '../config.ts';
import { Decision, Signal, type MarketSnapshot } from './schemas.ts';
import type { PositionLike } from './risk.ts';
import { log } from '../logger.ts';

const SYSTEM = `You are the advisory copilot of an autonomous perps trading agent on a TESTNET.
You choose ONE action from a fixed set. Hard caps are enforced downstream; you cannot raise them.
Legal actions: open_long, open_short, increase, reduce, close, hold, cancel_all.
Prefer 'hold' unless signals align. Never explain outside the JSON. Respond with ONLY JSON matching:
{"action":"...","notionalUsdso":"<string, 1-50>","rationale":"<one sentence>","confidence":<0..1>}`;

export async function decide(snap: MarketSnapshot, signals: Signal[], position: PositionLike | null): Promise<Decision> {
  const rule = signals.find(s => s.side !== 'flat');
  const fallback: Decision = {
    action: rule ? (rule.side === 'long' ? 'open_long' : rule.side === 'short' ? 'open_short' : 'hold') : 'hold',
    notionalUsdso: rule ? String(Math.min(cfg.NOTIONAL_CAP_USDSO, 20)) : undefined,
    rationale: rule ? `rule:${rule.strategy} — ${rule.rationale}` : 'no qualifying signal',
    confidence: rule ? Math.min(1, rule.strength) : 0,
    source: 'rule',
  };
  if (!cfg.ANTHROPIC_API_KEY) return fallback;
  try {
    const client = new Anthropic({ apiKey: cfg.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify({
        symbol: snap.symbol, markUsdso: Number(snap.markPrice) / 1e18,
        fundingAprPct: Number(snap.fundingApr) * 100, priceable: snap.priceable, markAgeMs: snap.markAgeMs,
        signals, position: position ? { qty: position.qty, avgEntry: position.avgEntry } : null,
        dailyLossCapUsdso: cfg.DAILY_LOSS_CAP_USDSO, notionalCapUsdso: cfg.NOTIONAL_CAP_USDSO,
      }) }],
    });
    const block = res.content[0];
    const raw = block && block.type === 'text' ? block.text : '';
    const matched = raw.match(/\{[\s\S]*\}/);
    if (!matched) return fallback;
    const parsed = Decision.parse(JSON.parse(matched[0]));
    return { ...parsed, source: 'llm' };
  } catch (e) {
    log.warn({ err: String(e).slice(0, 200) }, 'copilot fell back to rules');
    return fallback;
  }
}
