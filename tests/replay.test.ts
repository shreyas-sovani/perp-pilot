import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(file: string) {
  return spawnSync('./node_modules/.bin/tsx', ['scripts/replay.ts', file], { encoding: 'utf8' });
}

it('refuses a journal line that carries a key-shaped secret', () => {
  const dir = mkdtempSync(join(tmpdir(), 'replay-'));
  const file = join(dir, 'poison.jsonl');
  writeFileSync(file, JSON.stringify({ payload: { privateKey: '0x' + 'a'.repeat(64) } }) + '\n');
  const out = run(file);
  expect(out.status).toBe(2);
  expect(out.stderr).toContain('refusing journal');
});
