import 'dotenv/config';
import { formatUnits } from 'viem';
import { cfg, GAS_LIMIT } from '../src/config.ts';
import { initSdk, requireMarket } from '../src/sdk.ts';
import { privateKeyToAccount } from 'viem/accounts';

if (cfg.DRY_RUN !== 'false') {
  console.error('Claim is a REAL transaction. Run with DRY_RUN=false (this script only; trading config unchanged): DRY_RUN=false npm run claim');
  process.exit(1);
}
const sdk = initSdk();
const acct = privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`);
const row = await requireMarket(sdk, cfg.SYMBOL);
const elig = await sdk.client.getPerpVoucherEligibility(row.marginBank, acct.address);
console.log('signer', acct.address);
console.log('eligibility:', elig.eligible ? `eligible grant ${formatUnits(elig.grantAmount, 18)} USDso` : `ineligible ${elig.reason}`);
if (!elig.eligible) {
  console.error(`Not claiming. A broadcast would revert (${elig.reason}). Linked-bot mode trades OWNER_ADDRESS; this claim would credit the bot signer only.`);
  process.exit(1);
}
const res = await sdk.trader.claimPerpVoucher({ marginBank: row.marginBank, gas: GAS_LIMIT });
console.log('claim tx:', res.hash);
console.log('If eligibility was false with open positions/orders on this address, the claim fails — use a fresh wallet (npm run wallet:new after clearing BOT_PRIVATE_KEY).');
process.exit(0);
