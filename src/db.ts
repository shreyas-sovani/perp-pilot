import Database from 'better-sqlite3';
export const db = new Database(process.env.DB_PATH ?? 'state.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS orders(
  id TEXT PRIMARY KEY, symbol TEXT NOT NULL, side TEXT NOT NULL, reduceOnly INTEGER NOT NULL DEFAULT 0,
  qtyRaw TEXT, priceRaw TEXT, tif TEXT NOT NULL DEFAULT 'GTC',
  state TEXT NOT NULL, intentJson TEXT NOT NULL, txHash TEXT, onChainOrderId TEXT,
  rejectReason TEXT, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS fills(
  id TEXT PRIMARY KEY, orderRef TEXT, symbol TEXT, qty TEXT, price TEXT, fee TEXT,
  txHash TEXT, ts INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS positions(
  symbol TEXT PRIMARY KEY, qty TEXT NOT NULL, avgEntry TEXT NOT NULL,
  realizedPnl TEXT NOT NULL DEFAULT '0', openedAt INTEGER, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS decisions(
  seq INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, agent TEXT NOT NULL,
  kind TEXT NOT NULL, payloadJson TEXT NOT NULL, rationale TEXT);
CREATE TABLE IF NOT EXISTS findings(
  id TEXT PRIMARY KEY, probeId TEXT, title TEXT NOT NULL, severity TEXT NOT NULL,
  area TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', evidenceJson TEXT NOT NULL,
  reportPath TEXT, ts INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS equity(ts REAL PRIMARY KEY, equityUsdso TEXT NOT NULL, unrealizedPnl TEXT NOT NULL);
`);
const equityCols = db.prepare('PRAGMA table_info(equity)').all() as { name: string }[];
if (!equityCols.some((c) => c.name === 'fundingOwed')) {
  try { db.exec('ALTER TABLE equity ADD COLUMN fundingOwed TEXT'); }
  catch (e) { if (!String(e).includes('duplicate column')) throw e; }
}
export const kv = {
  get: (k: string): string | null => (db.prepare('SELECT value FROM kv WHERE key=?').get(k) as any)?.value ?? null,
  set: (k: string, v: string) => db.prepare('INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, v),
};
