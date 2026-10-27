import { describe, it, expect } from 'vitest';
import { renderReport } from '../src/feedback/template.ts';

it('renders bounty sections in order', () => {
  const md = renderReport({
    fileSlug: 'x',
    title: 'Title',
    severity: 'major',
    area: 'docs',
    steps: ['open the docs'],
    expected: 'one name for the network',
    actual: 'three names',
    evidence: ['https://explorer.testnet.somnia.network/tokyo'],
  });
  const marks = ['# ', 'Severity: ', 'Area: ', '## Steps to reproduce', '## Expected', '## Actual', '## Evidence', '## Environment'];
  let at = -1;
  for (const mark of marks) {
    const i = md.indexOf(mark);
    expect(i).toBeGreaterThan(at);
    at = i;
  }
});
