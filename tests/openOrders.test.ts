import { describe, it, expect } from 'vitest';
import { db } from '../src/db.ts';
import { openOrderCount } from '../src/agents/openOrders.ts';

it('a resting confirmed order counts until it is cleared', () => {
  const id = `gtc-${crypto.randomUUID()}`;
  const before = openOrderCount();
  db.prepare(`INSERT INTO orders(id,symbol,side,reduceOnly,state,intentJson,onChainOrderId,createdAt,updatedAt)
    VALUES(?,?,?,?,?,?,?,?,?)`).run(id, 'ETH-PERP', 'buy', 0, 'CONFIRMED', '{}', id, 1, 1);
  expect(openOrderCount()).toBe(before + 1);
  db.prepare('UPDATE orders SET clearedAt=? WHERE id=?').run(Date.now(), id);
  expect(openOrderCount()).toBe(before);
  db.prepare('DELETE FROM orders WHERE id=?').run(id);
});
