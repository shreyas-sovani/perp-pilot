import { createPublicClient, createWalletClient, http, parseAbi, parseUnits, formatUnits, type Address, type Hash, type TransactionReceipt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ORDER_TYPE, contractErrorsAbi, decodePlaceOrder } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { cfg, GAS_LIMIT, IS_DRY } from '../config.ts';
import { initSdk, requireMarket, type Markets } from '../sdk.ts';
import { db } from '../db.ts';
import { publish } from '../bus.ts';
import { OrderIntent, ExecutionReport, type ExecutionReport as ER } from './schemas.ts';
import { log } from '../logger.ts';

// The markets SDK has no perp placeOrderFor. Official perp-core sends it with viem.
// https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/packages/perp-core/src/operator.ts
// placeOrderFor / cancelOrderFor are not SDK methods. Argument lists are the ones
// whose selectors equal PLACE_ORDER_FOR_SELECTOR and CANCEL_ORDER_FOR_SELECTOR
// (docs/sdk-api.md). There is no cancelAllOrdersFor or reduceOrderFor.
const OPERATOR_ABI = [
  ...parseAbi([
    'function placeOrderFor(address owner, bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k) payable returns (bool success, uint128 orderId)',
    'function cancelOrderFor(address owner, uint128 orderId)',
  ]),
  ...contractErrorsAbi,
] as const;

function orderTypeFor(tif: OrderIntent['tif']): number {
  if (tif === 'IOC') return ORDER_TYPE.MARKET;
  if (tif === 'FOK') return ORDER_TYPE.FILL_OR_KILL;
  if (tif === 'ALO') return ORDER_TYPE.POST_ONLY;
  return ORDER_TYPE.LIMIT;
}

