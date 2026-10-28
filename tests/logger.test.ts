import { describe, it, expect } from 'vitest';
import { redactForLog } from '../src/logger.ts';

it('keeps a tx hash and redacts a private key', () => {
  const hash = '0x' + 'a'.repeat(64);
  const secret = '0x' + 'b'.repeat(64);
  const tx = JSON.stringify(redactForLog({ txHash: hash }));
  const key = JSON.stringify(redactForLog({ privateKey: secret }));
  expect(tx).toContain(hash);
  expect(key).not.toContain(secret);
  expect(key).toContain('[REDACTED]');
});
