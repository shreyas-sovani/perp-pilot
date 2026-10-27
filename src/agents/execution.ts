import { parseUnits, formatUnits, type Address, type TransactionReceipt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ORDER_TYPE } from '@somnia-chain/markets-sdk';
import { cfg, GAS_LIMIT, IS_DRY } from '../config.ts';
import { initSdk, requireMarket, type Markets } from '../sdk.ts';
import { db } from '../db.ts';
import { publish } from '../bus.ts';
import { OrderIntent, ExecutionReport, type ExecutionReport as ER } from './schemas.ts';
import { log } from '../logger.ts';

// placePerpOrder has no tif field. See docs/sdk-api.md.
function orderTypeFor(tif: OrderIntent['tif']): number {
  if (tif === 'IOC') return ORDER_TYPE.MARKET;
  if (tif === 'FOK') return ORDER_TYPE.FILL_OR_KILL;
  if (tif === 'ALO') return ORDER_TYPE.POST_ONLY;
  return ORDER_TYPE.LIMIT;
}

function account(): Address {
  if (cfg.OWNER_ADDRESS) return cfg.OWNER_ADDRESS as Address;
  return privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`).address;
}

export class ExecutionAgent {
  private markets: Markets;
  constructor() { this.markets = initSdk(); }

  private record(intent: OrderIntent, patch: Partial<ER>): ER {
    const rep = ExecutionReport.parse({ intentId: intent.id, state: 'PREFLIGHT', txHash: null, onChainOrderId: null, rejectReason: null, gasUsed: null, ts: Date.now(), ...patch });
    // symbol and side are NOT NULL. The draft INSERT omitted them and would throw.
    db.prepare(`INSERT INTO orders(id,symbol,side,reduceOnly,state,intentJson,txHash,onChainOrderId,rejectReason,createdAt,updatedAt)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET state=excluded.state,
        txHash=COALESCE(excluded.txHash, orders.txHash),
        onChainOrderId=COALESCE(excluded.onChainOrderId, orders.onChainOrderId),
        rejectReason=COALESCE(excluded.rejectReason, orders.rejectReason),
        updatedAt=excluded.updatedAt`)
      .run(intent.id, intent.symbol, intent.side, intent.reduceOnly ? 1 : 0, rep.state, JSON.stringify(intent), rep.txHash, rep.onChainOrderId, rep.rejectReason, rep.ts, rep.ts);
    publish('execution', 'execution.report', rep, IS_DRY());
    return rep;
  }

  async execute(intent: OrderIntent): Promise<ER> {
    const row = await requireMarket(this.markets, intent.symbol);
    if (!intent.limitPriceUsdso) {
      return this.record(intent, { state: 'REJECTED', rejectReason: 'E_NO_LIMIT_PRICE' });
    }
    const priceRaw = parseUnits(intent.limitPriceUsdso, Number(row.quoteDecimals));
    const sizeProbe = await this.markets.client.getMaxPerpOrderSize({
      pool: row.poolAddress,
      marginBank: row.marginBank,
      account: account(),
      isBid: intent.side === 'buy',
      price: priceRaw,
    });
    if (sizeProbe.priceable === false) {
      return this.record(intent, { state: 'REJECTED', rejectReason: 'E_MARK_NOT_PRICEABLE' });
    }
    const qtyHuman = Number(intent.notionalUsdso) / Number(formatUnits(priceRaw, Number(row.quoteDecimals)));
    const qtyRaw = parseUnits(qtyHuman.toFixed(12), Number(row.baseDecimals));

    if (IS_DRY()) {
      log.info({ intent, qtyHuman, priceUsdso: intent.limitPriceUsdso }, 'DRY_RUN: order NOT sent');
      return this.record(intent, { state: 'REJECTED', rejectReason: 'DRY_RUN_BLOCKED' });
    }

    try {
      this.record(intent, { state: 'PREFLIGHT' });
      const tx = await this.markets.trader.placePerpOrder({
        pool: row.poolAddress,
        isBid: intent.side === 'buy',
        price: priceRaw,
        quantity: qtyRaw,
        orderType: orderTypeFor(intent.tif),
        gas: GAS_LIMIT,
      });
      const hash = tx.hash;
      const rcpt: TransactionReceipt = tx.receipt;
      this.record(intent, { state: 'SUBMITTED', txHash: hash });
      const ok = rcpt.status === 'success';
      this.record(intent, { state: 'MINED', txHash: hash, gasUsed: rcpt.gasUsed != null ? String(rcpt.gasUsed) : null, onChainOrderId: tx.orderId != null ? String(tx.orderId) : null });
      if (!ok) return this.record(intent, { state: 'REJECTED', txHash: hash, rejectReason: 'REVERTED_RECEIPT' });
      // A mined success can still be a rejected order (no fill and no resting id).
      if (!tx.orderId && tx.fills.length === 0) {
        return this.record(intent, { state: 'REJECTED', txHash: hash, rejectReason: 'SILENT_REJECT' });
      }
      return this.record(intent, { state: 'CONFIRMED', txHash: hash, onChainOrderId: tx.orderId != null ? String(tx.orderId) : null });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const known: Record<string, string> = {
        '0xd48c4403': 'ImmediateOrCancelNoFill()',
        '0x714b36d6': 'MaxPositionSizeExceeded()',
        '0x3a23d825': 'InsufficientCollateral()',
      };
      const sel = known[msg.slice(0, 10).toLowerCase()];
      return this.record(intent, { state: 'REJECTED', rejectReason: sel ?? msg.slice(0, 300) });
    }
  }
}
