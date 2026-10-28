import { describe, it, expect } from 'vitest';
import { alignLot } from '../src/agents/execution.ts';

it('rounds up to the smallest lot multiple at or above minQty', () => {
  expect(alignLot(12n, 10n, 15n)).toBe(20n);
  expect(alignLot(25n, 10n, 15n)).toBe(20n);
});
