import { cfg } from '../config.ts';
import { kv } from '../db.ts';
import { OrderIntent, RiskVerdict, type MarketSnapshot } from './schemas.ts';

export function dayKey(): string { return new Date().toISOString().slice(0, 10); }
export function dailyAnchorUsdso(): number {
  const k = `anchor:${dayKey()}`;
  const v = kv.get(k);
  if (!v) { kv.set(k, String(equityNow())); return equityNow(); }
  return Number(v);
}
function equityNow(): number { return Number(kv.get('equityUsdso') ?? '0'); }

export interface PositionLike { symbol: string; qty: number; avgEntry: number; qtyBase?: string; }
export interface RiskCtx { snapshot: MarketSnapshot; position: PositionLike | null; openOrders: number; }

export function evaluate(intent: OrderIntent, ctx: RiskCtx): RiskVerdict {
  const reasons: string[] = [];
  const symbol = intent.symbol;
  const mark = Number(ctx.snapshot.markPrice) / 1e18;
  let notional = Number(intent.notionalUsdso);

  if (ctx.snapshot.ts === 0) reasons.push('E_NO_SNAPSHOT');
  if (ctx.snapshot.markAgeMs > cfg.STALE_MARK_MS) reasons.push('E_STALE_MARK');
  if (!ctx.snapshot.priceable) reasons.push('E_MARK_NOT_PRICEABLE');
  if (symbol !== cfg.SYMBOL) reasons.push('E_WRONG_MARKET');
  // single-market policy
  if (ctx.position && ctx.position.symbol !== cfg.SYMBOL) reasons.push('E_POSITION_IN_OTHER_MARKET');

  // guard intents are pre-approved class, but still sanity-checked for staleness above
  if (intent.origin !== 'guard') {
    const openNotional = ctx.position ? Math.abs(ctx.position.qty * ctx.position.avgEntry) : 0;
    const projected = openNotional + notional;
    if (projected > cfg.NOTIONAL_CAP_USDSO) {
      if (cfg.NOTIONAL_CAP_USDSO - openNotional > 1) { notional = Math.floor(cfg.NOTIONAL_CAP_USDSO - openNotional); reasons.push('W_NOTIONAL_CLAMPED'); }
      else reasons.push('E_CAP_NOTIONAL');
    }
    // effective leverage = notional / equity; equity approximated by anchor - realized losses
    const equity = Math.max(1, dailyAnchorUsdso());
    if (projected / equity > cfg.MAX_LEVERAGE_EFF) reasons.push('E_CAP_LEVERAGE');
    if (ctx.openOrders >= cfg.MAX_OPEN_ORDERS && !intent.reduceOnly) reasons.push('E_MAX_OPEN_ORDERS');
    const realized = Number(kv.get(`realized:${dayKey()}`) ?? '0');
    if (realized <= -cfg.DAILY_LOSS_CAP_USDSO) reasons.push('E_DAILY_LOSS');
    // price-band veto: refuse entries when mark moved > 50bps since snapshot
    if (intent.limitPriceUsdso) {
      const lp = Number(intent.limitPriceUsdso);
      if (Math.abs(lp - mark) / mark > 0.005 * 10) reasons.push('E_PRICE_BAND');
    }
  }
  if (notional < 1) reasons.push('E_NOTIONAL_TOO_SMALL');
  const approved = reasons.every(r => !r.startsWith('E_'));
  return RiskVerdict.parse({ intentId: intent.id, approved, reasons, adjustedNotionalUsdso: reasons.includes('W_NOTIONAL_CLAMPED') ? String(notional) : undefined });
}
