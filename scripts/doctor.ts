import 'dotenv/config';
import { createPublicClient, webSocket, formatEther, formatUnits, type Address } from 'viem';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { cfg } from '../src/config.ts';
import { MarketDataAgent } from '../src/agents/marketData.ts';
import { getMarketRow, getLatestFundingUpdate, fundingAprFromRate } from '../src/indexer.ts';
import { initSdk, requireMarket } from '../src/sdk.ts';
import { syncAccount } from '../src/agents/accountSync.ts';
import { kv } from '../src/db.ts';

const line = (k: string, v: string, ok?: boolean) => console.log(`${ok === undefined ? ' ' : ok ? '✅' : '❌'} ${k.padEnd(28)} ${v}`);
const acct = cfg.BOT_PRIVATE_KEY ? privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`) : null;
const pub = createPublicClient({ chain: hidekiTestnet, transport: webSocket(cfg.RPC_URL_WS) });
const bal = acct ? await pub.getBalance({ address: acct.address }) : 0n;
line('network', `chain ${cfg.CHAIN_ID} (Tokyo/hideki), dry_run=${cfg.DRY_RUN}`);
line('bot wallet', acct?.address ?? 'NOT SET', !!acct);
line('gas STT', `${formatEther(bal)} STT`, bal > 10n ** 17n);
const sdk = initSdk();
const row = await requireMarket(sdk, cfg.SYMBOL);
line(`market ${cfg.SYMBOL}`, `pool ${row.poolAddress} decimals ${row.baseDecimals}/${row.quoteDecimals} tick ${row.tickSize}`, true);
const g = await getMarketRow(row.baseSymbol ?? '');
line('mark / index', `${g?.markPrice} / ${g?.indexPrice}`);
const f = g?.id ? await getLatestFundingUpdate(g.id).catch(() => null) : null;
line('funding rate', f ? `${f.fundingRate} (raw APR helper ${(fundingAprFromRate(f.fundingRate) * 100).toFixed(1)})` : 'no update yet');

async function health(label: string, address: Address) {
  try {
    const h = await sdk.client.getAccountHealth(row.marginBank, address);
    line(label, `equity ${formatUnits(h.equity, 18)} USDso status ${h.marginStatus}`, h.equity > 0n);
  } catch (e) {
    line(label, String((e as Error).message).slice(0, 180), false);
  }
  const elig = await sdk.client.getPerpVoucherEligibility(row.marginBank, address);
  line(`${label} voucher`, elig.eligible ? `eligible grant ${formatUnits(elig.grantAmount, 18)}` : `ineligible ${elig.reason}`);
}

if (acct) await health('bot margin', acct.address);
if (cfg.OWNER_ADDRESS) {
  await health('owner margin', cfg.OWNER_ADDRESS as Address);
  const synced = await syncAccount({
    reader: sdk.client as never,
    marginBank: row.marginBank,
    account: cfg.OWNER_ADDRESS as Address,
    pool: row.poolAddress,
    symbol: cfg.SYMBOL,
    baseDecimals: Number(row.baseDecimals),
    quoteDecimals: Number(row.quoteDecimals),
  });
  line('kv equityUsdso', `${kv.get('equityUsdso')} (sync ${synced.equityUsdso})`, kv.get('equityUsdso') === synced.equityUsdso);
}
const mda = new MarketDataAgent();
const s = await mda.snapshot();
line('priceable', String(s.priceable), s.priceable);
process.exit(0);
