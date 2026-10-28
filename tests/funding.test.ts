import { describe, it, expect } from 'vitest';
import { fundingAprFromRate } from '../src/indexer.ts';

it('scales the observed 1e14 ETH funding rate to a fraction APR', () => {
  const apr = fundingAprFromRate('100000000000000', 28800);
  expect(apr).toBeCloseTo(0.1095, 6);
  expect(apr).toBeLessThan(1);
});
