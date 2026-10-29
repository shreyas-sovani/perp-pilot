import { describe, it, expect } from 'vitest';

function levels(qty: number, entry: number, tpPct: number, slPct: number) {
  const long = qty > 0;
  const tp = long ? entry * (1 + tpPct / 100) : entry * (1 - tpPct / 100);
  const sl = long ? entry * (1 - slPct / 100) : entry * (1 + slPct / 100);
  return { tp, sl };
}

it('long TP is above entry and SL is below', () => {
  expect(levels(0.01, 3000, 2, 1.5)).toEqual({ tp: 3060, sl: 2955 });
});

it('short TP and SL are the mirror image', () => {
  const out = levels(-0.01, 3000, 2, 1.5);
  expect(out.tp).toBeCloseTo(2940, 5);
  expect(out.sl).toBeCloseTo(3045, 5);
  expect(out.tp).toBeLessThan(3000);
  expect(out.sl).toBeGreaterThan(3000);
});
