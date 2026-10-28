import type { MarketSnapshot, Signal } from './schemas.ts';

export function ema(values: number[], period: number): number {
  if (values.length === 0) return NaN;
  const k = 2 / (period + 1);
  return values.reduce((acc, v, i) => (i === 0 ? v : v * k + acc * (1 - k)), 0);
}

export function fundingCarry(s: MarketSnapshot): Signal {
  const apr = Number(s.fundingApr);
  const THRESHOLD = 0.10; // 10% APR: meaningful carry
  if (apr >= THRESHOLD) return { strategy: 'funding-carry', side: 'short', strength: Math.min(1, apr), rationale: `funding APR ${(apr * 100).toFixed(1)}% >= 10%: shorts are paid` };
  if (apr <= -THRESHOLD) return { strategy: 'funding-carry', side: 'long', strength: Math.min(1, -apr), rationale: `funding APR ${(apr * 100).toFixed(1)}% <= -10%: longs are paid` };
  return { strategy: 'funding-carry', side: 'flat', strength: 0, rationale: `funding APR ${(apr * 100).toFixed(1)}% inside ±10% band` };
}

export const EMA_FAST_MIN = 9;
export const EMA_SLOW_MIN = 21;

export function bucketMinuteCloses(points: { ts: number; mark: number }[]): number[] {
  const last = new Map<number, number>();
  for (const p of points) last.set(Math.floor(p.ts / 60_000), p.mark);
  return [...last.entries()].sort((a, b) => a[0] - b[0]).map(([, mark]) => mark);
}

export function emaMomentum(history: number[]): Signal {
  if (history.length < EMA_SLOW_MIN) return { strategy: 'ema-momentum', side: 'flat', strength: 0, rationale: `warming up (${history.length}/21 min)` };
  const fast = ema(history.slice(-EMA_FAST_MIN), EMA_FAST_MIN);
  const slow = ema(history.slice(-EMA_SLOW_MIN), EMA_SLOW_MIN);
  const spread = (fast - slow) / slow;
  if (spread > 0.0005) return { strategy: 'ema-momentum', side: 'long', strength: Math.min(1, spread * 500), rationale: `EMA fast ${(spread * 1e4).toFixed(1)}bps above slow: uptrend` };
  if (spread < -0.0005) return { strategy: 'ema-momentum', side: 'short', strength: Math.min(1, -spread * 500), rationale: `EMA fast ${(spread * 1e4).toFixed(1)}bps below slow: downtrend` };
  return { strategy: 'ema-momentum', side: 'flat', strength: 0, rationale: `EMAs within ${(spread * 1e4).toFixed(1)}bps` };
}

export function combine(sigs: Signal[]): Signal {
  const scored = sigs.filter(s => s.side !== 'flat').sort((a, b) => b.strength - a.strength);
  return scored[0] ?? { strategy: 'funding-carry', side: 'flat', strength: 0, rationale: 'no signal' };
}
