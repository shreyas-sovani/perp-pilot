import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { db } from '../db.ts';
import { subscribe, type Envelope } from '../bus.ts';
import { renderReport, reportPath } from '../feedback/template.ts';

function dayStamp(ts: number): string { return new Date(ts).toISOString().slice(0, 10); }

export function ingest(env: Envelope): boolean {
  const payload = (env.payload ?? {}) as { state?: string; rejectReason?: string | null; reasons?: string[] };
  let kind = '';
  let reason = '';
  if (env.kind === 'execution.report' && payload.state === 'REJECTED') {
    kind = 'execution';
    reason = payload.rejectReason ?? 'rejected';
  } else if (env.kind === 'tick.error') {
    kind = 'tick';
    reason = 'tick.error';
  } else if (env.kind === 'risk.verdict') {
    const hit = (payload.reasons ?? []).filter((r) => r === 'E_STALE_MARK' || r === 'E_MARK_NOT_PRICEABLE');
    if (hit.length === 0) return false;
    kind = 'risk';
    reason = hit.join(',');
  } else if (env.kind === 'guard.trigger') {
    kind = 'guard';
    reason = 'guard.trigger';
  } else return false;

  const day = dayStamp(env.ts);
  const id = `auto-${createHash('sha1').update(`${kind}${reason}${day}`).digest('hex').slice(0, 12)}`;
  const existing = db.prepare('SELECT id FROM findings WHERE id=?').get(id);
  if (existing) return false;
  const path = reportPath(id);
  mkdirSync('feedback', { recursive: true });
  const body = renderReport({
    fileSlug: id,
    title: `Auto ${kind}: ${reason}`.slice(0, 120),
    severity: 'normal',
    area: 'app',
    steps: ['Run the agent', `Observe bus kind ${env.kind}`],
    expected: 'The agent continues without this rejection or error.',
    actual: reason,
    evidence: [`ts=${env.ts}`, `payload=${JSON.stringify(payload).slice(0, 500)}`],
  });
  writeFileSync(path, body);
  db.prepare('INSERT INTO findings(id,probeId,title,severity,area,status,evidenceJson,reportPath,ts) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(id, id, `Auto ${kind}: ${reason}`.slice(0, 120), 'normal', 'app', 'open', JSON.stringify(payload).slice(0, 2000), path, env.ts);
  return true;
}

let started = false;
export function startReporter(): void {
  if (started) return;
  started = true;
  for (const kind of ['execution.report', 'tick.error', 'risk.verdict', 'guard.trigger']) {
    subscribe(kind, (env) => { ingest(env); });
  }
}
