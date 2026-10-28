import { describe, it, expect } from 'vitest';
import { decide } from '../src/agents/copilot.ts';
import { MarketSnapshot } from '../src/agents/schemas.ts';

const snap = MarketSnapshot.parse({
  symbol: 'ETH-PERP', markPrice: '3000000000000000000000', indexPrice: '1', markAgeMs: 0, priceable: true,
  fundingRate: '0', fundingApr: '0.2', bestBid: null, bestAsk: null, tickSize: '1', lotSize: '1', minQuantity: '1',
  baseDecimals: 18, quoteDecimals: 18, ts: 1,
});

it('a hung model falls back to the rule inside 5s', async () => {
  const t0 = Date.now();
  const out = await decide(snap, [{ strategy: 'funding-carry', side: 'short', strength: 0.4, rationale: 'carry' }], null, {
    client: { messages: { create: () => new Promise(() => {}) } },
  });
  expect(Date.now() - t0).toBeLessThan(5_000);
  expect(out.source).toBe('rule');
  expect(out.action).toBe('open_short');
}, 8_000);
