import { describe, it, expect } from 'vitest';
import { ema, fundingCarry, emaMomentum, combine } from '../src/agents/signals.ts';
import { MarketSnapshot } from '../src/agents/schemas.ts';

const snap = (apr: string): MarketSnapshot => MarketSnapshot.parse({
  symbol: 'ETH-PERP', markPrice: '3000000000000000000000', indexPrice: '3000000000000000000000',
  markAgeMs: 0, priceable: true, fundingRate: '0', fundingApr: apr, bestBid: null, bestAsk: null,
  tickSize: '1000000000000', lotSize: '1000000000000000', minQuantity: '1000000000000000',
  baseDecimals: 18, quoteDecimals: 18, ts: Date.now(),
});

it('ema is identity for constant series', () => expect(ema([5, 5, 5], 3)).toBe(5));
it('positive APR beyond band shorts', () => expect(fundingCarry(snap('0.5')).side).toBe('short'));
it('negative APR beyond band longs', () => expect(fundingCarry(snap('-0.5')).side).toBe('long'));
it('small APR flat', () => expect(fundingCarry(snap('0.01')).side).toBe('flat'));
it('momentum flat while warming up', () => expect(emaMomentum(Array(10).fill(100)).side).toBe('flat'));
it('uptrend detected', () => {
  const h = [...Array(650).keys()].map(i => 100 + i * 0.05);
  expect(emaMomentum(h).side).toBe('long');
});
it('combine picks strongest non-flat', () => {
  expect(combine([{ strategy: 'funding-carry', side: 'flat', strength: 0, rationale: '' },
                  { strategy: 'ema-momentum', side: 'short', strength: 0.4, rationale: '' }]).side).toBe('short');
});
