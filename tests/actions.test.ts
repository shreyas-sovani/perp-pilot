import { describe, it, expect } from 'vitest';
import { planDecision } from '../src/agents/actions.ts';
import { Decision, MarketSnapshot } from '../src/agents/schemas.ts';
import { evaluate, dayKey } from '../src/agents/risk.ts';
import { kv } from '../src/db.ts';

const snap = MarketSnapshot.parse({
  symbol: 'ETH-PERP', markPrice: '3000000000000000000000', indexPrice: '3000000000000000000000',
  markAgeMs: 0, priceable: true, fundingRate: '0', fundingApr: '0', bestBid: '2990000000000000000000', bestAsk: '3010000000000000000000',
  tickSize: '1', lotSize: '1', minQuantity: '1', baseDecimals: 18, quoteDecimals: 18, ts: Date.now(),
});
const pos = { symbol: 'ETH-PERP', qty: 0.02, avgEntry: 3000, qtyBase: '0.02' };
const decision = (action: 'close' | 'reduce' | 'cancel_all' | 'hold', notionalUsdso = '100') => Decision.parse({
  action, notionalUsdso, rationale: 'test', confidence: 0.5, source: 'rule',
});

it('close maps to a full-qty reduce intent', () => {
  const planned = planDecision(decision('close'), pos, snap, 3000);
  expect(planned.kind).toBe('order');
  if (planned.kind !== 'order') return;
  expect(planned.intent.reduceOnly).toBe(true);
  expect(planned.intent.qtyBase).toBe('0.02');
  expect(planned.intent.side).toBe('sell');
  expect(planned.intent.origin).toBe('copilot');
});

it('reduce maps to a notional-capped qty', () => {
  const planned = planDecision(decision('reduce', '30'), pos, snap, 3000);
  expect(planned.kind).toBe('order');
  if (planned.kind !== 'order') return;
  expect(Number(planned.intent.qtyBase)).toBeCloseTo(0.01, 6);
  expect(Number(planned.intent.notionalUsdso)).toBe(30);
});

it('cancel_all is its own plan', () => {
  expect(planDecision(decision('cancel_all'), pos, snap, 3000).kind).toBe('cancel_all');
});

it('a stale mark vetoes the close intent', () => {
  kv.set('equityUsdso', '1000');
  kv.set(`anchor:${dayKey()}`, '1000');
  kv.set(`realized:${dayKey()}`, '0');
  const planned = planDecision(decision('close'), pos, snap, 3000);
  if (planned.kind !== 'order') throw new Error('expected order');
  const verdict = evaluate(planned.intent, { snapshot: { ...snap, markAgeMs: 99_999 }, position: pos, openOrders: 0 });
  expect(verdict.approved).toBe(false);
  expect(verdict.reasons).toContain('E_STALE_MARK');
});
