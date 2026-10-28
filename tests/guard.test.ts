import { describe, it, expect, beforeEach } from 'vitest';
import { guardIntents, guardStep, readHalted } from '../src/agents/guard.ts';
import { kv } from '../src/db.ts';
import { dayKey } from '../src/agents/risk.ts';

beforeEach(() => { kv.set(`realized:${dayKey()}`, '0'); kv.set('halted', ''); });

it('no position -> no intents', () => expect(guardIntents(null, 3000)).toHaveLength(0));
it('long past TP -> sell intent', () => {
  const out = guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 3000 }, 3080);
  expect(out).toHaveLength(1); expect(out[0]!.side).toBe('sell'); expect(out[0]!.origin).toBe('guard');
});
it('long above SL band -> nothing', () => expect(guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 3000 }, 3050)).toHaveLength(0));
it('short past TP -> buy intent', () => {
  const out = guardIntents({ symbol: 'ETH-PERP', qty: -0.01, avgEntry: 3000 }, 2900);
  expect(out).toHaveLength(1); expect(out[0]!.side).toBe('buy');
});

const pos = { symbol: 'ETH-PERP', qty: 0.01, avgEntry: 1000, qtyBase: '0.01' };

it('close qty stays the position qty when mark and entry diverge', () => {
  const out = guardIntents(pos, 5000);
  expect(out[0]!.qtyBase).toBe('0.01');
  expect(out[0]!.notionalUsdso).toBe('50');
});

it('confirmed flat close does not emit a second intent', () => {
  const first = guardStep({ position: pos, cooldown: 0, inflight: false }, 5000);
  expect(first.intents).toHaveLength(1);
  const next = guardStep({ position: null, cooldown: 3, inflight: false }, 5000);
  expect(next.intents).toHaveLength(0);
  expect(next.cooldown).toBe(2);
});

it('halt flag survives a fresh read', () => {
  kv.set('halted', 'guard-close');
  expect(readHalted()).toBe(true);
  kv.set('halted', '');
  expect(readHalted()).toBe(false);
});

it('daily loss cap closes even inside the tp/sl band', () => {
  kv.set(`realized:${dayKey()}`, '-10');
  const out = guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 3000 }, 3000);
  expect(out).toHaveLength(1);
  expect(out[0]!.qtyBase).toBe('0.01');
});
