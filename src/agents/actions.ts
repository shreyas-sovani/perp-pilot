import { cfg } from '../config.ts';
import { OrderIntent, type Decision, type MarketSnapshot } from './schemas.ts';
import type { PositionLike } from './risk.ts';
import { bookLimitPrice } from './pricing.ts';

export type Planned = { kind: 'none' } | { kind: 'cancel_all' } | { kind: 'order'; intent: OrderIntent };

export function planDecision(decision: Decision, position: PositionLike | null, snap: MarketSnapshot, mark: number): Planned {
  if (decision.action === 'hold') return { kind: 'none' };
  if (decision.action === 'cancel_all') return { kind: 'cancel_all' };
  if (decision.action === 'close' || decision.action === 'reduce') {
    if (!position || Math.abs(position.qty) < 1e-12) return { kind: 'none' };
    const posNotional = Math.abs(position.qty * mark);
    const requested = Number(decision.notionalUsdso ?? String(posNotional));
    const notional = decision.action === 'close' ? posNotional : Math.min(requested, posNotional);
    const fullQty = position.qtyBase ?? String(Math.abs(position.qty));
    const qtyBase = decision.action === 'close'
      ? fullQty
      : String(mark > 0 ? Math.min(Math.abs(position.qty), notional / mark) : 0);
    const side: 'buy' | 'sell' = position.qty > 0 ? 'sell' : 'buy';
    return {
      kind: 'order',
      intent: OrderIntent.parse({
        id: crypto.randomUUID(), symbol: position.symbol, side, reduceOnly: true,
        notionalUsdso: String(notional), qtyBase, tif: 'IOC',
        limitPriceUsdso: bookLimitPrice(side, snap), origin: 'copilot',
      }),
    };
  }
  if (position && Math.abs(position.qty) > 1e-12 && !decision.action.startsWith('open') && decision.action !== 'increase') {
    return { kind: 'none' };
  }
  const side: 'buy' | 'sell' = decision.action === 'open_short' ? 'sell' : 'buy';
  return {
    kind: 'order',
    intent: OrderIntent.parse({
      id: crypto.randomUUID(), symbol: cfg.SYMBOL, side, reduceOnly: false,
      notionalUsdso: decision.notionalUsdso ?? '10', tif: 'GTC',
      limitPriceUsdso: bookLimitPrice(side, snap), origin: 'copilot',
    }),
  };
}
