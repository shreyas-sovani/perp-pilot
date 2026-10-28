import { describe, it, expect } from 'vitest';
import { evaluate, dayKey } from '../src/agents/risk.ts';
import { OrderIntent, MarketSnapshot } from '../src/agents/schemas.ts';
import { kv } from '../src/db.ts';

// Kernel uses equity anchor for leverage. Empty kv makes 20 USDso look like 20x and vetoes.
// Cap test needs a full book: a 500 order on an empty book is clamped (room > 1), not E_CAP_NOTIONAL.
kv.set('equityUsdso', '1000');
kv.set(`anchor:${dayKey()}`, '1000');
kv.set(`realized:${dayKey()}`, '0');

const snap = MarketSnapshot.parse({
  symbol: 'ETH-PERP', markPrice: '3000000000000000000000', indexPrice: '3000000000000000000000',
  markAgeMs: 0, priceable: true, fundingRate: '0', fundingApr: '0', bestBid: null, bestAsk: null,
  tickSize: '1', lotSize: '1', minQuantity: '1', baseDecimals: 18, quoteDecimals: 18, ts: Date.now(),
});
const intent = (o: Partial<Record<string, unknown>> = {}) => OrderIntent.parse({
  id: crypto.randomUUID(), symbol: 'ETH-PERP', side: 'buy', reduceOnly: false,
  notionalUsdso: '20', tif: 'GTC', limitPriceUsdso: null, origin: 'copilot', ...o,
});
const ctx = { snapshot: snap, position: null, openOrders: 0 };

it('approves a small legal intent', () => {
  kv.set(`realized:${dayKey()}`, '0');
  expect(evaluate(intent(), ctx).approved).toBe(true);
});
it('vetoes over-cap notional entirely when no room', () =>
  expect(evaluate(intent({ notionalUsdso: '500' }), {
    ...ctx,
    position: { symbol: 'ETH-PERP', qty: 1, avgEntry: 50 },
  }).reasons).toContain('E_CAP_NOTIONAL'));
it('vetoes stale mark', () =>
  expect(evaluate(intent(), { ...ctx, snapshot: { ...snap, markAgeMs: 99_999 } }).reasons).toContain('E_STALE_MARK'));
it('vetoes wrong market', () =>
  expect(evaluate(intent({ symbol: 'BTC-PERP' }), ctx).reasons).toContain('E_WRONG_MARKET'));
it('vetoes a limit more than 50 bps from the mark', () => {
  expect(evaluate(intent({ limitPriceUsdso: '3030' }), ctx).reasons).toContain('E_PRICE_BAND');
});
it('allows a limit inside 50 bps', () => {
  kv.set(`realized:${dayKey()}`, '0');
  expect(evaluate(intent({ limitPriceUsdso: '3012' }), ctx).approved).toBe(true);
});
it('vetoes when daily loss cap hit', () => {
  kv.set(`realized:${dayKey()}`, '-99');
  expect(evaluate(intent(), ctx).reasons).toContain('E_DAILY_LOSS');
});
