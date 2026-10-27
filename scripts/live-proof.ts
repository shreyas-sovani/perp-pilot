import 'dotenv/config';
import { cfg } from '../src/config.ts';
import { MarketDataAgent } from '../src/agents/marketData.ts';
import { ExecutionAgent } from '../src/agents/execution.ts';
import { OrderIntent } from '../src/agents/schemas.ts';
import { evaluate } from '../src/agents/risk.ts';

if (cfg.DRY_RUN !== 'false') {
  console.error('Refusing live proof while DRY_RUN is not false.');
  process.exit(1);
}

const md = new MarketDataAgent();
await md.warmup();
const ex = new ExecutionAgent();
for (const side of ['buy', 'sell', 'buy', 'sell', 'buy', 'sell'] as const) {
  const snap = await md.snapshot();
  const mark = Number(snap.markPrice) / 1e18;
  const intent = OrderIntent.parse({
    id: crypto.randomUUID(),
    symbol: cfg.SYMBOL,
    side,
    reduceOnly: false,
    notionalUsdso: '5',
    tif: 'IOC',
    limitPriceUsdso: String(mark * (side === 'buy' ? 1.003 : 0.997)),
    origin: 'probe',
  });
  const v = evaluate(intent, { snapshot: snap, position: null, openOrders: 0 });
  console.log(side, v.approved ? 'approved' : v.reasons.join(','), '=>');
  if (v.approved) console.log(JSON.stringify(await ex.execute(intent)));
  await new Promise(r => setTimeout(r, 20_000));
}
process.exit(0);
