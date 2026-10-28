import { cfg } from '../config.ts';
import { db, kv } from '../db.ts';
import { publish } from '../bus.ts';
import { OrderIntent } from './schemas.ts';
import { dayKey, type PositionLike } from './risk.ts';
import { bookLimitPrice, type BookQuote } from './pricing.ts';

// Closing in one-way netting mode = opposite-side order of the full position size.
export function guardIntents(position: PositionLike | null, markUsdso: number, book?: BookQuote): OrderIntent[] {
  if (!position || Math.abs(position.qty) < 1e-12) return [];
  const long = position.qty > 0;
  const tp = position.avgEntry * (1 + cfg.TP_PCT / 100);
  const sl = position.avgEntry * (1 - cfg.SL_PCT / 100);
  const hitTp = long ? markUsdso >= tp : markUsdso <= (2 * position.avgEntry - tp); // mirror for short
  const hitSl = long ? markUsdso <= sl : markUsdso >= (2 * position.avgEntry - sl);
  const realized = Number(kv.get(`realized:${dayKey()}`) ?? '0');
  const lossCap = realized <= -cfg.DAILY_LOSS_CAP_USDSO;
  if (!hitTp && !hitSl && !lossCap) return [];
  const reasons = [
    ...(hitTp ? [`TP hit at ${markUsdso}`] : []),
    ...(hitSl ? [`SL hit at ${markUsdso}`] : []),
    ...(lossCap ? ['daily loss cap'] : []),
  ];
  publish('guard', 'guard.trigger', { reasons, markUsdso, avgEntry: position.avgEntry }, cfg.DRY_RUN === 'true');
  const qtyBase = position.qtyBase ?? String(Math.abs(position.qty));
  return [OrderIntent.parse({
    id: crypto.randomUUID(), symbol: position.symbol,
    side: long ? 'sell' : 'buy', reduceOnly: true,
    notionalUsdso: String(Math.abs(position.qty * markUsdso)),
    qtyBase,
    tif: 'GTC',
    limitPriceUsdso: book
      ? bookLimitPrice(long ? 'sell' : 'buy', book)
      : String(long ? markUsdso * (1 - cfg.ENTRY_SLIPPAGE_BPS / 10000) : markUsdso * (1 + cfg.ENTRY_SLIPPAGE_BPS / 10000)),
    origin: 'guard',
  })];
}

export function readHalted(): boolean {
  const v = kv.get('halted');
  return v != null && v !== '';
}

/** One guard decision. Inflight orders and the post-terminal cooldown emit nothing. */
export function guardStep(state: { position: PositionLike | null; cooldown: number; inflight: boolean }, markUsdso: number, book?: BookQuote): { intents: OrderIntent[]; cooldown: number } {
  if (state.inflight) return { intents: [], cooldown: state.cooldown };
  if (state.cooldown > 0) return { intents: [], cooldown: state.cooldown - 1 };
  return { intents: guardIntents(state.position, markUsdso, book), cooldown: 0 };
}

export function inflightGuard(symbol: string): boolean {
  const row = db.prepare(
    "SELECT COUNT(*) c FROM orders WHERE symbol=? AND state IN ('PREFLIGHT','SIGNED','SUBMITTED','MINED') AND intentJson LIKE '%\"origin\":\"guard\"%'",
  ).get(symbol) as { c: number } | undefined;
  return (row?.c ?? 0) > 0;
}
