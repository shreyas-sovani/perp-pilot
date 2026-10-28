import { formatUnits, type Address } from 'viem';
import { db, kv } from '../db.ts';
import { dayKey } from './risk.ts';

// getPerpPositionAnalytics has unrealizedPnl and accruedFunding, not realized PnL.
// Day realized is the sum of listPerpPositionChanges.realizedPnl (docs/sdk-api.md).
export interface AccountReader {
  getAccountHealth(marginBank: Address, account: Address): Promise<{ equity: bigint }>;
  getPerpPosition(ref: { marginBank: Address; account: Address; pool: Address }): Promise<{ size: bigint; avgEntryPrice: bigint }>;
  getPerpPositionAnalytics(ref: { marginBank: Address; account: Address; pool: Address }): Promise<
    | { priceable: true; unrealizedPnl: bigint; accruedFunding: bigint }
    | { priceable: false; size: bigint }
  >;
  listPerpPositionChanges(opts: {
    account?: string;
    pool?: string;
    from?: bigint;
    kinds?: readonly ('REDUCE' | 'CLOSE' | 'FLIP')[];
    limit?: number;
  }): Promise<{ realizedPnl: bigint }[]>;
}

function signed(v: bigint, decimals: number): string {
  const neg = v < 0n;
  return (neg ? '-' : '') + formatUnits(neg ? -v : v, decimals);
}

export async function syncAccount(input: {
  reader: AccountReader;
  marginBank: Address;
  account: Address;
  pool: Address;
  symbol: string;
  baseDecimals: number;
  quoteDecimals: number;
}): Promise<{ equityUsdso: string; unrealizedPnl: string; fundingOwed: string; flat: boolean }> {
  const ref = { marginBank: input.marginBank, account: input.account, pool: input.pool };
  const health = await input.reader.getAccountHealth(input.marginBank, input.account);
  const equityUsdso = signed(health.equity, input.quoteDecimals);
  kv.set('equityUsdso', equityUsdso);
  const anchorKey = `anchor:${dayKey()}`;
  if (!kv.get(anchorKey)) kv.set(anchorKey, equityUsdso);

  const pos = await input.reader.getPerpPosition(ref);
  const flat = pos.size === 0n;
  if (flat) {
    db.prepare('DELETE FROM positions WHERE symbol=?').run(input.symbol);
  } else {
    db.prepare(`INSERT INTO positions(symbol,qty,avgEntry,realizedPnl,openedAt,updatedAt) VALUES(?,?,?,?,?,?)
      ON CONFLICT(symbol) DO UPDATE SET qty=excluded.qty, avgEntry=excluded.avgEntry, updatedAt=excluded.updatedAt`)
      .run(input.symbol, signed(pos.size, input.baseDecimals), formatUnits(pos.avgEntryPrice < 0n ? 0n : pos.avgEntryPrice, input.quoteDecimals), '0', Date.now(), Date.now());
  }

  const analytics = await input.reader.getPerpPositionAnalytics(ref);
  const unrealizedPnl = analytics.priceable ? signed(analytics.unrealizedPnl, input.quoteDecimals) : '0';
  const fundingOwed = analytics.priceable ? signed(analytics.accruedFunding, input.quoteDecimals) : '0';
  const start = BigInt(Math.floor(Date.parse(`${dayKey()}T00:00:00.000Z`) / 1000));
  const changes = await input.reader.listPerpPositionChanges({
    account: input.account,
    pool: input.pool,
    from: start,
    kinds: ['REDUCE', 'CLOSE', 'FLIP'],
    limit: 1000,
  });
  const realizedRaw = changes.reduce((sum, row) => sum + row.realizedPnl, 0n);
  kv.set(`realized:${dayKey()}`, signed(realizedRaw, input.quoteDecimals));
  db.prepare('INSERT OR REPLACE INTO equity(ts,equityUsdso,unrealizedPnl,fundingOwed) VALUES(?,?,?,?)')
    .run(Date.now(), equityUsdso, unrealizedPnl, fundingOwed);
  return { equityUsdso, unrealizedPnl, fundingOwed, flat };
}
