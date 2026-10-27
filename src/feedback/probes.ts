import { parseUnits, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ORDER_TYPE } from '@somnia-chain/markets-sdk';
import { cfg, GAS_LIMIT } from '../config.ts';
import { initSdk, requireMarket } from '../sdk.ts';
import { getMarketRow } from '../indexer.ts';

export type Severity = 'critical' | 'major' | 'normal';
export type Area = 'API' | 'SDK' | 'docs' | 'app' | 'contracts';

export interface ProbeResult {
  steps: string[];
  expected: string;
  actual: string;
  evidence: string[];
  observedSeverity?: Severity;
}

export interface ProbeSpec {
  id: string;
  fileSlug: string;
  title: string;
  severity: Severity;
  area: Area;
  run: () => Promise<ProbeResult>;
}

const ORDER_TYPE_FOR = {
  GTC: ORDER_TYPE.LIMIT,
  IOC: ORDER_TYPE.MARKET,
  FOK: ORDER_TYPE.FILL_OR_KILL,
  ALO: ORDER_TYPE.POST_ONLY,
} as const;

function signer(): Address {
  return privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`).address;
}

function gate(id: string): void {
  if (process.env.RUN_CHAIN_PROBES !== '1') {
    throw new Error(`${id} broadcasts. Refusing without RUN_CHAIN_PROBES=1 (TASK-9.1).`);
  }
}

export async function placeAndCapture(opts: {
  symbol?: string;
  isBid: boolean;
  priceRaw: bigint;
  qtyRaw: bigint;
  tif: keyof typeof ORDER_TYPE_FOR;
}) {
  const markets = initSdk();
  const row = await requireMarket(markets, opts.symbol ?? cfg.SYMBOL);
  const evidence: string[] = [];
  try {
    const tx = await markets.trader.placePerpOrder({
      pool: row.poolAddress,
      isBid: opts.isBid,
      price: opts.priceRaw,
      quantity: opts.qtyRaw,
      orderType: ORDER_TYPE_FOR[opts.tif],
      gas: GAS_LIMIT,
    });
    evidence.push(`tx: ${tx.hash} (${cfg.EXPLORER_TX_BASE}${tx.hash})`);
    evidence.push(`receipt status: ${tx.receipt.status}`);
    evidence.push(`gas: ${String(tx.receipt.gasUsed)}`);
    evidence.push(`orderId: ${tx.orderId == null ? 'none' : String(tx.orderId)} fills: ${tx.fills.length}`);
    evidence.push(`raw: ${JSON.stringify({ status: tx.receipt.status, orderId: tx.orderId == null ? null : String(tx.orderId) }).slice(0, 400)}`);
    return { evidence, rejectReason: null as string | null, txHash: tx.hash, row, markets };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const sel = msg.match(/0x[0-9a-fA-F]{8}/);
    evidence.push(`revert: ${sel?.[0] ?? 'no selector in message'}`);
    evidence.push(`raw: ${msg.slice(0, 400)}`);
    return { evidence, rejectReason: msg.slice(0, 300), txHash: null as string | null, row, markets };
  }
}

async function p01(): Promise<ProbeResult> {
  const cap = await placeAndCapture({ isBid: true, priceRaw: parseUnits('2000', 18), qtyRaw: parseUnits('0.01', 6), tif: 'GTC' });
  return {
    steps: ['Size an intended 0.01 ETH as parseUnits("0.01", 6) instead of 18.', 'Submit a resting ETH-PERP bid at 2000 USDso.', 'Record the revert selector.'],
    expected: 'A decimal-aware error, not a collateral failure.',
    actual: cap.rejectReason ?? 'order was accepted',
    evidence: cap.evidence,
  };
}

async function p02(): Promise<ProbeResult> {
  const row = await requireMarket(initSdk(), cfg.SYMBOL);
  const cap = await placeAndCapture({ isBid: true, priceRaw: 0n, qtyRaw: BigInt(row.minQuantity), tif: 'GTC' });
  return {
    steps: ['Submit ETH-PERP limit price 0 with minQuantity.', 'Record whether 0 is treated as a market order or a literal price.'],
    expected: 'price 0 is a literal price and does not cross the book.',
    actual: cap.rejectReason ?? 'order accepted or mined',
    evidence: cap.evidence,
  };
}

async function p03(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  if (!health.priceable) return { steps: ['Need a fresh mark.'], expected: 'IOC revert 0xd48c4403', actual: 'mark not priceable', evidence: ['priceable:false'] };
  const price = health.markPrice * 95n / 100n;
  const cap = await placeAndCapture({ isBid: true, priceRaw: price, qtyRaw: BigInt(row.minQuantity), tif: 'IOC' });
  return {
    steps: ['Place an IOC bid 5% below the live mark.', 'SDK 0.32.1 has no batch placePerpOrders. Record the single-order revert.'],
    expected: 'ImmediateOrCancelNoFill selector 0xd48c4403.',
    actual: cap.rejectReason ?? 'IOC filled or rested',
    evidence: [...cap.evidence, 'batch: no placePerpOrders on Trader in @somnia-chain/markets-sdk@0.32.1'],
  };
}

async function p04(): Promise<ProbeResult> {
  const row = await requireMarket(initSdk(), cfg.SYMBOL);
  const tick = BigInt(row.tickSize);
  const lot = BigInt(row.lotSize);
  const cap = await placeAndCapture({ isBid: true, priceRaw: tick + 1n, qtyRaw: lot + 1n, tif: 'GTC' });
  return {
    steps: ['Price = tickSize + 1 wei.', 'Quantity = lotSize + 1 wei.', 'Capture the revert text.'],
    expected: 'A constraint error that names tick or lot.',
    actual: cap.rejectReason ?? 'order accepted',
    evidence: cap.evidence,
  };
}

async function p05(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  if (!health.priceable) return { steps: ['Read max size.'], expected: 'maxQuantity matches the largest successful order', actual: 'mark not priceable', evidence: ['priceable:false'] };
  const quote = await markets.client.getMaxPerpOrderSize({ pool: row.poolAddress, marginBank: row.marginBank, account: signer(), isBid: true, price: health.markPrice });
  const evidence = [quote.priceable ? `maxQuantity ${quote.maxQuantity} limitedBy ${quote.limitedBy} placeable ${quote.placeable}` : 'priceable:false'];
  return {
    steps: ['Read getMaxPerpOrderSize at the mark.', 'A 10-step ramp of live orders is deferred until TASK-9 so this read can be compared with fills.'],
    expected: 'maxQuantity equals the largest order that succeeds.',
    actual: 'Read recorded. Ramp not sent in this invocation.',
    evidence,
    observedSeverity: 'normal',
  };
}

async function p06(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  const price = health.priceable ? health.markPrice : parseUnits('2000', 18);
  const quote = health.priceable
    ? await markets.client.getMaxPerpOrderSize({ pool: row.poolAddress, marginBank: row.marginBank, account: signer(), isBid: true, price })
    : null;
  const capQty = quote && quote.priceable ? quote.maxPositionSize + quote.lotSize : parseUnits('1000000', 18);
  const cap = await placeAndCapture({ isBid: true, priceRaw: price, qtyRaw: capQty, tif: 'GTC' });
  return {
    steps: ['Read maxPositionSize from getMaxPerpOrderSize when priceable.', 'Submit quantity above that cap.', 'Capture selector 0x714b36d6 if present.'],
    expected: 'MaxPositionSizeExceeded 0x714b36d6 and a readable cap in the API.',
    actual: cap.rejectReason ?? 'order accepted',
    evidence: [...(quote && quote.priceable ? [`maxPositionSize: ${quote.maxPositionSize}`, `limitedBy: ${quote.limitedBy}`] : ['size quote unavailable']), ...cap.evidence],
  };
}

async function p07(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const registry = row.stopRegistry;
  const evidence = [`stopRegistry: ${registry ?? 'null'}`, 'docs: USDso-only voucher accounts cannot place stops (0.15 STT each). https://app.dreamdex.io/docs/trading/perps-testnet/orders'];
  if (!registry) {
    return { steps: ['Read PerpMarket.stopRegistry.', 'Attempt placePerpStopOrder only if a registry exists.'], expected: 'Stop placement fails for a voucher-only account.', actual: 'ETH-PERP stopRegistry is null.', evidence };
  }
  try {
    const tx = await markets.trader.placePerpStopOrder({
      registry,
      pool: row.poolAddress,
      isBid: false,
      quantity: BigInt(row.minQuantity),
      triggerPrice: parseUnits('1000', 18),
      triggerOperator: 1,
      stopOrderType: 0,
      limitPrice: parseUnits('1000', 18),
      gas: GAS_LIMIT,
    });
    evidence.push(`tx: ${tx.hash} (${cfg.EXPLORER_TX_BASE}${tx.hash})`);
    return { steps: ['Call placePerpStopOrder on ETH-PERP from the bot signer.'], expected: 'Revert for a USDso-only account.', actual: 'stop tx mined', evidence };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    evidence.push(`revert: ${msg.slice(0, 300)}`);
    return { steps: ['Call placePerpStopOrder on ETH-PERP from the bot signer.'], expected: 'Revert for a USDso-only account.', actual: msg.slice(0, 300), evidence };
  }
}

async function p08(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, 'ZEC-PERP');
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  const price = health.priceable ? health.markPrice : parseUnits('100', 18);
  const quote = await markets.client.getMaxPerpOrderSize({ pool: row.poolAddress, marginBank: row.marginBank, account: signer(), isBid: true, price });
  const evidence = [quote.priceable ? `limitedBy: ${quote.limitedBy} maxQuantity: ${quote.maxQuantity} placeable: ${quote.placeable}` : 'priceable:false'];
  if (quote.priceable && quote.limitedBy === 'voucherBlocked') {
    const cap = await placeAndCapture({ symbol: 'ZEC-PERP', isBid: true, priceRaw: price, qtyRaw: quote.minQuantity || 1n, tif: 'GTC' });
    evidence.push(...cap.evidence);
  }
  return {
    steps: ['Read getMaxPerpOrderSize on ZEC-PERP for the bot account.', 'If limitedBy is voucherBlocked, attempt one order and record the revert.'],
    expected: 'limitedBy "voucherBlocked" for a voucher account on ZEC-PERP.',
    actual: quote.priceable ? `limitedBy ${quote.limitedBy}` : 'mark not priceable',
    evidence,
  };
}

async function p09(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  let maxLag = 0;
  let inversions = 0;
  let prevChain = 0n;
  const samples: string[] = [];
  for (let i = 0; i < 150; i++) {
    const g = await getMarketRow(row.baseSymbol ?? 'ETH');
    const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
    const chain = health.priceable ? health.markPrice : 0n;
    const indexed = BigInt(g?.markPrice ?? '0');
    const lag = chain > indexed ? Number(chain - indexed) : Number(indexed - chain);
    if (lag > maxLag) maxLag = lag;
    if (i > 0 && chain !== prevChain && indexed === chain) inversions += 0;
    if (i > 0 && ((chain > prevChain && indexed < prevChain) || (chain < prevChain && indexed > prevChain))) inversions += 1;
    if (i % 30 === 0) samples.push(`t=${i * 2}s chain=${chain} index=${indexed}`);
    prevChain = chain;
    await new Promise(r => setTimeout(r, 2000));
  }
  return {
    steps: ['Every 2s for 5 minutes, read GraphQL Market.markPrice and getPerpHealthSnapshot().markPrice.', 'Report max absolute lag and direction inversions.'],
    expected: 'Indexer mark tracks the chain mark within one funding tick.',
    actual: `max abs lag raw ${maxLag}; inversions ${inversions}`,
    evidence: samples,
  };
}

async function p10(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const before = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  await markets.close();
  const t0 = Date.now();
  await new Promise(r => setTimeout(r, 30_000));
  const again = initSdk();
  const row2 = await requireMarket(again, cfg.SYMBOL);
  const after = await again.client.getPerpHealthSnapshot(row2.poolAddress);
  return {
    steps: ['Read priceable.', 'Call markets.close() and wait 30s (no host firewall).', 'Open a new client and read priceable again.'],
    expected: 'A dropped socket surfaces priceable:false until the feed recovers.',
    actual: `before ${before.priceable}; after ${after.priceable}; recoveryMs ${Date.now() - t0}`,
    evidence: [`before priceable: ${before.priceable}`, `after priceable: ${after.priceable}`, 'transport drop was SDK close(), not a firewall rule'],
  };
}

async function p11(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const evidence = ['No resting order id was supplied. Double-cancel needs an order placed in TASK-9.'];
  try {
    await markets.trader.cancelOrder({ pool: row.poolAddress, orderId: 1n, gas: GAS_LIMIT });
    evidence.push('first cancel of orderId 1 returned without throw');
  } catch (e) {
    evidence.push(`first cancel: ${String(e instanceof Error ? e.message : e).slice(0, 240)}`);
  }
  try {
    await markets.trader.cancelOrder({ pool: row.poolAddress, orderId: 1n, gas: GAS_LIMIT });
    evidence.push('second cancel returned without throw');
  } catch (e) {
    evidence.push(`second cancel: ${String(e instanceof Error ? e.message : e).slice(0, 240)}`);
  }
  return {
    steps: ['Cancel orderId 1 twice on ETH-PERP.', 'A filled-order cancel is recorded when TASK-9 has a real fill id.'],
    expected: 'Second cancel is idempotent or returns a stable error.',
    actual: evidence.slice(1).join(' | ') || 'no result',
    evidence,
  };
}

const chain: Array<[string, Omit<ProbeSpec, 'run'>, () => Promise<ProbeResult>]> = [
  ['P-01', { id: 'P-01', fileSlug: 'P01-perp-order-wrong-decimals-misleads-insufficient-collateral', title: 'ETH-PERP order sized with 6 decimals reverts as InsufficientCollateral', severity: 'major', area: 'contracts' }, p01],
  ['P-02', { id: 'P-02', fileSlug: 'P02-perp-limit-price-zero-is-literal-price', title: 'Perp limit price 0 is a literal price', severity: 'normal', area: 'contracts' }, p02],
  ['P-03', { id: 'P-03', fileSlug: 'P03-ioc-unfilled-reverts-immediateorcancelnofill', title: 'Unfilled IOC reverts ImmediateOrCancelNoFill', severity: 'major', area: 'contracts' }, p03],
  ['P-04', { id: 'P-04', fileSlug: 'P04-off-tick-price-and-non-lot-quantity-error-quality', title: 'Off-tick price and non-lot quantity error quality', severity: 'normal', area: 'contracts' }, p04],
  ['P-05', { id: 'P-05', fileSlug: 'P05-getmaxperpordersize-vs-onchain-cap-divergence', title: 'getMaxPerpOrderSize versus the order that actually succeeds', severity: 'normal', area: 'API' }, p05],
  ['P-06', { id: 'P-06', fileSlug: 'P06-maxpositionsizesexceeded-error-surface', title: 'MaxPositionSizeExceeded error surface', severity: 'major', area: 'contracts' }, p06],
  ['P-07', { id: 'P-07', fileSlug: 'P07-stop-orders-blocked-for-usdso-only-voucher-accounts', title: 'Stop orders blocked for USDso-only voucher accounts', severity: 'major', area: 'contracts' }, p07],
  ['P-08', { id: 'P-08', fileSlug: 'P08-voucher-claim-blocked-markets-limitedby', title: 'Voucher-blocked market reports limitedBy voucherBlocked', severity: 'normal', area: 'SDK' }, p08],
  ['P-09', { id: 'P-09', fileSlug: 'P09-indexer-markprice-lag-vs-chain-mark', title: 'Indexer markPrice lag versus the chain mark', severity: 'major', area: 'API' }, p09],
  ['P-10', { id: 'P-10', fileSlug: 'P10-stale-mark-priceable-false-after-ws-outage', title: 'Stale mark sets priceable false after a socket drop', severity: 'major', area: 'SDK' }, p10],
  ['P-11', { id: 'P-11', fileSlug: 'P11-cancel-idempotency-double-cancel-and-cancel-filled', title: 'Cancel idempotency for a double cancel and a filled order', severity: 'normal', area: 'contracts' }, p11],
];

export const PROBES: Record<string, ProbeSpec> = Object.fromEntries(chain.map(([id, spec, exec]) => [id, { ...spec, run: async () => { gate(id); return exec(); } }]));

PROBES['P-12'] = {
  id: 'P-12',
  fileSlug: 'P12-tokyo-hideki-shannon-network-naming-and-faucet-gap',
  title: 'Tokyo, hidekiTestnet, and Shannon are documented as different networks',
  severity: 'major',
  area: 'docs',
  async run() {
    return {
      observedSeverity: 'major',
      steps: [
        'Open the bounty brief: it names Somnia Tokyo testnet.',
        'Import hidekiTestnet from @somnia-chain/markets-sdk/chains and read its id.',
        'Open the Tokyo explorer path /tokyo.',
        'Open the dreamDEX HTTP API environment table and the Somnia faucet.',
      ],
      expected: 'One network name, one chain id, and a faucet that pays that chain.',
      actual: 'The same chain is Tokyo in the bounty and explorer path, hidekiTestnet (id 50383, display name "Hideki Testnet") in the SDK, and absent from the HTTP API table, which lists only Shannon 50312 and mainnet 5031. The public faucet at testnet.somnia.network pays Shannon 50312 only. A developer who follows Somnia network docs never finds chain 50383.',
      evidence: [
        'SDK: hidekiTestnet.id = 50383, name "Hideki Testnet", default websocket wss://api.hideki2.infra.testnet.somnia.network/ws. The chain object sets no block explorer. Source: node_modules/@somnia-chain/markets-sdk/dist/chains/definitions/hidekiTestnet.d.ts (package 0.32.1).',
        'Explorer path used by this repo: https://explorer.testnet.somnia.network/tokyo',
        'dreamDEX HTTP API environments (docs index verified 2026-10-20): mainnet chain 5031 https://api.dreamdex.io/v0 ; Shannon testnet chain 50312 https://stg.api.dreamdex.io/v0 . No 50383 row. https://app.dreamdex.io/docs/developers/http-api',
        'Faucet: https://testnet.somnia.network/ serves Shannon 50312 only. Confirmed while funding this bot on 2026-10-27. No public faucet for 50383. Gas arrived from the dreamDEX app bot-link top-up.',
      ],
    };
  },
};

PROBES['P-13'] = {
  id: 'P-13',
  fileSlug: 'P13-docs-imply-rest-for-perps-but-http-api-is-spot-only',
  title: 'Docs route integrators to REST, which does not serve perps',
  severity: 'major',
  area: 'docs',
  async run() {
    return {
      observedSeverity: 'major',
      steps: [
        'Start at the developer overview, which offers contracts, REST, and WebSocket.',
        'Follow Quick Start, which includes a REST flow.',
        'Open the perps developer page.',
        'Compare with the HTTP API environment table.',
      ],
      expected: 'The perps quick path names SDK plus GraphQL, and does not send the reader to the spot HTTP API.',
      actual: 'The developer overview and quick start present REST as a first-class integration. The HTTP API table has no Tokyo/50383 host. Perps on this repo are SDK plus the hideki GraphQL indexer only. A new integrator who copies the REST quick start has no perps endpoints to call.',
      evidence: [
        'https://app.dreamdex.io/docs/developers — integration choices include REST.',
        'https://app.dreamdex.io/docs/welcome/quick-start — first order via CLI, REST, or contracts.',
        'https://app.dreamdex.io/docs/developers/perps-testnet — perps developer surface.',
        'https://app.dreamdex.io/docs/developers/http-api — environments are chain 5031 and Shannon 50312 only.',
        'Local indexer used for perps reads: https://hideki-dev.smk.somnia.host/v1/graphql . No perps REST client exists in this repo.',
      ],
    };
  },
};

PROBES['P-14'] = {
  id: 'P-14',
  fileSlug: 'P14-bot-kit-perp-core-pins-caret-0-31-never-gets-0-32',
  title: 'bot-kit perp-core caret-pins markets-sdk ^0.31.0',
  severity: 'normal',
  area: 'SDK',
  async run() {
    return {
      observedSeverity: 'normal',
      steps: [
        'Open somnia-chain/dreamdex-bot-kit packages/perp-core/package.json on main.',
        'Read the @somnia-chain/markets-sdk dependency.',
        'Compare with the version named by current perps docs (0.32.1).',
      ],
      expected: 'The reference perps package accepts the documented SDK line.',
      actual: 'On 2026-10-27, main pins "@somnia-chain/markets-sdk": "^0.31.0". For 0.x, a caret range allows only compatible patch updates, so ^0.31.0 means >=0.31.0 <0.32.0. npm will never install 0.32.1 into that package. This repo pins 0.32.1 exactly because the 0.32 constructor (wsRpcUrl, indexerUrl, placePerpOrder receipt) is what the live typings describe.',
      evidence: [
        'https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/packages/perp-core/package.json',
        'Fetched 2026-10-27 from https://raw.githubusercontent.com/somnia-chain/dreamdex-bot-kit/main/packages/perp-core/package.json — dependencies["@somnia-chain/markets-sdk"] === "^0.31.0".',
        'Installed in this repo: @somnia-chain/markets-sdk@0.32.1.',
      ],
    };
  },
};
