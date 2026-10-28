import { createPublicClient, http, parseUnits, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ORDER_TYPE, contractErrorsAbi } from '@somnia-chain/markets-sdk';
import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
import { cfg, GAS_LIMIT } from '../config.ts';
import { initSdk, requireMarket } from '../sdk.ts';
import { getMarketRow } from '../indexer.ts';
import { ownerAddress, placeArgs, sendOwner, simulateOwner } from './ownerTx.ts';

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

function alignDown(price: bigint, tick: bigint): bigint {
  if (tick <= 1n) return price;
  const n = price - (price % tick);
  return n > 0n ? n : tick;
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
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  const tick = BigInt(row.tickSize);
  const lot = BigInt(row.lotSize);
  const price = health.priceable ? alignDown(health.markPrice, tick) : parseUnits('2000', 18);
  const over = alignDown(parseUnits('50', 18), lot);
  const sim = await simulateOwner(row.poolAddress, 'placeOrderFor', placeArgs(ownerAddress(), true, price, over, ORDER_TYPE.LIMIT));
  const prior = 'Leg A (kept, 2026-10-27, no rebroadcast): 6-decimal qty parseUnits("0.01", 6) reverted InvalidQuantity(10000, 100000000000000), not InsufficientCollateral().';
  return {
    steps: [
      'Leg A, already observed: size 0.01 ETH as 6 decimals and record the revert.',
      'Leg B: 18-decimal tick/lot-aligned quantity of 50 ETH via owner placeOrderFor. eth_call only.',
    ],
    expected: 'Docs say a decimal bug reverts InsufficientCollateral() 0x3a23d825. Leg A did not. Leg B records the owner-path revert for an over-margin size.',
    actual: `${prior} Leg B reached the over-margin case: ${sim.ok ? 'simulation succeeded (not broadcast)' : sim.message.slice(0, 280)}`,
    evidence: [prior, `leg B account: ${ownerAddress()}`, `leg B price ${price} qty ${over}`, sim.ok ? 'leg B simulation ok' : `leg B revert: ${sim.message.slice(0, 400)}`],
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
  const tick = BigInt(row.tickSize);
  const price = alignDown(health.markPrice * 95n / 100n, tick);
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
  const quote = await markets.client.getMaxPerpOrderSize({ pool: row.poolAddress, marginBank: row.marginBank, account: ownerAddress(), isBid: true, price: health.markPrice });
  const prior = 'Prior leg (bot signer, kept): maxQuantity 0 placeable false limitedBy collateral.';
  const evidence = [prior, quote.priceable ? `owner maxQuantity ${quote.maxQuantity} limitedBy ${quote.limitedBy} placeable ${quote.placeable}` : 'owner priceable:false'];
  let accepted = 'no order sent';
  if (quote.priceable && quote.placeable && quote.maxQuantity >= BigInt(row.minQuantity)) {
    const qty = BigInt(row.minQuantity);
    const price = alignDown(health.markPrice * 90n / 100n, BigInt(row.tickSize));
    const sim = await simulateOwner(row.poolAddress, 'placeOrderFor', placeArgs(ownerAddress(), true, price, qty, ORDER_TYPE.LIMIT));
    if (sim.ok) {
      const tx = await sendOwner(row.poolAddress, 'placeOrderFor', placeArgs(ownerAddress(), true, price, qty, ORDER_TYPE.LIMIT));
      accepted = `accepted minQuantity ${qty} vs quoted max ${quote.maxQuantity} tx ${tx.hash}`;
      evidence.push(`${cfg.EXPLORER_TX_BASE}${tx.hash}`);
    } else {
      accepted = `minQuantity simulation reverted: ${sim.message.slice(0, 200)}`;
    }
  }
  return {
    steps: ['Read getMaxPerpOrderSize for OWNER_ADDRESS.', 'Place one min-quantity resting bid and compare it to the quoted max. Do not ramp to the full max.'],
    expected: 'Quoted maxQuantity matches the largest order the account can rest.',
    actual: `${prior} Owner read: ${quote.priceable ? `max ${quote.maxQuantity} limitedBy ${quote.limitedBy}` : 'unpriceable'}. ${accepted}`,
    evidence,
    observedSeverity: 'normal',
  };
}

async function p06(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  const tick = BigInt(row.tickSize);
  const price = health.priceable ? alignDown(health.markPrice, tick) : parseUnits('2000', 18);
  const quote = health.priceable
    ? await markets.client.getMaxPerpOrderSize({ pool: row.poolAddress, marginBank: row.marginBank, account: ownerAddress(), isBid: true, price, autoPull: false })
    : null;
  const prior = 'Prior leg (kept): bot placePerpOrder reverted ERC20: insufficient allowance. That leg is an allowance UX gap, not the position cap.';
  let over = 'cap unread';
  if (quote && quote.priceable) {
    const qty = quote.maxPositionSize + BigInt(row.lotSize);
    const sim = await simulateOwner(row.poolAddress, 'placeOrderFor', placeArgs(ownerAddress(), true, price, qty, ORDER_TYPE.LIMIT));
    over = sim.ok ? `simulation of qty ${qty} above maxPositionSize ${quote.maxPositionSize} succeeded` : sim.message.slice(0, 300);
  }
  return {
    steps: ['Read maxPositionSize on the funded owner.', 'eth_call placeOrderFor above that cap.', 'Keep the earlier allowance revert as its own leg.'],
    expected: 'MaxPositionSizeExceeded 0x714b36d6 when size exceeds the per-account cap.',
    actual: `${prior} Owner over-cap: ${over}`,
    evidence: [prior, ...(quote && quote.priceable ? [`owner maxPositionSize: ${quote.maxPositionSize}`, `limitedBy: ${quote.limitedBy}`] : ['size quote unavailable']), over],
  };
}

async function p07(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const registry = row.stopRegistry;
  const evidence = [
    `ETH-PERP stopRegistry from the SDK market row: ${registry ?? 'null'}`,
    'Contract-addresses page fetched 2026-10-29 lists mainnet chain 5031 and Shannon testnet chain 50312. It does not list Tokyo chain 50383 and does not contain 0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3A. That chat address is not cited as a stop registry.',
    `Shannon OperatorPermissionsRegistry on that page: 0x15C7e8CE38F021c5b45d098AaD788f63090bF20A. Mainnet OperatorPermissionsRegistry: 0xE7a190736B6024a4DbafadC04E283075877005ce. Neither is PerpMarket.stopRegistry.`,
  ];
  if (!registry) {
    return {
      steps: ['Read PerpMarket.stopRegistry for ETH-PERP.', 'Do not call placePerpStopOrder when the row is null.', 'Do not cite an operator-registry address that the live addresses page does not list for this chain.'],
      expected: 'A stop registry on the allowlisted market, or a documented absence.',
      actual: 'ETH-PERP stopRegistry is null. There is no stop path on the allowlisted default market via the SDK row. OperatorPermissionsRegistry is a different contract and is not published for Tokyo on the addresses page.',
      evidence,
    };
  }
  evidence.push('placePerpStopOrder was not sent on the rerun. The 2026-10-29 call threw before broadcast: needs operatorRegistry or addresses.operatorPermissionsRegistry.');
  return {
    steps: ['Read PerpMarket.stopRegistry.', 'Do not broadcast a stop when the trader has no operator registry configured.', 'Record that OperatorPermissionsRegistry is a different contract and is not on the Tokyo addresses page.'],
    expected: 'A stop path on the allowlisted market, or a pre-flight error that names the missing operator registry.',
    actual: `stopRegistry ${registry} is on the SDK row. No transaction was broadcast. The trader requires a configured operator registry, which is not the stop registry and is not published for Tokyo on the addresses page.`,
    evidence,
  };
}

async function p08(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, 'ZEC-PERP');
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  const price = health.priceable ? health.markPrice : parseUnits('100', 18);
  const bot = await markets.client.getMaxPerpOrderSize({ pool: row.poolAddress, marginBank: row.marginBank, account: signer(), isBid: true, price });
  const owner = await markets.client.getMaxPerpOrderSize({ pool: row.poolAddress, marginBank: row.marginBank, account: ownerAddress(), isBid: true, price, autoPull: false });
  const evidence = [
    `bot signer limitedBy ${bot.priceable ? bot.limitedBy : 'unpriceable'} max ${bot.priceable ? bot.maxQuantity : 0n}`,
    `owner limitedBy ${owner.priceable ? owner.limitedBy : 'unpriceable'} max ${owner.priceable ? owner.maxQuantity : 0n}`,
    'Precedence: collateral on an unfunded account masks voucherBlocked. The bot claim that would add voucher credit reverts 0x3e31dcc2 (P-15), so the documented voucherBlocked case stays unreachable here.',
  ];
  const quote = owner;
  if (quote.priceable && quote.limitedBy === 'voucherBlocked') {
    const cap = await placeAndCapture({ symbol: 'ZEC-PERP', isBid: true, priceRaw: price, qtyRaw: quote.minQuantity || 1n, tif: 'GTC' });
    evidence.push(...cap.evidence);
  }
  return {
    steps: ['Read getMaxPerpOrderSize on ZEC-PERP for the bot account.', 'If limitedBy is voucherBlocked, attempt one order and record the revert.'],
    expected: 'limitedBy voucherBlocked once the account has voucher credit. Until then collateral masks it.',
    actual: `Bot limitedBy ${bot.priceable ? bot.limitedBy : 'unpriceable'}. Owner limitedBy ${owner.priceable ? owner.limitedBy : 'unpriceable'}. voucherBlocked is masked while the account is unfunded or the claim reverts.`,
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
  const prior = 'Prior leg (kept): markets.close() left priceable true after 31s. close() is not a stale mark.';
  const samples: string[] = [];
  let sawFalse = false;
  const started = new Date().toISOString();
  for (let i = 0; i < 8; i++) {
    const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
    samples.push(`${new Date().toISOString()} priceable=${health.priceable}`);
    if (!health.priceable) sawFalse = true;
    if (i < 7) await new Promise(r => setTimeout(r, 15_000));
  }
  return {
    steps: ['Keep the close() observation as a secondary leg.', 'Sample getPerpHealthSnapshot every 15s for 2 minutes. priceable:false means a stale mark, not a closed socket.'],
    expected: 'priceable:false when the mark feed is stale, then recovery. A client close() is not that case.',
    actual: sawFalse
      ? `Captured priceable:false during sampling that started ${started}.`
      : `No priceable:false in 8 samples over 2 minutes starting ${started}.`,
    evidence: [prior, ...samples],
    observedSeverity: 'normal',
  };
}

async function p11(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const health = await markets.client.getPerpHealthSnapshot(row.poolAddress);
  const prior = 'Prior leg (kept): cancelOrder(orderId=1) as the bot signer reverted IncorrectSender twice. That was not a real resting id.';
  if (!health.priceable) return { steps: ['Need a mark.'], expected: 'Idempotent cancel of a real id.', actual: 'mark not priceable', evidence: [prior] };
  const tick = BigInt(row.tickSize);
  const price = alignDown(health.markPrice * 80n / 100n, tick);
  const qty = BigInt(row.minQuantity);
  const placed = await sendOwner(row.poolAddress, 'placeOrderFor', placeArgs(ownerAddress(), true, price, qty, ORDER_TYPE.LIMIT));
  const ids = await markets.client.getOwnOpenOrdersOnchain(row.poolAddress, ownerAddress());
  const orderId = ids[ids.length - 1];
  const evidence = [prior, `resting tx ${placed.hash} (${cfg.EXPLORER_TX_BASE}${placed.hash})`, `open ids: ${ids.map(String).join(',')}`];
  if (orderId == null) {
    return { steps: ['Place a resting GTC.'], expected: 'A real order id.', actual: 'place mined but no open id was returned', evidence };
  }
  const first = await simulateOwner(row.poolAddress, 'cancelOrderFor', [ownerAddress(), orderId]);
  const sent = first.ok ? await sendOwner(row.poolAddress, 'cancelOrderFor', [ownerAddress(), orderId]) : null;
  const second = await simulateOwner(row.poolAddress, 'cancelOrderFor', [ownerAddress(), orderId]);
  evidence.push(`orderId ${orderId}`);
  evidence.push(sent ? `first cancel ${sent.hash} (${cfg.EXPLORER_TX_BASE}${sent.hash})` : `first cancel simulation: ${first.ok ? 'ok' : first.message.slice(0, 200)}`);
  evidence.push(`second cancel: ${second.ok ? 'simulation succeeded after the first cancel' : second.message.slice(0, 240)}`);
  return {
    steps: ['Place a resting GTC 20% under the mark via placeOrderFor.', 'Cancel that id, then cancel it again.', 'Record IncorrectSender versus idempotency.'],
    expected: 'A second cancel of a real id is a stable no-op or a named error, not a missing id.',
    actual: `orderId ${orderId}. First cancel ${sent ? sent.status : 'not sent'}. Second: ${second.ok ? 'still simulates' : second.message.slice(0, 180)}`,
    evidence,
  };
}

async function p15(): Promise<ProbeResult> {
  const markets = initSdk();
  const row = await requireMarket(markets, cfg.SYMBOL);
  const account = signer();
  const elig = await markets.client.getPerpVoucherEligibility(row.marginBank, account);
  const built = await markets.trader.buildClaimPerpVoucher({ marginBank: row.marginBank });
  const publicClient = createPublicClient({ chain: hidekiTestnet, transport: http(cfg.RPC_URL_HTTP) });
  let revert = 'simulation succeeded';
  try {
    await publicClient.call({ to: built.to, data: built.data, account });
  } catch (e) {
    revert = e instanceof Error ? e.message : String(e);
  }
  const known = contractErrorsAbi.some((item) => 'name' in item && String(revert).includes(String(item.name)));
  const grant = elig.eligible ? String(elig.grantAmount) : '0';
  const reason = elig.eligible ? 'none' : elig.reason;
  return {
    steps: ['Read getPerpVoucherEligibility for the bot signer.', 'eth_call voucherDistributor.claim(). Do not broadcast.'],
    expected: 'Eligibility and the claim simulation agree, and any revert is a named SDK error.',
    actual: `eligible=${elig.eligible} grant=${grant}. eth_call: ${revert.slice(0, 240)}. Selector named in contractErrorsAbi: ${known}.`,
    evidence: [`eligible: ${elig.eligible}`, `grantAmount: ${grant}`, `reason: ${reason}`, `eth_call: ${revert.slice(0, 400)}`, 'broadcast: none'],
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

PROBES['P-15'] = {
  id: 'P-15',
  fileSlug: 'P15-unnamed-claim-revert-selector',
  title: 'Bot voucher claim eth_call reverts with unnamed selector 0x3e31dcc2',
  severity: 'major',
  area: 'SDK',
  async run() { gate('P-15'); return p15(); },
};

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
