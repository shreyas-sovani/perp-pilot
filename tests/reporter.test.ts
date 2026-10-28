import { describe, it, expect } from 'vitest';
import { unlinkSync } from 'node:fs';
import { ingest } from '../src/agents/reporter.ts';
import { db } from '../src/db.ts';
import type { Envelope } from '../src/bus.ts';

const env = (reason: string): Envelope => ({
  seq: 1, ts: Date.parse('2026-10-29T00:00:00Z'), agent: 'execution', kind: 'execution.report',
  payload: { state: 'REJECTED', rejectReason: reason }, dryRun: true,
});

it('records one findings row and file, then ignores the republish', () => {
  const reason = `unit-${crypto.randomUUID()}`;
  expect(ingest(env(reason))).toBe(true);
  expect(ingest(env(reason))).toBe(false);
  const rows = db.prepare('SELECT id, reportPath FROM findings WHERE title LIKE ?').all(`%${reason}%`) as { id: string; reportPath: string }[];
  expect(rows).toHaveLength(1);
  expect(rows[0]!.reportPath.startsWith('feedback/auto-')).toBe(true);
  unlinkSync(rows[0]!.reportPath);
  db.prepare('DELETE FROM findings WHERE id=?').run(rows[0]!.id);
});
