import { describe, it, expect } from 'vitest';
import { bookLimitPrice } from '../src/agents/pricing.ts';
import { guardIntents } from '../src/agents/guard.ts';

const quote = {
  markPrice: '3000000000000000000000',
  bestBid: '2990000000000000000000',
  bestAsk: '3010000000000000000000',
};

it('buy limit is at or through the ask', () => {
  const buy = Number(bookLimitPrice('buy', quote, 30));
  expect(buy).toBeGreaterThanOrEqual(3010);
});

it('sell limit is at or through the bid', () => {
  const sell = Number(bookLimitPrice('sell', quote, 30));
  expect(sell).toBeLessThanOrEqual(2990);
});

it('falls back to the chain mark when a top is missing', () => {
  const buy = Number(bookLimitPrice('buy', { ...quote, bestAsk: null }, 0));
  expect(buy).toBeCloseTo(3000, 5);
});

it('guard close sells through the bid', () => {
  const out = guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 2000 }, 3010, quote);
  expect(out).toHaveLength(1);
  expect(Number(out[0]!.limitPriceUsdso)).toBeLessThanOrEqual(2990);
});
