import { describe, it, expect } from 'vitest';
import { guardIntents } from '../src/agents/guard.ts';
it('no position -> no intents', () => expect(guardIntents(null, 3000)).toHaveLength(0));
it('long past TP -> sell intent', () => {
  const out = guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 3000 }, 3080);
  expect(out).toHaveLength(1); expect(out[0]!.side).toBe('sell'); expect(out[0]!.origin).toBe('guard');
});
it('long above SL band -> nothing', () => expect(guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 3000 }, 3050)).toHaveLength(0));
it('short past TP -> buy intent', () => {
  const out = guardIntents({ symbol: 'ETH-PERP', qty: -0.01, avgEntry: 3000 }, 2900);
  expect(out).toHaveLength(1); expect(out[0]!.side).toBe('buy');
});
