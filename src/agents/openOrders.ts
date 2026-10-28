import { db } from '../db.ts';

export function openOrderCount(): number {
  const row = db.prepare(`SELECT COUNT(*) c FROM orders WHERE clearedAt IS NULL AND (
    state IN ('PREFLIGHT','SIGNED','SUBMITTED','MINED')
    OR (state = 'CONFIRMED' AND onChainOrderId IS NOT NULL)
  )`).get() as { c: number } | undefined;
  return row?.c ?? 0;
}

export function markOrdersCleared(orderIds: string[]): void {
  const now = Date.now();
  const stmt = db.prepare('UPDATE orders SET clearedAt=? WHERE onChainOrderId=? AND clearedAt IS NULL');
  for (const id of orderIds) stmt.run(now, id);
}
