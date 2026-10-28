import { describe, it, expect } from 'vitest';
import { ExecutionAgent } from '../src/agents/execution.ts';
import { OrderIntent } from '../src/agents/schemas.ts';
import type { Markets } from '../src/sdk.ts';

const called: string[] = [];
const markets = {
  client: {
    listPerpMarkets: async () => [{
      id: '0xpool', baseSymbol: 'ETH', poolAddress: '0xpool', marginBank: '0xbank',
      tickSize: '1', lotSize: '1', minQuantity: '1', baseDecimals: 18, quoteDecimals: 18, marketType: 'PERP',
    }],
    getMaxPerpOrderSize: async () => ({ priceable: true, placeable: true, maxQuantity: 10n ** 24n, limitedBy: 'none', maxPositionSize: 10n ** 24n }),
    getOwnOpenOrdersOnchain: async () => { called.push('orders'); return []; },
  },
  trader: { placePerpOrder: async () => { called.push('place'); throw new Error('broadcast'); } },
} as unknown as Markets;

const agent = new ExecutionAgent(markets);

it('dry-run cancel-all does not touch the trader', async () => {
  called.length = 0;
  const rep = await agent.cancelAll();
  expect(rep.state).toBe('REJECTED');
  expect(rep.rejectReason).toBe('DRY_RUN_BLOCKED');
  expect(called).toEqual([]);
});

it('dry-run cancel-one does not touch the trader', async () => {
  called.length = 0;
  const rep = await agent.cancelOrder('1');
  expect(rep.rejectReason).toBe('DRY_RUN_BLOCKED');
  expect(called).toEqual([]);
});

it('dry-run reduce does not broadcast', async () => {
  called.length = 0;
  const intent = OrderIntent.parse({
    id: crypto.randomUUID(), symbol: 'ETH-PERP', side: 'sell', reduceOnly: true,
    notionalUsdso: '10', qtyBase: '0.02', tif: 'IOC', limitPriceUsdso: '3000', origin: 'copilot',
  });
  const rep = await agent.reduce(intent, '0.01');
  expect(rep.rejectReason).toBe('DRY_RUN_BLOCKED');
  expect(called).not.toContain('place');
});
