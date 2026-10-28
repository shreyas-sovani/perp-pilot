import { cfg } from '../config.ts';
import { kv } from '../db.ts';
import { publish } from '../bus.ts';
import { OrderIntent } from './schemas.ts';
import type { PositionLike } from './risk.ts';
import { bookLimitPrice, type BookQuote } from './pricing.ts';

// Closing in one-way netting mode = opposite-side order of the full position size.
export function guardIntents(position: PositionLike | null, markUsdso: number, book?: BookQuote): OrderIntent[] {
  if (!position || Math.abs(position.qty) < 1e-12) return [];
  const long = position.qty > 0;
  const tp = position.avgEntry * (1 + cfg.TP_PCT / 100);
  const sl = position.avgEntry * (1 - cfg.SL_PCT / 100);
  const hitTp = long ? markUsdso >= tp : markUsdso <= (2 * position.avgEntry - tp); // mirror for short
  const hitSl = long ? markUsdso <= sl : markUsdso >= (2 * position.avgEntry - sl);
  if (!hitTp && !hitSl) return [];
  const realized = Number(kv.get('realizedToday') ?? '0');
  const reasons = [hitTp ? `TP hit at ${markUsdso}` : `SL hit at ${markUsdso}`, ...(realized <= -cfg.DAILY_LOSS_CAP_USDSO ? ['daily loss cap'] : [])];
  publish('guard', 'guard.trigger', { reasons, markUsdso, avgEntry: position.avgEntry }, cfg.DRY_RUN === 'true');
  return [OrderIntent.parse({
    id: crypto.randomUUID(), symbol: position.symbol,
    side: long ? 'sell' : 'buy', reduceOnly: true,
    notionalUsdso: String(Math.abs(position.qty * position.avgEntry)),
    tif: 'GTC',
    limitPriceUsdso: book
      ? bookLimitPrice(long ? 'sell' : 'buy', book)
      : String(long ? markUsdso * (1 - cfg.ENTRY_SLIPPAGE_BPS / 10000) : markUsdso * (1 + cfg.ENTRY_SLIPPAGE_BPS / 10000)),
    origin: 'guard',
  })];
}
