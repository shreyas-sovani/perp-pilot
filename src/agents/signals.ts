import { cfg } from '../config.ts';
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

export function emaMomentum(history: number[]): Signal {
  if (history.length < cfg.EMA_SLOW_TICKS) return { strategy: 'ema-momentum', side: 'flat', strength: 0, rationale: `warming up (${history.length}/${cfg.EMA_SLOW_TICKS} ticks)` };
  const fast = ema(history.slice(-cfg.EMA_FAST_TICKS), cfg.EMA_FAST_TICKS);
  const slow = ema(history.slice(-cfg.EMA_SLOW_TICKS), cfg.EMA_SLOW_TICKS);
  const spread = (fast - slow) / slow;
  if (spread > 0.0005) return { strategy: 'ema-momentum', side: 'long', strength: Math.min(1, spread * 500), rationale: `EMA fast ${(spread * 1e4).toFixed(1)}bps above slow: uptrend` };
  if (spread < -0.0005) return { strategy: 'ema-momentum', side: 'short', strength: Math.min(1, -spread * 500), rationale: `EMA fast ${(spread * 1e4).toFixed(1)}bps below slow: downtrend` };
  return { strategy: 'ema-momentum', side: 'flat', strength: 0, rationale: `EMAs within ${(spread * 1e4).toFixed(1)}bps` };
}

export function combine(sigs: Signal[]): Signal {
  const scored = sigs.filter(s => s.side !== 'flat').sort((a, b) => b.strength - a.strength);
  return scored[0] ?? { strategy: 'funding-carry', side: 'flat', strength: 0, rationale: 'no signal' };
}