function marginAccount(): Address {
  if (cfg.OWNER_ADDRESS) return cfg.OWNER_ADDRESS as Address;
  return privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`).address;
}

function alignTick(price: bigint, tick: bigint, side: 'buy' | 'sell'): bigint {
  if (tick <= 1n) return price;
  const rem = price % tick;
  if (rem === 0n) return price;
  if (side === 'buy') return price - rem + tick;
  const down = price - rem;
  return down > 0n ? down : tick;
}

function alignLot(qty: bigint, lot: bigint, minQty: bigint): bigint {
  const step = lot > 0n ? lot : 1n;
  let q = qty - (qty % step);
  if (q < minQty) q = minQty - (minQty % step);
  return q;
}

function farFutureNs(): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + 50 * 365 * 24 * 3600) * 1_000_000_000n;
}

export class ExecutionAgent {
  private markets: Markets;
  constructor(markets?: Markets) { this.markets = markets ?? initSdk(); }

  private record(intent: OrderIntent, patch: Partial<ER>): ER {
    const rep = ExecutionReport.parse({ intentId: intent.id, state: 'PREFLIGHT', txHash: null, onChainOrderId: null, rejectReason: null, gasUsed: null, ts: Date.now(), ...patch });
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

  private async placeFor(pool: Address, isBid: boolean, price: bigint, quantity: bigint, orderType: number): Promise<{ hash: Hash; receipt: TransactionReceipt; orderId?: bigint; fills: number }> {
    const account = privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`);
    const transport = http(cfg.RPC_URL_HTTP);
    const publicClient = createPublicClient({ chain: hidekiTestnet, transport });
    const walletClient = createWalletClient({ account, chain: hidekiTestnet, transport });
    const owner = marginAccount();
    const args = [owner, isBid, 0n, price, quantity, farFutureNs(), orderType, 0, '0x0000000000000000000000000000000000000000', 0n] as const;
    const { request } = await publicClient.simulateContract({
      address: pool,
      abi: OPERATOR_ABI,
      functionName: 'placeOrderFor',
      args,
      account,
      gas: GAS_LIMIT,
    });
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const decoded = decodePlaceOrder(receipt, pool);
    return { hash, receipt, orderId: decoded.orderId, fills: decoded.fills.length };
  }

  private controlIntent(symbol: string, side: 'buy' | 'sell' = 'sell'): OrderIntent {
    return OrderIntent.parse({
      id: crypto.randomUUID(), symbol, side, reduceOnly: true,
      notionalUsdso: '0', tif: 'GTC', limitPriceUsdso: null, origin: 'copilot',
    });
  }

  async cancelAll(symbol = cfg.SYMBOL): Promise<ER> {
    const intent = this.controlIntent(symbol);
    if (IS_DRY()) return this.record(intent, { state: 'REJECTED', rejectReason: 'DRY_RUN_BLOCKED' });
    const row = await requireMarket(this.markets, symbol);
    const owner = marginAccount();
    const ids = await this.markets.client.getOwnOpenOrdersOnchain(row.poolAddress, owner);
    if (ids.length === 0) return this.record(intent, { state: 'CONFIRMED', rejectReason: 'NO_RESTING_ORDERS' });
    try {
      for (const id of ids) await this.cancelFor(row.poolAddress, id);
      return this.record(intent, { state: 'CONFIRMED' });
    } catch (e) {
      return this.record(intent, { state: 'REJECTED', rejectReason: String((e as Error).message ?? e).slice(0, 300) });
    }
  }

  async cancelOrder(orderId: string, symbol = cfg.SYMBOL): Promise<ER> {
    const intent = this.controlIntent(symbol);
    if (IS_DRY()) return this.record(intent, { state: 'REJECTED', rejectReason: 'DRY_RUN_BLOCKED' });
    const row = await requireMarket(this.markets, symbol);
    try {
      const tx = await this.cancelFor(row.poolAddress, BigInt(orderId));
      return this.record(intent, { state: tx.receipt.status === 'success' ? 'CONFIRMED' : 'REJECTED', txHash: tx.hash, onChainOrderId: orderId });
    } catch (e) {
      return this.record(intent, { state: 'REJECTED', rejectReason: String((e as Error).message ?? e).slice(0, 300) });
    }
  }

  /** No reduce-only place entry exists. Shrink by an opposite order capped at the position qty. */
  async reduce(intent: OrderIntent, positionQtyBase: string): Promise<ER> {
    const cap = Number(positionQtyBase);
    const requested = intent.qtyBase != null ? Number(intent.qtyBase) : cap;
    const qtyBase = String(Math.min(Math.abs(requested), Math.abs(cap)));
    return this.execute({ ...intent, reduceOnly: true, qtyBase });
  }

  private async cancelFor(pool: Address, orderId: bigint): Promise<{ hash: Hash; receipt: TransactionReceipt }> {
    const account = privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`);
    const transport = http(cfg.RPC_URL_HTTP);
    const publicClient = createPublicClient({ chain: hidekiTestnet, transport });
    const walletClient = createWalletClient({ account, chain: hidekiTestnet, transport });
    const { request } = await publicClient.simulateContract({
      address: pool,
      abi: OPERATOR_ABI,
      functionName: 'cancelOrderFor',
      args: [marginAccount(), orderId],
      account,
      gas: GAS_LIMIT,
    });
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return { hash, receipt };
  }

  async execute(intent: OrderIntent): Promise<ER> {
    const row = await requireMarket(this.markets, intent.symbol);
    if (!intent.limitPriceUsdso) {
      return this.record(intent, { state: 'REJECTED', rejectReason: 'E_NO_LIMIT_PRICE' });
    }
    const tick = BigInt(row.tickSize);
    const lot = BigInt(row.lotSize);
    const minQty = BigInt(row.minQuantity);
    const priceRaw = alignTick(parseUnits(intent.limitPriceUsdso, Number(row.quoteDecimals)), tick, intent.side);
    const sizeProbe = await this.markets.client.getMaxPerpOrderSize({
      pool: row.poolAddress,
      marginBank: row.marginBank,
      account: marginAccount(),
      isBid: intent.side === 'buy',
      price: priceRaw,
    });
    if (sizeProbe.priceable === false) {
      return this.record(intent, { state: 'REJECTED', rejectReason: 'E_MARK_NOT_PRICEABLE' });
    }
    if (!sizeProbe.placeable) {
      return this.record(intent, { state: 'REJECTED', rejectReason: `E_NOT_PLACEABLE:${sizeProbe.limitedBy}` });
    }
    const qtyHuman = Number(intent.notionalUsdso) / Number(formatUnits(priceRaw, Number(row.quoteDecimals)));
    let qtyRaw = intent.qtyBase
      ? alignLot(parseUnits(intent.qtyBase, Number(row.baseDecimals)), lot, minQty)
      : alignLot(parseUnits(qtyHuman.toFixed(12), Number(row.baseDecimals)), lot, minQty);
    if (!intent.qtyBase && qtyRaw > sizeProbe.maxQuantity) qtyRaw = sizeProbe.maxQuantity - (sizeProbe.maxQuantity % (lot > 0n ? lot : 1n));
    if (qtyRaw < minQty) {
      return this.record(intent, { state: 'REJECTED', rejectReason: 'E_BELOW_MIN_QTY' });
    }

    if (IS_DRY()) {
      log.info({ intent, qtyHuman: formatUnits(qtyRaw, Number(row.baseDecimals)), priceRaw: priceRaw.toString() }, 'DRY_RUN: order NOT sent');
      return this.record(intent, { state: 'REJECTED', rejectReason: 'DRY_RUN_BLOCKED' });
    }

    try {
      this.record(intent, { state: 'PREFLIGHT' });
      const tx = cfg.OWNER_ADDRESS
        ? await this.placeFor(row.poolAddress, intent.side === 'buy', priceRaw, qtyRaw, orderTypeFor(intent.tif))
        : await this.placeOwn(row.poolAddress, intent.side === 'buy', priceRaw, qtyRaw, orderTypeFor(intent.tif));
      const hash = tx.hash;
      this.record(intent, { state: 'SUBMITTED', txHash: hash });
      const ok = tx.receipt.status === 'success';
      this.record(intent, { state: 'MINED', txHash: hash, gasUsed: tx.receipt.gasUsed != null ? String(tx.receipt.gasUsed) : null, onChainOrderId: tx.orderId != null ? String(tx.orderId) : null });
      if (!ok) return this.record(intent, { state: 'REJECTED', txHash: hash, rejectReason: 'REVERTED_RECEIPT' });
      if (!tx.orderId && tx.fills === 0) {
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

  private async placeOwn(pool: Address, isBid: boolean, price: bigint, quantity: bigint, orderType: number) {
    const tx = await this.markets.trader.placePerpOrder({ pool, isBid, price, quantity, orderType, gas: GAS_LIMIT });
    return { hash: tx.hash, receipt: tx.receipt, orderId: tx.orderId, fills: tx.fills.length };
  }
}
