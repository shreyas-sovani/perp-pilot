import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
if (existsSync('.env')) {
  const env = readFileSync('.env', 'utf8');
  if (/^BOT_PRIVATE_KEY=0x[0-9a-fA-F]{64}$/m.test(env)) {
    const addr = privateKeyToAccount(env.match(/^BOT_PRIVATE_KEY=(0x[0-9a-fA-F]{64})$/m)![1] as `0x${string}`).address;
    console.log('BOT key already exists in .env. Address:', addr, '— refusing to overwrite.');
    process.exit(0);
  }
}
const pk = generatePrivateKey();
const acct = privateKeyToAccount(pk);
appendFileSync('.env', `\nBOT_PRIVATE_KEY=${pk}\n`);
console.log('NEW BURNER WALLET CREATED (never use a personal key here)');
console.log('Address:', acct.address);
console.log('=> Fund it with testnet STT gas (faucet / app top-up). Needed: ~0.5 STT.');
