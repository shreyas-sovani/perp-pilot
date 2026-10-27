import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'node:fs';
import { privateKeyToAccount } from 'viem/accounts';
import { cfg } from '../src/config.ts';
import { PROBES } from '../src/feedback/probes.ts';
import { renderReport, reportPath } from '../src/feedback/template.ts';
import { db } from '../src/db.ts';

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
for (const [id, p] of Object.entries(PROBES)) {
  if (only && id !== only) continue;
  process.stdout.write(`running ${id} ... `);
  try {
    const res = await p.run();
    const md = renderReport({
      fileSlug: p.fileSlug,
      title: p.title,
      severity: res.observedSeverity ?? p.severity,
      area: p.area,
      steps: res.steps,
      expected: res.expected,
      actual: res.actual,
      evidence: res.evidence,
      walletAddress: privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`).address,
    });
    mkdirSync('feedback', { recursive: true });
    writeFileSync(reportPath(p.fileSlug), md);
    db.prepare(`INSERT INTO findings(id,probeId,title,severity,area,status,evidenceJson,reportPath,ts) VALUES(?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET status='reported', reportPath=excluded.reportPath`)
      .run(p.fileSlug, id, p.title, res.observedSeverity ?? p.severity, p.area, 'reported', JSON.stringify(res.evidence), reportPath(p.fileSlug), Date.now());
    console.log('OK ->', reportPath(p.fileSlug));
  } catch (e) {
    console.log('PROBE ERROR (this is itself evidence):', String((e as Error).message).slice(0, 200));
  }
}
process.exit(0);
