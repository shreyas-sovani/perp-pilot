import { z } from 'zod';
import 'dotenv/config';

const Env = z.object({
  CHAIN_ID: z.coerce.number().int().default(50383),
  RPC_URL_WS: z.string().url().refine(u => u.startsWith('ws'), 'SDK requires a WebSocket RPC'),
  RPC_URL_HTTP: z.string().url(),
  GRAPHQL_URL: z.string().url(),
  EXPLORER_TX_BASE: z.string().url(),
  BOT_PRIVATE_KEY: z.string().regex(/^0x[0-9a-fA-F]{64}$/).or(z.literal('')).default(''),
  OWNER_ADDRESS: z.string().regex(/^0x[0-9a-fA-F]{40}$/).or(z.literal('')).default(''),
  SYMBOL: z.string().default('ETH-PERP'),
  DRY_RUN: z.enum(['true', 'false']).default('true'),
  NOTIONAL_CAP_USDSO: z.coerce.number().positive().default(50),
  MAX_LEVERAGE_EFF: z.coerce.number().positive().default(5),
  DAILY_LOSS_CAP_USDSO: z.coerce.number().positive().default(10),
  MAX_OPEN_ORDERS: z.coerce.number().int().positive().default(3),
  STALE_MARK_MS: z.coerce.number().int().positive().default(10000),
  ENTRY_SLIPPAGE_BPS: z.coerce.number().int().positive().default(30),
  TP_PCT: z.coerce.number().positive().default(2.0),
  SL_PCT: z.coerce.number().positive().default(1.5),
  TICK_MS: z.coerce.number().int().positive().default(2000),
  EMA_FAST_TICKS: z.coerce.number().int().positive().default(270),
  EMA_SLOW_TICKS: z.coerce.number().int().positive().default(630),
  PORT: z.coerce.number().int().default(8787),
  DB_PATH: z.string().default('state.db'),
  ANTHROPIC_API_KEY: z.string().default(''),
  LOG_LEVEL: z.string().default('info'),
});
export const cfg = Env.parse(process.env);
export const IS_DRY = () => cfg.DRY_RUN === 'true';
export const GAS_LIMIT = 10_000_000n; // bot-kit convention; out-of-gas receipts show status 0 with no reason
