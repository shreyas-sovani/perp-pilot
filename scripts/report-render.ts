import { mkdirSync, writeFileSync } from 'node:fs';
import { db } from '../src/db.ts';
import { renderReport, reportPath } from '../src/feedback/template.ts';
import { cfg } from '../src/config.ts';

type Finding = { id: string; probeId: string | null; title: string; severity: string; area: string; evidenceJson: string; reportPath: string | null; ts: number };

function renderOne(row: Finding): void {
  const evidence = JSON.parse(row.evidenceJson) as unknown;
  const lines = Array.isArray(evidence) ? evidence.map(String) : [JSON.stringify(evidence)];
  const body = renderReport({
    fileSlug: row.id,
    title: row.title,
    severity: (row.severity as 'critical' | 'major' | 'normal') ?? 'normal',
    area: (row.area as 'API' | 'SDK' | 'docs' | 'app' | 'contracts') ?? 'app',
    steps: ['Re-rendered from the findings row.'],
    expected: 'The stored evidence.',
    actual: row.title,
    evidence: lines,
  });
  const path = `runs/reports/${row.reportPath?.split('/').pop() || reportPath(row.id).split('/').pop()}`;
  mkdirSync('runs/reports', { recursive: true });
  writeFileSync(path, body);
  console.log(path);
}

const all = process.argv.includes('--all');
const arg = process.argv.find((a) => a !== '--all' && !a.endsWith('report-render.ts') && a !== '--');
if (all) {
  const rows = db.prepare('SELECT * FROM findings ORDER BY ts').all() as Finding[];
  for (const row of rows) renderOne(row);
  const orders = db.prepare('SELECT state, COUNT(*) c FROM orders GROUP BY state').all() as { state: string; c: number }[];
  const hashes = db.prepare("SELECT txHash FROM orders WHERE txHash IS NOT NULL AND txHash != ''").all() as { txHash: string }[];
  const equity = db.prepare('SELECT equityUsdso FROM equity ORDER BY ts').all() as { equityUsdso: string }[];
  const day = new Date().toISOString().slice(0, 10);
  console.log('orders', orders.map((o) => `${o.state}=${o.c}`).join(' ') || 'none');
  console.log('txs', hashes.map((h) => `${cfg.EXPLORER_TX_BASE}${h.txHash}`).join('\n') || 'none');
  console.log('equity first/last', equity[0]?.equityUsdso ?? 'none', equity.at(-1)?.equityUsdso ?? 'none');
  console.log('realized', db.prepare('SELECT value FROM kv WHERE key=?').get(`realized:${day}`) ?? 'none');
} else if (arg) {
  const row = db.prepare('SELECT * FROM findings WHERE id=? OR probeId=?').get(arg, arg) as Finding | undefined;
  if (!row) { console.error('finding not found', arg); process.exit(1); }
  renderOne(row);
} else {
  console.error('usage: npm run report -- <slug|id> | npm run report:pack');
  process.exit(1);
}
