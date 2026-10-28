import { describe, it, expect, beforeEach } from 'vitest';
import { MarketDataAgent, markHistory } from '../src/agents/marketData.ts';
import type { Markets } from '../src/sdk.ts';

const row = {
  id: '0xabc',
  poolAddress: '0xabc',
  marginBank: '0xbank',
  baseSymbol: 'ETH',
  tickSize: '10000000000000000',
  lotSize: '4000000000000000',
  minQuantity: '4000000000000000',
  baseDecimals: 18,
  quoteDecimals: 18,
  marketType: 'PERP',
} as unknown as Awaited<ReturnType<Markets['client']['listPerpMarkets']>>[number];

function agent(health: { priceable: true; markPrice: bigint } | { priceable: false }, indexerMark = '1000') {
  const client = {
    getPerpHealthSnapshot: async () => health,
    getBookTopsOnchain: async () => ({
      blockNumber: 1n,
      tops: { '0xabc': { bestBid: '10', bestAsk: '12', mid: '11' } },
    }),
    getMaxPerpOrderSize: async () => ({ priceable: true, maxQuantity: 1n, limitedBy: 'none', placeable: true, maxPositionSize: 1n }),
  };
  return new MarketDataAgent({
    markets: { client } as unknown as Markets,
    marketRow: row,
    indexer: {
      getMarketRow: async () => ({ id: 'm1', markPrice: indexerMark, indexPrice: indexerMark, fundingRate: '0' }),
      getLatestFundingUpdate: async () => null,
    },
  });
}

beforeEach(() => { markHistory.length = 0; });

it('propagates priceable false and still fills the book', async () => {
  const snap = await agent({ priceable: false }).snapshot();
  expect(snap.priceable).toBe(false);
  expect(snap.markPrice).toBe('0');
  expect(snap.bestBid).toBe('10');
  expect(snap.bestAsk).toBe('12');
  expect(snap.markAgeMs).toBeGreaterThanOrEqual(0);
});

it('uses the chain mark and records indexer lag', async () => {
  const snap = await agent({ priceable: true, markPrice: 2500n }, '1000').snapshot();
  expect(snap.priceable).toBe(true);
  expect(snap.markPrice).toBe('2500');
  expect(snap.indexerMarkPrice).toBe('1000');
  expect(snap.indexerLagRaw).toBe('1500');
  expect(snap.bestBid).toBe('10');
  expect(snap.bestAsk).toBe('12');
});

it('parses a journal line that predates the indexer fields', async () => {
  const { MarketSnapshot } = await import('../src/agents/schemas.ts');
  const parsed = MarketSnapshot.parse({
    symbol: 'ETH-PERP', markPrice: '1', indexPrice: '1', markAgeMs: 0, priceable: true,
    fundingRate: '0', fundingApr: '0', bestBid: null, bestAsk: null,
    tickSize: '1', lotSize: '1', minQuantity: '1', baseDecimals: 18, quoteDecimals: 18, ts: 1,
  });
  expect(parsed.indexerMarkPrice).toBe('0');
  expect(parsed.indexerLagRaw).toBe('0');
});
