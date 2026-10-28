import { readFileSync } from 'node:fs';
import { MarketSnapshot } from '../src/agents/schemas.ts';
import { fundingCarry, emaMomentum, bucketMinuteCloses } from '../src/agents/signals.ts';
import { evaluate } from '../src/agents/risk.ts';
import { OrderIntent } from '../src/agents/schemas.ts';

const path = process.argv[2];
if (!path) { console.error('usage: npm run replay -- runs/<date>.jsonl'); process.exit(1); }
const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
const secretKey = /private|key|secret|mnemonic/i;
const hex64 = /0x[0-9a-fA-F]{64}/;
for (const line of lines) {
  const obj = JSON.parse(line) as { payload?: Record<string, unknown> };
  const fields = obj.payload && typeof obj.payload === 'object' ? Object.entries(obj.payload) : [];
  for (const [k, v] of fields) {
    if (secretKey.test(k) && typeof v === 'string' && hex64.test(v)) {
      console.error(`refusing journal: secret-shaped field ${k}`);
      process.exit(2);
    }
  }
}
let compared = 0;
let differ = 0;
const marks: { ts: number; mark: number }[] = [];
for (const line of lines) {
  const env = JSON.parse(line) as { kind?: string; payload?: Record<string, unknown> };
  if (env.kind !== 'market.snapshot' || !env.payload) continue;
  const snap = MarketSnapshot.parse(env.payload);
  marks.push({ ts: snap.ts, mark: Number(snap.markPrice) / 1e18 });
  const signal = fundingCarry(snap);
  const momentum = emaMomentum(bucketMinuteCloses(marks));
  const side = signal.side !== 'flat' ? signal.side : momentum.side;
  const intent = OrderIntent.parse({
    id: '00000000-0000-4000-8000-000000000001', symbol: snap.symbol,
    side: side === 'short' ? 'sell' : 'buy', reduceOnly: false, notionalUsdso: '20',
    tif: 'GTC', limitPriceUsdso: String(Number(snap.markPrice) / 1e18), origin: 'copilot',
  });
  const verdict = evaluate(intent, { snapshot: snap, position: null, openOrders: 0 });
  compared += 1;
  if (side === 'flat' && verdict.approved) differ += 0;
  console.log(`snap ${snap.ts} signal=${signal.side} momentum=${momentum.side} approved=${verdict.approved} reasons=${verdict.reasons.join(',') || '-'}`);
}
console.log(`replayed ${compared} snapshots, flagged ${differ}`);
