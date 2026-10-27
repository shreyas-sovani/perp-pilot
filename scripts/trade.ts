import 'dotenv/config';
import { cfg } from '../src/config.ts';
import { Orchestrator } from '../src/agents/orchestrator.ts';
import { log } from '../src/logger.ts';
const args = new Set(process.argv.slice(2));
if (args.has('--live')) {
  if (!process.argv.includes('--minutes')) { console.error('Live runs MUST pass --minutes N (max 60).'); process.exit(1); }
  const m = Number(process.argv[process.argv.indexOf('--minutes') + 1]);
  if (!(m > 0 && m <= 60)) { console.error('--minutes must be 1..60'); process.exit(1); }
  if (cfg.DRY_RUN !== 'false') { console.error('Set DRY_RUN=false in .env for live mode. Aborting.'); process.exit(1); }
  console.log(`*** LIVE MODE: real orders on Tokyo testnet for ${m} minutes. Ctrl-C to abort now. ***`);
  await new Promise(r => setTimeout(r, 5000));
  setTimeout(() => { console.log('Time limit reached — stopping loop.'); process.exit(0); }, m * 60_000);
} else if (cfg.DRY_RUN !== 'true') {
  console.error('Refusing implicit live run: pass --live --minutes N, or set DRY_RUN=true.'); process.exit(1);
}
log.info({ dry: cfg.DRY_RUN }, 'PerpPilot starting');
await new Orchestrator().start();
