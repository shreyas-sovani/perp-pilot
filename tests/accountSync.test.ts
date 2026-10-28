import { describe, it, expect } from 'vitest';
import type { Address } from 'viem';
import { syncAccount, type AccountReader } from '../src/agents/accountSync.ts';
import { db, kv } from '../src/db.ts';
import { dayKey } from '../src/agents/risk.ts';

const bank = '0x0000000000000000000000000000000000000001' as Address;
const account = '0x0000000000000000000000000000000000000002' as Address;
const pool = '0x0000000000000000000000000000000000000003' as Address;
const E18 = 10n ** 18n;

function reader(over: Partial<AccountReader> = {}): AccountReader {
  return {
    getAccountHealth: async () => ({ equity: 2000n * E18 }),
    getPerpPosition: async () => ({ size: 10n ** 16n, avgEntryPrice: 3000n * E18 }),
    getPerpPositionAnalytics: async () => ({ priceable: true, unrealizedPnl: 5n * E18, accruedFunding: 1n * E18 }),
    listPerpPositionChanges: async () => [{ realizedPnl: -2n * E18 }],
    ...over,
  };
}

const base = { marginBank: bank, account, pool, symbol: 'SYNC-TEST', baseDecimals: 18, quoteDecimals: 18 };

it('writes owner equity, signed position, and day realized', async () => {
  kv.set(`anchor:${dayKey()}`, '');
  db.prepare('DELETE FROM kv WHERE key=?').run(`anchor:${dayKey()}`);
  const out = await syncAccount({ reader: reader(), ...base });
  expect(out.equityUsdso).toBe('2000');
  expect(kv.get('equityUsdso')).toBe('2000');
  expect(kv.get(`anchor:${dayKey()}`)).toBe('2000');
  expect(kv.get(`realized:${dayKey()}`)).toBe('-2');
  const row = db.prepare('SELECT qty, avgEntry FROM positions WHERE symbol=?').get('SYNC-TEST') as { qty: string; avgEntry: string };
  expect(row.qty).toBe('0.01');
  expect(row.avgEntry).toBe('3000');
  const eq = db.prepare('SELECT unrealizedPnl, fundingOwed FROM equity ORDER BY ts DESC LIMIT 1').get() as { unrealizedPnl: string; fundingOwed: string };
  expect(eq.unrealizedPnl).toBe('5');
  expect(eq.fundingOwed).toBe('1');
});

it('deletes the position row when the chain size is flat', async () => {
  await syncAccount({
    reader: reader({ getPerpPosition: async () => ({ size: 0n, avgEntryPrice: 0n }) }),
    ...base,
  });
  const row = db.prepare('SELECT qty FROM positions WHERE symbol=?').get('SYNC-TEST');
  expect(row).toBeUndefined();
});

it('two marks produce a non-constant unrealized series', async () => {
  await syncAccount({ reader: reader(), ...base });
  await syncAccount({
    reader: reader({
      getPerpPositionAnalytics: async () => ({ priceable: true, unrealizedPnl: 9n * E18, accruedFunding: 1n * E18 }),
    }),
    ...base,
  });
  const rows = db.prepare('SELECT unrealizedPnl FROM equity ORDER BY ts DESC LIMIT 2').all() as { unrealizedPnl: string }[];
  expect(new Set(rows.map((r) => r.unrealizedPnl)).size).toBe(2);
});
