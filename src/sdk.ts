import { cfg } from './config.ts';
// NOTE: constructor shape below follows the installed .d.ts (TASK-2.4), not the
// backlog draft. ClientConfig uses `wsRpcUrl` (not `rpcUrl`) and `indexerUrl`
// (listPerpMarkets is an indexer read). Chain object is hidekiTestnet.
// Recorded in docs/sdk-api.md under Deviations from docs.
import { SomniaMarkets } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import type { PrivateKeyAccount } from 'viem';

export type Markets = SomniaMarkets;

export function initSdk(account?: PrivateKeyAccount): Markets {
  const key = cfg.BOT_PRIVATE_KEY;
  return new SomniaMarkets({
    chain: hidekiTestnet,
    wsRpcUrl: cfg.RPC_URL_WS,
    indexerUrl: cfg.GRAPHQL_URL,
    privateKey: account || !key ? undefined : (key as `0x${string}`),
    account,
  });
}

export async function requireMarket(markets: Markets, symbol = cfg.SYMBOL) {
  const base = symbol.replace(/-PERP$/i, '');
  const all = await markets.client.listPerpMarkets();
  const row = all.find((m) => String(m.baseSymbol).toUpperCase() === base.toUpperCase());
  if (!row) throw new Error(`Perp market not found for ${symbol}. Have: ${all.map(m => m.baseSymbol).join(',')}`);
  return row;
}
