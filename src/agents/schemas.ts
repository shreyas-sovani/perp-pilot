import { z } from 'zod';

export const MarketSnapshot = z.object({
  symbol: z.string(),
  markPrice: z.string(), indexPrice: z.string(),
  markAgeMs: z.number().int(), priceable: z.boolean(),
  fundingRate: z.string(), fundingApr: z.string(),
  bestBid: z.string().nullable(), bestAsk: z.string().nullable(),
  tickSize: z.string(), lotSize: z.string(), minQuantity: z.string(),
  baseDecimals: z.number().int(), quoteDecimals: z.number().int(),
  ts: z.number().int(),
});
export type MarketSnapshot = z.infer<typeof MarketSnapshot>;

export const Signal = z.object({
  strategy: z.enum(['funding-carry', 'ema-momentum']),
  side: z.enum(['long', 'short', 'flat']),
  strength: z.number().min(0).max(1),
  rationale: z.string(),
});
export type Signal = z.infer<typeof Signal>;

export const Decision = z.object({
  action: z.enum(['open_long', 'open_short', 'increase', 'reduce', 'close', 'hold', 'cancel_all']),
  notionalUsdso: z.string().optional(),
  rationale: z.string().min(1),
  confidence: z.number().min(0).max(1),
  source: z.enum(['llm', 'rule']),
});
export type Decision = z.infer<typeof Decision>;

export const OrderIntent = z.object({
  id: z.string().uuid(), symbol: z.string(),
  side: z.enum(['buy', 'sell']), reduceOnly: z.boolean(),
  notionalUsdso: z.string(), tif: z.enum(['GTC', 'IOC', 'FOK', 'ALO']),
  limitPriceUsdso: z.string().nullable(),
  origin: z.enum(['copilot', 'guard', 'probe']),
});
export type OrderIntent = z.infer<typeof OrderIntent>;

export const RiskVerdict = z.object({
  intentId: z.string(), approved: z.boolean(),
  reasons: z.array(z.string()),
  adjustedNotionalUsdso: z.string().optional(),
});
export type RiskVerdict = z.infer<typeof RiskVerdict>;

export const EXEC_STATES = ['PREFLIGHT', 'SIGNED', 'SUBMITTED', 'MINED', 'CONFIRMED', 'REJECTED'] as const;
export const ExecutionReport = z.object({
  intentId: z.string(),
  state: z.enum(EXEC_STATES),
  txHash: z.string().nullable(), onChainOrderId: z.string().nullable(),
  rejectReason: z.string().nullable(), gasUsed: z.string().nullable(), ts: z.number().int(),
});
export type ExecutionReport = z.infer<typeof ExecutionReport>;

export const Finding = z.object({
  probeId: z.string(), title: z.string(),
  severity: z.enum(['critical', 'major', 'normal']),
  area: z.enum(['API', 'SDK', 'docs', 'app', 'contracts']),
  evidence: z.record(z.string(), z.unknown()),
});
export type Finding = z.infer<typeof Finding>;
