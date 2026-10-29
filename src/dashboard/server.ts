import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { cfg } from '../config.ts';
import { db, kv } from '../db.ts';
import { subscribe } from '../bus.ts';
import { fileURLToPath } from 'node:url';

const journalPath = () => `runs/${new Date().toISOString().slice(0, 10)}.jsonl`;

function latestSnapshot(): Promise<unknown | null> {
  const path = journalPath();
  if (!existsSync(path)) return Promise.resolve(null);
  const size = statSync(path).size;
  if (size === 0) return Promise.resolve(null);
  const start = Math.max(0, size - 256_000);
  let text = '';
  const stream = createReadStream(path, { start, end: size - 1, encoding: 'utf8' });
  return new Promise((resolve) => {
    stream.on('data', (chunk) => { text += chunk; });
    stream.on('end', () => {
      const lines = text.trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const env = JSON.parse(lines[i]!) as { kind?: string };
          if (env.kind === 'market.snapshot') { resolve(env); return; }
        } catch { /* cut line at the byte window */ }
      }
      resolve(null);
    });
    stream.on('error', () => resolve(null));
  });
}

const app = express();
app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));
app.get('/api/state', async (_q, res) => {
  res.json({
    orders: db.prepare('SELECT * FROM orders ORDER BY updatedAt DESC LIMIT 20').all(),
    decisions: db.prepare('SELECT * FROM decisions ORDER BY seq DESC LIMIT 30').all(),
    findings: db.prepare('SELECT * FROM findings ORDER BY ts DESC LIMIT 30').all(),
    equity: db.prepare('SELECT * FROM equity ORDER BY ts DESC LIMIT 300').all(),
    position: db.prepare('SELECT * FROM positions').all(),
    snapshot: await latestSnapshot(),
    halt: kv.get('halted'),
    equityUsdso: kv.get('equityUsdso'),
    policy: {
      symbol: cfg.SYMBOL,
      dryRun: cfg.DRY_RUN,
      tpPct: cfg.TP_PCT,
      slPct: cfg.SL_PCT,
      explorer: cfg.EXPLORER_TX_BASE,
    },
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const send = (raw: string) => {
  for (const c of wss.clients) if (c.readyState === 1) c.send(raw);
};
subscribe('*', (e) => send(JSON.stringify(e)));

let journalOffset = 0;
function pumpJournal() {
  const path = journalPath();
  if (!existsSync(path)) return;
  const size = statSync(path).size;
  if (journalOffset === 0 || size < journalOffset) journalOffset = size;
  if (size <= journalOffset) return;
  const stream = createReadStream(path, { start: journalOffset, end: size - 1, encoding: 'utf8' });
  journalOffset = size;
  let carry = '';
  stream.on('data', (chunk) => {
    carry += chunk;
    const parts = carry.split('\n');
    carry = parts.pop() ?? '';
    for (const line of parts) if (line) send(line);
  });
}
setInterval(pumpJournal, 500);

app.get('/files/feedback/:name', (req, res) => {
  const name = req.params.name;
  if (!/^[\w.-]+\.md$/.test(name)) { res.status(400).end(); return; }
  const full = fileURLToPath(new URL(`../../feedback/${name}`, import.meta.url));
  if (!existsSync(full)) { res.status(404).end(); return; }
  res.type('text/plain').sendFile(full);
});

server.listen(cfg.PORT, '127.0.0.1', () => console.log(`dashboard http://127.0.0.1:${cfg.PORT}`));
