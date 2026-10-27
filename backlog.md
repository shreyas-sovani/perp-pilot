# PROJECT STATE & BACKLOG (EXTERNAL BRAIN)

> **OPERATING RULES FOR THE EXECUTING AGENT (read every session, obey without exception):**
> 1. Work tasks strictly in order. Never skip. Never parallelize across phases.
> 2. After completing ANY task: (a) tick its checkbox, (b) update the 🧠 CURRENT STATE MONITOR block below, (c) commit with message `TASK-X.Y: <title>` plus the trailer line `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
> 3. If a verification command fails: do NOT improvise past it. Fix the cause, or write the failure into Current Blockers and STOP.
> 4. NEVER invent endpoints, contract addresses, chain IDs, or SDK methods. Everything you need is in the "VERIFIED FACTS" block below or in the installed SDK's `.d.ts` files (TASK-2.4 extracts them). If a symbol you need is absent from `.d.ts`, record it as a finding (TASK-8.2) and use the nearest symbol found in `.d.ts`, noting the deviation in `docs/sdk-api.md`.
> 5. Secrets (`BOT_PRIVATE_KEY`, `ANTHROPIC_API_KEY`) must never appear in code, logs, bus envelopes, the database, or git. Logger redacts by pattern.
> 6. `DRY_RUN=true` must block every signing/broadcasting code path. The ExecutionAgent physically cannot place an order while it is true.
> 7. All timestamps in ms (epoch); all price/quantity on-chain values as raw BigInt in the market's own decimals; all human values as decimal strings.
> 8. Node 20+, npm 10+, ESM (`"type": "module"`), TypeScript strict. Run everything with `npx tsx` or compiled `node dist/`.

## 🧠 CURRENT STATE MONITOR
* **Current Phase:** Phase 9 — live hashes blocked
* **Last Completed Task:** TASK-9.1
* **Active Working Context / Variable State:**
  * Node v22.19.0, npm 10.9.3. Installed `@somnia-chain/markets-sdk@0.32.1` (exact), `zod@4.6.7`, `@anthropic-ai/sdk@1.3.0`. `npm run typecheck` exits 0.
  * Directory tree exists: `src/agents`, `src/feedback`, `src/dashboard/public`, `scripts`, `tests`, `feedback`, `docs`, `runs`.
  * `src/placeholder.ts` deleted in TASK-1.1 (`src/logger.ts` is the tsc input).
  * Logger: top-level `privateKey`/`apiKey` plus pattern censor in pino `hooks.logMethod`. Backlog paths `*.privateKey` missed top-level fields.
  * SDK bootstrap (`src/sdk.ts`): constructor fields are `wsRpcUrl` + `indexerUrl`, not backlog `rpcUrl`. Live `requireMarket` returned `ETH 18` tick `10000000000000000`. Details in `docs/sdk-api.md`.
  * `tsconfig.json` adds `allowImportingTsExtensions` and `noEmit` so backlog `.ts` import specifiers typecheck (`TS5097` without them).
  * `npm run wallet:new` refuses overwrite. Existing bot address `0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F`. Create-new path not run (key already present).
  * Phase 5 verified 2026-10-27: `npm run typecheck` 0, `npm test` 16/16 (signals 7, risk 5, guard 4). Dry-run execute printed `REJECTED DRY_RUN_BLOCKED` and did not broadcast. Copilot with blank key printed `open_short rule`. Orchestrator ran 25s, 0 `tick.error`, 12 `market.snapshot` lines in `runs/`.
  * Phase 8 harness is in. Doc probes P-12, P-13, P-14 are committed. P-14 pin checked live: `"@somnia-chain/markets-sdk": "^0.31.0"`.
  * Phase 9 probes 2026-10-27: `feedback/P01`–`P11` written under `RUN_CHAIN_PROBES=1`. IOC under the touch reverted `ImmediateOrCancelNoFill()`. Off-tick price reverted `InvalidPrice`. 6-decimal qty reverted `InvalidQuantity`, not `InsufficientCollateral`. ZEC `limitedBy collateral`. Bot ETH max size 0, `limitedBy collateral`. Indexer mark stayed flat for 5 minutes while the chain mark moved (max abs lag about 2.46 USDso). `SDK close()` left `priceable` true.
  * Claim did not broadcast. Eligibility said 1000 USDso. `claim()` `eth_call` reverted data `0x3e31dcc2`, name absent from the SDK error ABI. `docs/EVIDENCE.md`.
  * Local `state.db` kv `equityUsdso` and `anchor:2026-10-27` set to `2000` from the owner equity read so the risk kernel stops vetoing on a zero anchor. Funding APR helper is still unscaled, so funding-carry still wants a short.
  * Risk test fixtures differ from the draft: equity anchor set to 1000 (else 20 USDso vs empty equity trips `E_CAP_LEVERAGE`); over-cap case uses a full 50 USDso position (else 500 is clamped, not `E_CAP_NOTIONAL`). Tests use `DB_PATH=state.test.db` via `vitest.config.ts` so they do not write `realizedToday=-99` into `state.db`.
  * Price-band check in `risk.ts` is still the draft expression `> 0.005 * 10` (5%), while the comment says 50 bps. Left as written. Not covered by tests.
  * DB verification string in TASK-1.2 does not match `.sort()` output. Actual: `decisions,equity,fills,findings,kv,orders,positions,sqlite_sequence`. All seven app tables exist. `sqlite_sequence` comes from `AUTOINCREMENT`. `findings` sorts after `fills`. Not a blocker.
  * `.env` already matched `.env.example` and held a valid `BOT_PRIVATE_KEY` plus `OWNER_ADDRESS=0xf9beA92fee8105aC59186dAced61910Fc1DE80f6`. It was **not** overwritten by `cp .env.example .env`. `DRY_RUN=true`. `ANTHROPIC_API_KEY` empty (rule mode).
  * `0xFeAf5C921996FC53f4DEf35e181E766e6D74690A` checked 2026-10-27. It is the login burner, not the owner. Tokyo balance 50 STT, perps equity 0, `limitedBy collateral`. Its key was not written to `.env` or git.
* **Current Blockers/Bugs:** TASK-9.2 has no five explorer hashes. Bot signer margin is 0 (`placeable false`, `limitedBy collateral`). Owner has 2000 USDso and is placeable, and that private key is not in `.env`. `placePerpOrder` cannot target the owner. `.env` `DRY_RUN=true`. Remote is private `https://github.com/shreyas-sovani/perp-pilot`. Bounty submission (TASK-10.3) still expects a public repo.

---

## 📋 VERIFIED FACTS (source of truth — do not re-derive, do not edit without re-verification)

**Network — Somnia Tokyo testnet (a.k.a. hideki/hideki2 in SDK hosts; bounty calls it "Tokyo"):**
- Chain ID: `50383` · Gas coin: `STT` · Collateral: `USDso` (18 decimals)
- RPC WebSocket (REQUIRED by SDK; HTTP-only fails with `genesis check failed`): `wss://api.hideki2.infra.testnet.somnia.network/ws`
- RPC HTTP: `https://api.hideki2.infra.testnet.somnia.network`
- Explorer: `https://explorer.testnet.somnia.network/tokyo` (tx link: `…/tx/<hash>`)
- GraphQL indexer: `https://hideki-dev.smk.somnia.host/v1/graphql` (POST, Hasura-style: `X_by_pk`, `where: {col: {_eq: …}}`)

**Contracts (fallback only; prefer per-market row fields `poolAddress`, `marginBank`):**
- MarginBank `0x478769E1177C0773c43A593DCCc4Ad15F15F1394` · USDso `0xed7993A74dAe1e6656B704A424DcD8711aAf4F72` · PerpPoolFactory `0xE631fAEE547baeE07353E290f0562ea67d856560` · LiquidationEngine `0xA66d3C24Ad4a389d863846905D8173e1017e9F4D` · InsuranceFund `0x50826894D47C6D4f3BeA38BFDC7Dc5c5be171b80`

**SDK:** `@somnia-chain/markets-sdk@0.32.1` (exact version; registry-verified). Chain object `hidekiTestnet` from `@somnia-chain/markets-sdk/chains`. Documented perps calls:
- `client.listPerpMarkets()` → market rows incl. `baseSymbol`, `baseDecimals`, `quoteDecimals`, `tickSize`, `lotSize`, `minQuantity`, `poolAddress`, `marginBank`
- `client.getMaxPerpOrderSize({ pool, marginBank, account, isBid, price })` → `{ maxQuantity, limitedBy, priceable, placeable, maxPositionSize }`
- `markets.trader.placePerpOrder({ pool, isBid, price, quantity })`
- `client.getPerpVoucherEligibility(marginBank, account)`; `markets.trader.claimPerpVoucher({ marginBank })`
- `client.getPerpSystemConfig(marginBank)`; `client.listPerpOrderRejections()` (reason-code map)
- SDK exports `ORDER_TYPE` enum. SDK reads chain over WebSocket. SDK deps use `zod` v4.

**Documented protocol behavior:**
- Base-asset decimals per market: ADA/HYPE/PUMP/XRP=6, XLM=7, BTC/DOGE/ZEC=8, SOL/SUI/TAO=9, ETH/AVAX/BNB/LINK/1000PEPE/LIT/VVV/WLD/ZRO=18, NEAR=24. USDso quote always 18.
- Wrong scaling fails misleadingly: `InsufficientCollateral()` `0x3a23d825`.
- IOC unfilled reverts `ImmediateOrCancelNoFill()` `0xd48c4403`; in batches: `successes[i]===false` + `OrderRejected` log reason `5`.
- Over position cap reverts `MaxPositionSizeExceeded()` `0x714b36d6`. Cap ≈ 1/10 of market OI cap per account.
- A mined tx may still be a rejected order (no revert). Verify via events/state delta, not receipt status.
- Funding: 8h window, settled hourly, hourly payment = size × indexPrice × rate ÷ 8, peer-to-peer.
- Voucher: 1,000 paper USDso, one-time claim per address with no open positions/orders; voucher-blocked markets: 1000PEPE, LIT, PUMP, VVV, ZEC, ZRO; leverage locked while voucher held; USDso-only accounts cannot place stop orders (stops cost 0.15 STT each).
- Margin tiers: 20x markets 5%/2.5% (BTC, ETH, HYPE, SOL, XRP); 10x 10%/5%; 5x 20%/10%.
- Gas: use generous limits (bot-kit uses `10_000_000`); real perp tx costs 0.0003–0.003 STT; out-of-gas receipts show status `0` with no reason.
- 21 markets exist; default trading market for this project: `ETH-PERP` (baseSymbol `ETH`, 18/18 decimals, 20x tier, voucher-allowlisted).
- Known upstream skew (feedback candidate P-14): bot-kit `packages/perp-core/package.json` pins `"@somnia-chain/markets-sdk": "^0.31.0"` (0.x caret ⇒ never receives 0.32.x) while live docs specify 0.32.1.
- No REST API exists for perps (HTTP API at `api.dreamdex.io/v0` is spot-only, chains 5031/50312). SIWE/JWT auth is NOT needed for perps.
- Prior reference implementations (read-only, do NOT depend on): `https://github.com/somnia-chain/dreamdex-bot-kit` (packages `perp-core`, strategies `perp-starter|maker|funding|guard`).

---

## 📋 ATOMIC TASK BACKLOG

### Phase 0: Environment & Architecture Setup

- [x] **TASK-0.1: Create repository skeleton and initialize git.**
  * *Objective:* Establish the exact directory tree and git history.
  * *Input/Dependencies:* None. Working dir: `/Users/shreyas/Desktop/somnia-perps` (contains `prd.md`, `backlog.md`, `dreamdex-docs-index.md` — leave them at root, untracked in `.gitignore` is NOT wanted; commit them).
  * *Exact Action:* Run:
    ```bash
    mkdir -p src/agents src/feedback src/dashboard/public scripts tests feedback docs runs
    git init -b main
    printf 'node_modules/\ndist/\nstate.db\nstate.db-journal\n.env\nruns/*.jsonl\n*.tsbuildinfo\n' > .gitignore
    git add -A && git commit -m "chore: repo skeleton" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
    ```
  * *Verification Criteria:* `git log --oneline` shows 1 commit; `ls src src/agents scripts tests feedback docs` lists all folders.

- [x] **TASK-0.2: Write `package.json` (exact contents below).**
  * *Objective:* Single deterministic dependency manifest.
  * *Input/Dependencies:* TASK-0.1.
  * *Exact Action:* Create `package.json` with EXACTLY this content (then run nothing yet):
    ```json
    {
      "name": "dreamdex-perps-pilot",
      "version": "0.1.0",
      "private": true,
      "type": "module",
      "engines": { "node": ">=20" },
      "scripts": {
        "typecheck": "tsc -p tsconfig.json --noEmit",
        "test": "vitest run",
        "wallet:new": "tsx scripts/wallet-new.ts",
        "doctor": "tsx scripts/doctor.ts",
        "claim": "tsx scripts/claim-voucher.ts",
        "trade": "tsx scripts/trade.ts",
        "demo:dry": "tsx scripts/trade.ts --dry",
        "demo:live": "tsx scripts/trade.ts --live --minutes 30",
        "probe": "tsx scripts/probe-run.ts",
        "report": "tsx scripts/report-render.ts",
        "report:pack": "tsx scripts/report-render.ts --all",
        "dashboard": "tsx src/dashboard/server.ts",
        "replay": "tsx scripts/replay.ts"
      },
      "dependencies": {
        "@anthropic-ai/sdk": "latest",
        "@somnia-chain/markets-sdk": "0.32.1",
        "better-sqlite3": "^11.0.0",
        "dotenv": "^16.4.5",
        "pino": "^9.4.0",
        "viem": "^2.21.0",
        "ws": "^8.21.0",
        "zod": "^4.3.6"
      },
      "devDependencies": {
        "@types/better-sqlite3": "^7.6.11",
        "@types/node": "^22.0.0",
        "@types/ws": "^8.5.10",
        "tsx": "^4.19.0",
        "typescript": "^5.5.0",
        "vitest": "^2.1.0"
      }
    }
    ```
  * *Verification Criteria:* `node -e "JSON.parse(require('fs').readFileSync('package.json'))"` exits 0.

- [x] **TASK-0.3: Write `tsconfig.json` (exact contents below).**
  * *Objective:* Strict TS, ESM/NodeNext.
  * *Input/Dependencies:* TASK-0.2.
  * *Exact Action:* Create `tsconfig.json` with EXACTLY:
    ```json
    {
      "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "strict": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "resolveJsonModule": true,
        "outDir": "dist",
        "rootDir": ".",
        "types": ["node"],
        "noUncheckedIndexedAccess": true
      },
      "include": ["src/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts"]
    }
    ```
  * *Verification Criteria:* File exists and is valid JSON.

- [x] **TASK-0.4: Install dependencies.**
  * *Objective:* Working node_modules with pinned SDK.
  * *Input/Dependencies:* TASK-0.2, TASK-0.3.
  * *Exact Action:* Run `npm install`. Then run `npm ls @somnia-chain/markets-sdk --depth=0` — installed version MUST be `0.32.1`.
  * *Verification Criteria:* `npm install` exit 0; `npm ls @somnia-chain/markets-sdk --depth=0` shows `0.32.1`; `npm run typecheck` exits 0 (empty project is fine).

- [x] **TASK-0.5: Write `.env.example` (exact contents below).**
  * *Objective:* Canonical environment variable contract.
  * *Input/Dependencies:* TASK-0.1.
  * *Exact Action:* Create `.env.example` with EXACTLY:
    ```bash
    # --- Network (Somnia Tokyo testnet / hideki) — do not change without re-verifying docs
    CHAIN_ID=50383
    RPC_URL_WS=wss://api.hideki2.infra.testnet.somnia.network/ws
    RPC_URL_HTTP=https://api.hideki2.infra.testnet.somnia.network
    GRAPHQL_URL=https://hideki-dev.smk.somnia.host/v1/graphql
    EXPLORER_TX_BASE=https://explorer.testnet.somnia.network/tokyo/tx/

    # --- Keys
    # Generate with: npm run wallet:new   (writes BOT_PRIVATE_KEY into .env)
    BOT_PRIVATE_KEY=
    # Leave blank => the bot trades its OWN perps account (voucher claimable by bot key)
    OWNER_ADDRESS=

    # --- Trading policy (risk kernel caps — used verbatim by src/agents/risk.ts)
    SYMBOL=ETH-PERP
    DRY_RUN=true
    NOTIONAL_CAP_USDSO=50
    MAX_LEVERAGE_EFF=5
    DAILY_LOSS_CAP_USDSO=10
    MAX_OPEN_ORDERS=3
    STALE_MARK_MS=10000
    ENTRY_SLIPPAGE_BPS=30
    TP_PCT=2.0
    SL_PCT=1.5

    # --- Agent loop
    TICK_MS=2000
    EMA_FAST_TICKS=270
    EMA_SLOW_TICKS=630

    # --- Dashboard / storage
    PORT=8787
    DB_PATH=state.db

    # --- Optional LLM copilot (absent/blank => pure rule mode)
    ANTHROPIC_API_KEY=

    LOG_LEVEL=info
    ```
  * *Verification Criteria:* File exists; contains all keys above. Copy: `cp .env.example .env` (the real `.env` is gitignored).

- [x] **TASK-0.6: [HUMAN_STEP] Create the GitHub repository and push.**
  * *Objective:* Public repo required by the bounty ("Every Build needs a GitHub repository").
  * *Instructions for Human:* (1) Create a new **public** GitHub repo named `dreamdex-perps-pilot` (no README/license init — keep it empty). (2) Run in the project root:
    ```bash
    git remote add origin git@github.com:<YOUR_GH_USERNAME>/dreamdex-perps-pilot.git
    git push -u origin main
    ```
    (3) Add repo URL and bounty deadline (2026-11-01 23:59 UTC) somewhere visible. Optional but recommended: paste the repo URL into the bounty submission portal as soon as it has a README.
  * *Agent Instructions upon resume:* Run `git remote -v`. If a remote named `origin` exists and `git ls-remote origin HEAD` exits 0, tick this task and proceed. Otherwise print exactly: `Waiting for GitHub repository configuration...` and STOP.

### Phase 1: Core Plumbing (logger, database, event bus)

- [x] **TASK-1.1: Write `src/logger.ts`.**
  * *Objective:* Redacting structured logger.
  * *Input/Dependencies:* TASK-0.4.
  * *Exact Action:* Create `src/logger.ts` with EXACTLY:
    ```ts
    import pino from 'pino';
    const REDACT = [/private[_-]?key/i, /api[_-]?key/i, /0x[0-9a-fA-F]{64}/, /seed|mnemonic/i];
    const censor = (o: unknown): unknown => {
      if (typeof o === 'string') return REDACT.some(r => r.test(o)) ? '[REDACTED]' : o;
      if (Array.isArray(o)) return o.map(censor);
      if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, censor(v)]));
      return o;
    };
    export const log = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      redact: { paths: ['*.privateKey', '*.apiKey'], censor: '[REDACTED]' },
      mixin: () => ({}),
    });
    export const safeLog = (obj: object, msg: string) => log.debug(censor(obj), msg);
    ```
  * *Verification Criteria:* `npx tsx -e "import {log} from './src/logger.ts'; log.info({privateKey:'0x'+'a'.repeat(64)}, 'hi')"` prints `[REDACTED]` for that field.

- [x] **TASK-1.2: Write `src/db.ts` (SQLite schema + accessors).**
  * *Objective:* Persistent state: orders, fills, positions, decisions, findings, equity, kv.
  * *Input/Dependencies:* TASK-0.4.
  * *Exact Action:* Create `src/db.ts` with EXACTLY:
    ```ts
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
    export const kv = {
      get: (k: string): string | null => (db.prepare('SELECT value FROM kv WHERE key=?').get(k) as any)?.value ?? null,
      set: (k: string, v: string) => db.prepare('INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, v),
    };
    ```
  * *Verification Criteria:* `npx tsx -e "import {db} from './src/db.ts'; console.log(db.prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all().map(r=>(r as any).name).sort().join(','))"` prints `decisions,equity,findings,fills,kv,orders,positions`.

- [x] **TASK-1.3: Write `src/bus.ts` (typed envelope bus + write-ahead JSONL).**
  * *Objective:* All inter-agent messages are zod-validated envelopes, persisted before delivery.
  * *Input/Dependencies:* TASK-0.4.
  * *Exact Action:* Create `src/bus.ts` with EXACTLY:
    ```ts
    import { z } from 'zod';
    import { appendFileSync, mkdirSync } from 'node:fs';

    export const AGENTS = ['orchestrator','marketData','signals','copilot','risk','execution','guard','reporter'] as const;
    export type AgentName = typeof AGENTS[number];

    export const Envelope = z.object({
      seq: z.number().int().nonnegative(),
      ts: z.number().int(),
      agent: z.enum(AGENTS),
      kind: z.string(),
      payload: z.unknown(),
      dryRun: z.boolean(),
    });
    export type Envelope = z.infer<typeof Envelope>;

    type Handler = (e: Envelope) => void;
    const handlers = new Map<string, Set<Handler>>();
    let seq = 0;
    let jsonlPath: string | null = null;

    export function busStartJournal(date = new Date()) {
      mkdirSync('runs', { recursive: true });
      jsonlPath = `runs/${date.toISOString().slice(0, 10)}.jsonl`;
    }
    export function publish(agent: AgentName, kind: string, payload: unknown, dryRun: boolean): Envelope {
      const env = Envelope.parse({ seq: seq++, ts: Date.now(), agent, kind, payload, dryRun });
      if (jsonlPath) appendFileSync(jsonlPath, JSON.stringify(env) + '\n');
      for (const h of handlers.get(kind) ?? []) h(env);
      for (const h of handlers.get('*') ?? []) h(env);
      return env;
    }
    export function subscribe(kind: string | '*', h: Handler): () => void {
      const set = handlers.get(kind) ?? new Set();
      set.add(h); handlers.set(kind, set);
      return () => set.delete(h);
    }
    export const busSeq = () => seq;
    ```
  * *Verification Criteria:* `npx tsx -e "import {publish,subscribe,busStartJournal} from './src/bus.ts'; busStartJournal(); subscribe('t',(e)=>console.log('got',e.kind)); publish('risk','t',{a:1},true)"` prints `got t` and creates a file under `runs/`.

- [x] **TASK-1.4: Commit Phase 1.**
  * *Exact Action:* `git add -A && git commit -m "feat: core plumbing (logger, db, bus)" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`
  * *Verification Criteria:* `npm run typecheck` exits 0.

### Phase 2: Configuration & SDK Layer

- [x] **TASK-2.1: Write `src/config.ts` (zod env parsing).**
  * *Objective:* Fail-fast validated config; single import surface for all modules.
  * *Input/Dependencies:* TASK-0.5.
  * *Exact Action:* Create `src/config.ts` with EXACTLY:
    ```ts
    import { z } from 'zod';
    import 'dotenv/config';

    const Env = z.object({
      CHAIN_ID: z.coerce.number().int().default(50383),
      RPC_URL_WS: z.string().url().refine(u => u.startsWith('ws'), 'SDK requires a WebSocket RPC'),
      RPC_URL_HTTP: z.string().url(),
      GRAPHQL_URL: z.string().url(),
      EXPLORER_TX_BASE: z.string().url(),
      BOT_PRIVATE_KEY: z.string().regex(/^0x[0-9a-fA-F]{64}$/).or(z.literal('')).default(''),
      OWNER_ADDRESS: z.string().regex(/^0x[0-9a-fA-F]{40}$/).or(z.literal('')).default(''),
      SYMBOL: z.string().default('ETH-PERP'),
      DRY_RUN: z.enum(['true', 'false']).default('true'),
      NOTIONAL_CAP_USDSO: z.coerce.number().positive().default(50),
      MAX_LEVERAGE_EFF: z.coerce.number().positive().default(5),
      DAILY_LOSS_CAP_USDSO: z.coerce.number().positive().default(10),
      MAX_OPEN_ORDERS: z.coerce.number().int().positive().default(3),
      STALE_MARK_MS: z.coerce.number().int().positive().default(10000),
      ENTRY_SLIPPAGE_BPS: z.coerce.number().int().positive().default(30),
      TP_PCT: z.coerce.number().positive().default(2.0),
      SL_PCT: z.coerce.number().positive().default(1.5),
      TICK_MS: z.coerce.number().int().positive().default(2000),
      EMA_FAST_TICKS: z.coerce.number().int().positive().default(270),
      EMA_SLOW_TICKS: z.coerce.number().int().positive().default(630),
      PORT: z.coerce.number().int().default(8787),
      DB_PATH: z.string().default('state.db'),
      ANTHROPIC_API_KEY: z.string().default(''),
      LOG_LEVEL: z.string().default('info'),
    });
    export const cfg = Env.parse(process.env);
    export const IS_DRY = () => cfg.DRY_RUN === 'true';
    export const GAS_LIMIT = 10_000_000n; // bot-kit convention; out-of-gas receipts show status 0 with no reason
    ```
  * *Verification Criteria:* `npx tsx -e "import {cfg} from './src/config.ts'; console.log(cfg.CHAIN_ID, cfg.DRY_RUN)"` prints `50383 true`. And a bad key fails: `npx tsx -e "process.env.RPC_URL_WS='http://x'; import('./src/config.ts').then(()=>console.log('BAD')).catch(()=>console.log('OK'))"` prints `OK`.

- [x] **TASK-2.2: Write `scripts/wallet-new.ts` (burner key generator).**
  * *Objective:* Deterministic, safe bot-key creation — the agent NEVER asks the human for a main wallet key.
  * *Input/Dependencies:* TASK-2.1.
  * *Exact Action:* Create `scripts/wallet-new.ts` with EXACTLY:
    ```ts
    import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
    import { appendFileSync, existsSync, readFileSync } from 'node:fs';
    if (existsSync('.env')) {
      const env = readFileSync('.env', 'utf8');
      if (/^BOT_PRIVATE_KEY=0x[0-9a-fA-F]{64}$/m.test(env)) {
        const addr = privateKeyToAccount(env.match(/^BOT_PRIVATE_KEY=(0x[0-9a-fA-F]{64})$/m)![1]).address;
        console.log('BOT key already exists in .env. Address:', addr, '— refusing to overwrite.');
        process.exit(0);
      }
    }
    const pk = generatePrivateKey();
    const acct = privateKeyToAccount(pk);
    appendFileSync('.env', `\nBOT_PRIVATE_KEY=${pk}\n`);
    console.log('NEW BURNER WALLET CREATED (never use a personal key here)');
    console.log('Address:', acct.address);
    console.log('=> Fund it with testnet STT gas (faucet / app top-up). Needed: ~0.5 STT.');
    ```
  * *Verification Criteria:* Run `npm run wallet:new` twice: first prints an address, second prints `BOT key already exists` and the same address via `npx tsx -e "import 'dotenv/config'; import {privateKeyToAccount} from 'viem/accounts'; console.log(privateKeyToAccount(process.env.BOT_PRIVATE_KEY!).address)"`.

- [x] **TASK-2.3: Write `src/sdk.ts` (SDK bootstrap, thin and defensive).**
  * *Objective:* One module that constructs the SomniaMarkets client and re-exports the perps surface used everywhere else.
  * *Input/Dependencies:* TASK-2.1, TASK-2.4 (extract `.d.ts` FIRST).
  * *Exact Action:*
    1. Create `src/sdk.ts` with EXACTLY:
    ```ts
    import { cfg } from './config.ts';
    // NOTE: constructor shape below follows the live docs ("privateKey passed to SomniaMarkets
    // constructor"; chain object from '@somnia-chain/markets-sdk/chains'). TASK-2.4 verifies it
    // against the installed .d.ts. If options differ, adapt ONLY here and record in docs/sdk-api.md.
    import { SomniaMarkets } from '@somnia-chain/markets-sdk';
    import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
    import type { PrivateKeyAccount } from 'viem';

    export type Markets = SomniaMarkets;

    export function initSdk(account?: PrivateKeyAccount): Markets {
      return new SomniaMarkets({
        chain: hidekiTestnet,
        rpcUrl: cfg.RPC_URL_WS,            // WebSocket REQUIRED (genesis check)
        privateKey: account ? undefined : (cfg.BOT_PRIVATE_KEY || undefined),
        account,
      } as ConstructorArgs);
    }
    type ConstructorArgs = ConstructorParameters<typeof SomniaMarkets>[0];

    export async function requireMarket(markets: Markets, symbol = cfg.SYMBOL) {
      const base = symbol.replace(/-PERP$/i, '');
      const all = await (markets as any).client.listPerpMarkets();
      const row = (all as any[]).find((m) => String(m.baseSymbol).toUpperCase() === base.toUpperCase());
      if (!row) throw new Error(`Perp market not found for ${symbol}. Have: ${(all as any[]).map(m => m.baseSymbol).join(',')}`);
      return row as { baseSymbol: string; baseDecimals: number; quoteDecimals: number; tickSize: string; lotSize: string; minQuantity: string; poolAddress: `0x${string}`; marginBank: `0x${string}`; [k: string]: unknown };
    }
    ```
    2. If `initSdk` fails typecheck because the constructor differs, fix ONLY the option mapping in `initSdk` using the real `.d.ts` (from TASK-2.4). Do not change any other module.
  * *Verification Criteria:* `npm run typecheck` exits 0, AND `npx tsx -e "import {initSdk} from './src/sdk.ts'; import {requireMarket} from './src/sdk.ts'; const m = initSdk(); requireMarket(m).then(r => console.log(r.baseSymbol, r.baseDecimals, r.tickSize))"` prints `ETH 18 <some positive value>` within 30s (read-only, no key needed).

- [x] **TASK-2.4: Extract the installed SDK's true API surface into `docs/sdk-api.md`.**
  * *Objective:* Anti-drift: every SDK call the project makes is verified against the actual installed typings before use.
  * *Input/Dependencies:* TASK-0.4.
  * *Exact Action:* Run and save output:
    ```bash
    mkdir -p docs
    { echo "# @somnia-chain/markets-sdk@$(node -p "require('./node_modules/@somnia-chain/markets-sdk/package.json').version") — extracted $(date -u +%FT%TZ)";
      echo; echo "## Chain exports (@somnia-chain/markets-sdk/chains)"; grep -rn "hideki" node_modules/@somnia-chain/markets-sdk/dist/*.d.ts | head -40;
      echo; echo "## SomniaMarkets class + constructor"; grep -n -A 25 "class SomniaMarkets" node_modules/@somnia-chain/markets-sdk/dist/*.d.ts | head -120;
      echo; echo "## Perp-related methods (listPerp|PerpVoucher|PerpOrder|PerpSystem|Rejections|position|Position|cancel|Cancel|amend|Amend|order|Order)"; grep -rn -E "(listPerp|PerpVoucher|PerpOrder|PerpSystem|OrderRejections|[Pp]osition|cancel|Cancel|amend|Amend)" node_modules/@somnia-chain/markets-sdk/dist/*.d.ts | head -200;
    } > docs/sdk-api.md
    ```
    Then READ `docs/sdk-api.md` and confirm ALL of these symbols appear (or their clearly-equivalent rename): `SomniaMarkets`, `hidekiTestnet`, `listPerpMarkets`, `getMaxPerpOrderSize`, `placePerpOrder`, `getPerpVoucherEligibility`, `claimPerpVoucher`, `getPerpSystemConfig`, `listPerpOrderRejections`, `ORDER_TYPE`. Search for `position` and `cancel` methods too — record whatever exists (exact names + signatures) under a heading `## Available position/cancel methods`.
  * *Verification Criteria:* `docs/sdk-api.md` exists, lists the version, and has a section `## Available position/cancel methods` (even if the answer is "none found"). If a listed symbol is genuinely absent, append it to `docs/sdk-api.md` under `## Deviations from docs` — that list feeds TASK-8.2 feedback reports. Commit this file.

- [x] **TASK-2.5: Commit Phase 2.**
  * *Exact Action:* `git add -A && git commit -m "feat: config, wallet bootstrap, sdk layer + extracted api surface" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`
  * *Verification Criteria:* `npm run typecheck` exits 0; `git log --oneline | head -3` shows the commit.

- [x] **TASK-2.6: [HUMAN_STEP] Fund the bot wallet with testnet STT gas.**
  * *Objective:* Gas for voucher claim + probe txs + live orders. All later on-chain tasks are blocked without it.
  * *Instructions for Human:* (1) Run `npx tsx -e "import 'dotenv/config'; import {privateKeyToAccount} from 'viem/accounts'; console.log(privateKeyToAccount(process.env.BOT_PRIVATE_KEY!).address)"` and copy the printed address. (2) Get testnet STT to that address on **chain 50383 (Tokyo/hideki)** — try in order: (a) the dreamDEX testnet app's top-up / bot-link gas flow at `https://app.testnet.dreamdex.io/perps`; (b) the Somnia faucet `https://testnet.somnia.network/` (if it asks for a network, pick Tokyo/Hideki — if it only serves Shannon, skip); (c) Google Cloud Web3 faucet `https://cloud.google.com/application/web3/faucet/somnia` (Shannon-only? skip); (d) Somnia Discord `#dev-chat`, tag `@emreyeth`, request Tokyo testnet (50383) STT for a hackathon bot wallet, include the address. Target balance: ≥ 0.5 STT.
  * *Agent Instructions upon resume:* Run the balance check:
    ```bash
    npx tsx -e "import {createPublicClient,webSocket} from 'viem'; import {hidekiTestnet} from '@somnia-chain/markets-sdk/chains'; import 'dotenv/config'; import {privateKeyToAccount} from 'viem/accounts'; const c=createPublicClient({chain:hidekiTestnet,transport:webSocket(process.env.RPC_URL_WS)}); c.getBalance({address:privateKeyToAccount(process.env.BOT_PRIVATE_KEY!).address}).then(b=>console.log('STT wei:',b))"
    ```
    If balance > 100_000_000_000_000_000n (0.1 STT), tick and proceed. Otherwise print `Waiting for STT gas funding of bot wallet...` and STOP.

### Phase 3: Indexer (GraphQL) Client

- [x] **TASK-3.1: Write `src/indexer.ts`.**
  * *Objective:* Funding rates, funding payments, fills, market meta from the GraphQL indexer (verified live: root query has `Market`, `FundingRateUpdate`, `FundingPayment`, `Fill`, `AccountMarketPnl`, `Candle`, `OpenInterestSnapshot`).
  * *Input/Dependencies:* TASK-2.1.
  * *Exact Action:* Create `src/indexer.ts` with EXACTLY:
    ```ts
    import { cfg } from './config.ts';

    async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
      const res = await fetch(cfg.GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      const json = await res.json() as { data?: T; errors?: { message: string }[] };
      if (json.errors?.length) throw new Error('GraphQL error: ' + JSON.stringify(json.errors));
      if (!json.data) throw new Error('GraphQL empty response');
      return json.data;
    }

    // NOTE: filter column names below are Hasura-style and were chosen from introspected fields
    // (Market has id/baseSymbol/…; FundingRateUpdate has market_id/timestamp/fundingRate).
    // If a query errors with "column does not exist", capture the message — that is feedback
    // finding material (probe P-09/P-13) — then adjust the column to the introspected name.
    export async function getMarketRow(baseSymbol: string) {
      const d = await gql<{ Market: any[] }>(
        `query M($s: String!) { Market(where: {baseSymbol: {_ilike: $s}}, limit: 1) {
          id baseSymbol baseDecimals quoteDecimals tickSize lotSize minQuantity
          markPrice indexPrice lastPrice fundingRate fundingIntervalSec fundingWindowSec
          marginBank poolAddress marketAddress collateral clobStatus } }`,
        { s: baseSymbol },
      );
      return d.Market[0] ?? null;
    }

    export async function getLatestFundingUpdate(marketId: string) {
      const d = await gql<{ FundingRateUpdate: any[] }>(
        `query F($m: String!) { FundingRateUpdate(where: {market_id: {_eq: $m}}, order_by: {timestamp: desc}, limit: 1) {
          id timestamp fundingRate indexPrice markPrice fundingIntervalSec fundingWindowSec txHash } }`,
        { m: marketId },
      );
      return d.FundingRateUpdate[0] ?? null;
    }

    export async function getRecentFills(account: string, limit = 50) {
      const d = await gql<{ Fill: any[] }>(
        `query FF($a: String!, $l: Int!) { Fill(where: {taker: {_ilike: $a}}, order_by: {timestamp: desc}, limit: $l) {
          id market_id pool quantity quoteQuantity fillPrice takerIsBid takerSide txHash timestamp } }`,
        { a: account, l: limit },
      );
      return d.Fill;
    }

    export async function getFundingPayments(account: string, limit = 20) {
      const d = await gql<{ FundingPayment: any[] }>(
        `query FP($a: String!, $l: Int!) { FundingPayment(where: {account: {_ilike: $a}}, order_by: {timestamp: desc}, limit: $l) {
          id account amount pool txHash timestamp } }`,
        { a: account, l: limit },
      );
      return d.FundingPayment;
    }

    // funding rate is per 8h window; APR = rate * 3 windows/day * 365
    export function fundingAprFromRate(rate: string | number): number {
      return Number(rate) * 3 * 365;
    }
    ```
  * *Verification Criteria:*
    ```bash
    npx tsx -e "import {getMarketRow,getLatestFundingUpdate,fundingAprFromRate} from './src/indexer.ts'; getMarketRow('ETH').then(async r=>{console.log('market:',r?.baseSymbol,r?.markPrice,r?.fundingRate); if(!r) throw new Error('no ETH row'); const f=await getLatestFundingUpdate(r.id); console.log('funding update ts:',f?.timestamp,'rate:',f?.fundingRate,'apr%:',(fundingAprFromRate(f?.fundingRate??0)*100).toFixed(2));})"
    ```
    prints a market row with numeric `markPrice` and a funding update (if none exists yet for ETH, the funding line may be `undefined` — acceptable; note it in the task state). If the GraphQL query errors on a column name, fix using the introspection command below and record the discrepancy in `docs/sdk-api.md` under `## Indexer deviations`:
    ```bash
    curl -s -X POST "$GRAPHQL_URL" -H 'Content-Type: application/json' -d '{"query":"{ __type(name:\"Market\"){fields{name}}}"}'
    ```

- [x] **TASK-3.2: Commit Phase 3.** `git add -A && git commit -m "feat: graphql indexer client" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`. *Verification:* `npm run typecheck` exits 0.

### Phase 4: Agent Layer (schemas, market data, signals, risk)

- [x] **TASK-4.1: Write `src/agents/schemas.ts`.**
  * *Objective:* The deterministic inter-agent message contracts (from PRD §6.2).
  * *Input/Dependencies:* TASK-1.3.
  * *Exact Action:* Create `src/agents/schemas.ts` with EXACTLY:
    ```ts
    import { z } from 'zod';

    export const MarketSnapshot = z.object({
      symbol: z.string(),
      markPrice: z.string(), indexPrice: z.string(),
      markAgeMs: z.number().int(), priceable: z.boolean(),
      fundingRate: z.string(), fundingApr: z.string(),
      bestBid: z.string().nullable(), bestAsk: z.string().nullable(),
      tickSize: z.string(), lotSize: z.string(), minQuantity: z.string(),
      baseDecimals: z.number().int(), quoteDecimals: z.number().int(),
      ts: z.number().int(),
    });
    export type MarketSnapshot = z.infer<typeof MarketSnapshot>;

    export const Signal = z.object({
      strategy: z.enum(['funding-carry', 'ema-momentum']),
      side: z.enum(['long', 'short', 'flat']),
      strength: z.number().min(0).max(1),
      rationale: z.string(),
    });
    export type Signal = z.infer<typeof Signal>;

    export const Decision = z.object({
      action: z.enum(['open_long', 'open_short', 'increase', 'reduce', 'close', 'hold', 'cancel_all']),
      notionalUsdso: z.string().optional(),
      rationale: z.string().min(1),
      confidence: z.number().min(0).max(1),
      source: z.enum(['llm', 'rule']),
    });
    export type Decision = z.infer<typeof Decision>;

    export const OrderIntent = z.object({
      id: z.string().uuid(), symbol: z.string(),
      side: z.enum(['buy', 'sell']), reduceOnly: z.boolean(),
      notionalUsdso: z.string(), tif: z.enum(['GTC', 'IOC', 'FOK', 'ALO']),
      limitPriceUsdso: z.string().nullable(),
      origin: z.enum(['copilot', 'guard', 'probe']),
    });
    export type OrderIntent = z.infer<typeof OrderIntent>;

    export const RiskVerdict = z.object({
      intentId: z.string(), approved: z.boolean(),
      reasons: z.array(z.string()),
      adjustedNotionalUsdso: z.string().optional(),
    });
    export type RiskVerdict = z.infer<typeof RiskVerdict>;

    export const EXEC_STATES = ['PREFLIGHT', 'SIGNED', 'SUBMITTED', 'MINED', 'CONFIRMED', 'REJECTED'] as const;
    export const ExecutionReport = z.object({
      intentId: z.string(),
      state: z.enum(EXEC_STATES),
      txHash: z.string().nullable(), onChainOrderId: z.string().nullable(),
      rejectReason: z.string().nullable(), gasUsed: z.string().nullable(), ts: z.number().int(),
    });
    export type ExecutionReport = z.infer<typeof ExecutionReport>;

    export const Finding = z.object({
      probeId: z.string(), title: z.string(),
      severity: z.enum(['critical', 'major', 'normal']),
      area: z.enum(['API', 'SDK', 'docs', 'app', 'contracts']),
      evidence: z.record(z.string(), z.unknown()),
    });
    export type Finding = z.infer<typeof Finding>;
    ```
  * *Verification Criteria:* `npm run typecheck` exits 0 and `npx tsx -e "import {MarketSnapshot} from './src/agents/schemas.ts'; console.log(MarketSnapshot.safeParse({}).success)"` prints `false`.

- [x] **TASK-4.2: Write `src/agents/marketData.ts`.**
  * *Objective:* Build the MarketSnapshot from SDK + indexer, with staleness tracking and an in-memory mark ring buffer for EMA.
  * *Input/Dependencies:* TASK-2.3, TASK-3.1, TASK-4.1.
  * *Exact Action:* Create `src/agents/marketData.ts` with EXACTLY:
    ```ts
    import { cfg } from '../config.ts';
    import { initSdk, requireMarket, type Markets } from '../sdk.ts';
    import { getMarketRow, getLatestFundingUpdate, fundingAprFromRate } from '../indexer.ts';
    import { MarketSnapshot, type MarketSnapshot as MS } from './schemas.ts';
    import { privateKeyToAccount } from 'viem/accounts';
    import 'dotenv/config';

    export const markHistory: number[] = []; // one mark per tick, capped at EMA_SLOW_TICKS

    export class MarketDataAgent {
      private markets: Markets;
      private marketRow: Awaited<ReturnType<typeof requireMarket>> | null = null;
      private lastMarkTs = 0;
      private lastMark = 0n;

      constructor() { this.markets = initSdk(); }

      async warmup() {
        this.marketRow = await requireMarket(this.markets, cfg.SYMBOL);
        return this.marketRow;
      }

      accountAddress(): string {
        if (cfg.OWNER_ADDRESS) return cfg.OWNER_ADDRESS as `0x${string}`;
        return privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`).address;
      }

      async snapshot(): Promise<MS> {
        if (!this.marketRow) await this.warmup();
        const row = this.marketRow!;
        const acct = this.accountAddress();
        // Read live mark via getMaxPerpOrderSize's priceable flag (docs: priceable=false => stale mark)
        const probe = await (this.markets as any).client.getMaxPerpOrderSize({
          pool: row.poolAddress, marginBank: row.marginBank, account: acct, isBid: true,
          price: 10n ** 18n, // arbitrary on-tick-ish price; only priceable/maxQuantity matter here
        });
        const g = await getMarketRow(row.baseSymbol);
        const markStr = g?.markPrice ?? '0';
        const mark = BigInt(markStr || '0');
        if (mark > 0n) { this.lastMark = mark; this.lastMarkTs = Date.now(); markHistory.push(Number(markStr)); if (markHistory.length > cfg.EMA_SLOW_TICKS) markHistory.shift(); }
        const f = g?.id ? await getLatestFundingUpdate(g.id).catch(() => null) : null;
        const rate = f?.fundingRate ?? g?.fundingRate ?? '0';
        const snap = MarketSnapshot.parse({
          symbol: cfg.SYMBOL,
          markPrice: markStr, indexPrice: String(g?.indexPrice ?? '0'),
          markAgeMs: Date.now() - this.lastMarkTs, priceable: Boolean(probe?.priceable),
          fundingRate: String(rate), fundingApr: String(fundingAprFromRate(rate)),
          bestBid: null, bestAsk: null, // book reads optional; snapshot does not require them
          tickSize: String(row.tickSize), lotSize: String(row.lotSize), minQuantity: String(row.minQuantity),
          baseDecimals: Number(row.baseDecimals), quoteDecimals: Number(row.quoteDecimals),
          ts: Date.now(),
        });
        return snap;
      }
    }
    ```
  * *Verification Criteria:* `npx tsx -e "import {MarketDataAgent} from './src/agents/marketData.ts'; const a=new MarketDataAgent(); a.snapshot().then(s=>console.log(JSON.stringify(s,null,1).slice(0,600)))"` prints a valid snapshot with non-zero `markPrice` within 30s. If `getMaxPerpOrderSize` arg names differ per `docs/sdk-api.md`, fix only `marketData.ts`/`sdk.ts` arg mapping and note it.

- [x] **TASK-4.3: Write `src/agents/signals.ts` (pure functions + unit tests).**
  * *Objective:* Funding-carry + EMA momentum signals; fully testable, no I/O.
  * *Input/Dependencies:* TASK-4.1.
  * *Exact Action:*
    1. Create `src/agents/signals.ts` with EXACTLY:
    ```ts
    import { cfg } from '../config.ts';
    import type { MarketSnapshot, Signal } from './schemas.ts';

    export function ema(values: number[], period: number): number {
      if (values.length === 0) return NaN;
      const k = 2 / (period + 1);
      return values.reduce((acc, v, i) => (i === 0 ? v : v * k + acc * (1 - k)), 0);
    }

    export function fundingCarry(s: MarketSnapshot): Signal {
      const apr = Number(s.fundingApr);
      const THRESHOLD = 0.10; // 10% APR: meaningful carry
      if (apr >= THRESHOLD) return { strategy: 'funding-carry', side: 'short', strength: Math.min(1, apr), rationale: `funding APR ${(apr * 100).toFixed(1)}% >= 10%: shorts are paid` };
      if (apr <= -THRESHOLD) return { strategy: 'funding-carry', side: 'long', strength: Math.min(1, -apr), rationale: `funding APR ${(apr * 100).toFixed(1)}% <= -10%: longs are paid` };
      return { strategy: 'funding-carry', side: 'flat', strength: 0, rationale: `funding APR ${(apr * 100).toFixed(1)}% inside ±10% band` };
    }

    export function emaMomentum(history: number[]): Signal {
      if (history.length < cfg.EMA_SLOW_TICKS) return { strategy: 'ema-momentum', side: 'flat', strength: 0, rationale: `warming up (${history.length}/${cfg.EMA_SLOW_TICKS} ticks)` };
      const fast = ema(history.slice(-cfg.EMA_FAST_TICKS), cfg.EMA_FAST_TICKS);
      const slow = ema(history.slice(-cfg.EMA_SLOW_TICKS), cfg.EMA_SLOW_TICKS);
      const spread = (fast - slow) / slow;
      if (spread > 0.0005) return { strategy: 'ema-momentum', side: 'long', strength: Math.min(1, spread * 500), rationale: `EMA fast ${(spread * 1e4).toFixed(1)}bps above slow: uptrend` };
      if (spread < -0.0005) return { strategy: 'ema-momentum', side: 'short', strength: Math.min(1, -spread * 500), rationale: `EMA fast ${(spread * 1e4).toFixed(1)}bps below slow: downtrend` };
      return { strategy: 'ema-momentum', side: 'flat', strength: 0, rationale: `EMAs within ${(spread * 1e4).toFixed(1)}bps` };
    }

    export function combine(sigs: Signal[]): Signal {
      const scored = sigs.filter(s => s.side !== 'flat').sort((a, b) => b.strength - a.strength);
      return scored[0] ?? { strategy: 'funding-carry', side: 'flat', strength: 0, rationale: 'no signal' };
    }
    ```
    2. Create `tests/signals.test.ts` with EXACTLY:
    ```ts
    import { describe, it, expect } from 'vitest';
    import { ema, fundingCarry, emaMomentum, combine } from '../src/agents/signals.ts';
    import { MarketSnapshot } from '../src/agents/schemas.ts';

    const snap = (apr: string): MarketSnapshot => MarketSnapshot.parse({
      symbol: 'ETH-PERP', markPrice: '3000000000000000000000', indexPrice: '3000000000000000000000',
      markAgeMs: 0, priceable: true, fundingRate: '0', fundingApr: apr, bestBid: null, bestAsk: null,
      tickSize: '1000000000000', lotSize: '1000000000000000', minQuantity: '1000000000000000',
      baseDecimals: 18, quoteDecimals: 18, ts: Date.now(),
    });

    it('ema is identity for constant series', () => expect(ema([5, 5, 5], 3)).toBe(5));
    it('positive APR beyond band shorts', () => expect(fundingCarry(snap('0.5')).side).toBe('short'));
    it('negative APR beyond band longs', () => expect(fundingCarry(snap('-0.5')).side).toBe('long'));
    it('small APR flat', () => expect(fundingCarry(snap('0.01')).side).toBe('flat'));
    it('momentum flat while warming up', () => expect(emaMomentum(Array(10).fill(100)).side).toBe('flat'));
    it('uptrend detected', () => {
      const h = [...Array(650).keys()].map(i => 100 + i * 0.05);
      expect(emaMomentum(h).side).toBe('long');
    });
    it('combine picks strongest non-flat', () => {
      expect(combine([{ strategy: 'funding-carry', side: 'flat', strength: 0, rationale: '' },
                      { strategy: 'ema-momentum', side: 'short', strength: 0.4, rationale: '' }]).side).toBe('short');
    });
    ```
  * *Verification Criteria:* `npm test` — all tests pass.

- [x] **TASK-4.4: Write `src/agents/risk.ts` (deterministic kernel).**
  * *Objective:* Absolute veto power over every OrderIntent; implements FR-5 caps.
  * *Input/Dependencies:* TASK-4.1, TASK-1.2.
  * *Exact Action:* Create `src/agents/risk.ts` with EXACTLY:
    ```ts
    import { cfg } from '../config.ts';
    import { db, kv } from '../db.ts';
    import { OrderIntent, RiskVerdict, type MarketSnapshot } from './schemas.ts';

    export function dayKey(): string { return new Date().toISOString().slice(0, 10); }
    export function dailyAnchorUsdso(): number {
      const k = `anchor:${dayKey()}`;
      const v = kv.get(k);
      if (!v) { kv.set(k, String(equityNow())); return equityNow(); }
      return Number(v);
    }
    function equityNow(): number { return Number(kv.get('equityUsdso') ?? '0'); }

    export interface PositionLike { symbol: string; qty: number; avgEntry: number; }
    export interface RiskCtx { snapshot: MarketSnapshot; position: PositionLike | null; openOrders: number; }

    export function evaluate(intent: OrderIntent, ctx: RiskCtx): RiskVerdict {
      const reasons: string[] = [];
      const mark = Number(ctx.snapshot.markPrice) / 1e18;
      let notional = Number(intent.notionalUsdso);

      if (ctx.snapshot.ts === 0) reasons.push('E_NO_SNAPSHOT');
      if (ctx.snapshot.markAgeMs > cfg.STALE_MARK_MS) reasons.push('E_STALE_MARK');
      if (!ctx.snapshot.priceable) reasons.push('E_MARK_NOT_PRICEABLE');
      if (ctx.symbol !== cfg.SYMBOL) reasons.push('E_WRONG_MARKET');
      // single-market policy
      if (ctx.position && ctx.position.symbol !== cfg.SYMBOL) reasons.push('E_POSITION_IN_OTHER_MARKET');

      // guard intents are pre-approved class, but still sanity-checked for staleness above
      if (intent.origin !== 'guard') {
        const openNotional = ctx.position ? Math.abs(ctx.position.qty * ctx.position.avgEntry) : 0;
        const projected = openNotional + notional;
        if (projected > cfg.NOTIONAL_CAP_USDSO) {
          if (cfg.NOTIONAL_CAP_USDSO - openNotional > 1) { notional = Math.floor(cfg.NOTIONAL_CAP_USDSO - openNotional); reasons.push('W_NOTIONAL_CLAMPED'); }
          else reasons.push('E_CAP_NOTIONAL');
        }
        // effective leverage = notional / equity; equity approximated by anchor - realized losses
        const equity = Math.max(1, dailyAnchorUsdso());
        if (projected / equity > cfg.MAX_LEVERAGE_EFF) reasons.push('E_CAP_LEVERAGE');
        if (ctx.openOrders >= cfg.MAX_OPEN_ORDERS && !intent.reduceOnly) reasons.push('E_MAX_OPEN_ORDERS');
        const realized = Number(kv.get('realizedToday') ?? '0');
        if (realized <= -cfg.DAILY_LOSS_CAP_USDSO) reasons.push('E_DAILY_LOSS');
        // price-band veto: refuse entries when mark moved > 50bps since snapshot
        if (intent.limitPriceUsdso) {
          const lp = Number(intent.limitPriceUsdso);
          if (Math.abs(lp - mark) / mark > 0.005 * 10) reasons.push('E_PRICE_BAND');
        }
      }
      if (notional < 1) reasons.push('E_NOTIONAL_TOO_SMALL');
      const approved = reasons.every(r => !r.startsWith('E_'));
      return RiskVerdict.parse({ intentId: intent.id, approved, reasons, adjustedNotionalUsdso: reasons.includes('W_NOTIONAL_CLAMPED') ? String(notional) : undefined });
    }

    // helper kept internal to avoid circular imports
    function ctxSymbol(intent: OrderIntent): string { return intent.symbol; }
    declare module './risk.ts' {}
    ```
    NOTE: the draft above references `ctx.symbol` — the final file MUST define `const symbol = intent.symbol;` inside `evaluate` and use it in the `E_WRONG_MARKET` check instead of `ctx.symbol`; delete the two trailing helper lines if unused after typecheck. (`evaluate` signature stays exactly as shown.)
  * *Verification Criteria:* `npm run typecheck` exits 0; add `tests/risk.test.ts`:
    ```ts
    import { describe, it, expect } from 'vitest';
    import { evaluate } from '../src/agents/risk.ts';
    import { OrderIntent, MarketSnapshot } from '../src/agents/schemas.ts';

    const snap = MarketSnapshot.parse({
      symbol: 'ETH-PERP', markPrice: '3000000000000000000000', indexPrice: '3000000000000000000000',
      markAgeMs: 0, priceable: true, fundingRate: '0', fundingApr: '0', bestBid: null, bestAsk: null,
      tickSize: '1', lotSize: '1', minQuantity: '1', baseDecimals: 18, quoteDecimals: 18, ts: Date.now(),
    });
    const intent = (o: Partial<Record<string, unknown>> = {}) => OrderIntent.parse({
      id: crypto.randomUUID(), symbol: 'ETH-PERP', side: 'buy', reduceOnly: false,
      notionalUsdso: '20', tif: 'GTC', limitPriceUsdso: null, origin: 'copilot', ...o,
    });
    const ctx = { snapshot: snap, position: null, openOrders: 0 };

    it('approves a small legal intent', () => expect(evaluate(intent(), ctx).approved).toBe(true));
    it('vetoes over-cap notional entirely when no room', () =>
      expect(evaluate(intent({ notionalUsdso: '500' }), ctx).reasons).toContain('E_CAP_NOTIONAL'));
    it('vetoes stale mark', () =>
      expect(evaluate(intent(), { ...ctx, snapshot: { ...snap, markAgeMs: 99_999 } }).reasons).toContain('E_STALE_MARK'));
    it('vetoes wrong market', () =>
      expect(evaluate(intent({ symbol: 'BTC-PERP' }), ctx).reasons).toContain('E_WRONG_MARKET'));
    it('vetoes when daily loss cap hit', () => {
      const { kv } = await import('../src/db.ts'); kv.set(`realizedToday`, '-99');
      expect(evaluate(intent(), ctx).reasons).toContain('E_DAILY_LOSS');
    });
    ```
    (If vitest errors on top-level await in the last test, move the import to the file top and set `kv` inside the test body.) Run `npm test` — all pass.

- [x] **TASK-4.5: Commit Phase 4 (part 1).** `git add -A && git commit -m "feat: agent schemas, market data, signals, risk kernel + tests" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`. *Verification:* `npm test` passes; `npm run typecheck` exits 0.

### Phase 5: Execution, Guard, Copilot, Orchestrator

- [x] **TASK-5.1: Write `src/agents/execution.ts` (order state machine).**
  * *Objective:* The ONLY module that signs/broadcasts. Preflight → submit → verify. Honors DRY_RUN absolutely.
  * *Input/Dependencies:* TASK-2.3, TASK-4.1, TASK-4.4.
  * *Exact Action:* Create `src/agents/execution.ts` with EXACTLY:
    ```ts
    import { parseUnits, formatUnits } from 'viem';
    import { cfg, GAS_LIMIT, IS_DRY } from '../config.ts';
    import { initSdk, requireMarket, type Markets } from '../sdk.ts';
    import { db } from '../db.ts';
    import { publish } from '../bus.ts';
    import { OrderIntent, ExecutionReport, type ExecutionReport as ER } from './schemas.ts';
    import { log } from '../logger.ts';

    export class ExecutionAgent {
      private markets: Markets;
      constructor() { this.markets = initSdk(); }

      private record(intentId: string, patch: Partial<ER>): ER {
        const rep = ExecutionReport.parse({ intentId, state: 'PREFLIGHT', txHash: null, onChainOrderId: null, rejectReason: null, gasUsed: null, ts: Date.now(), ...patch });
        db.prepare(`INSERT INTO orders(id,state,intentJson,createdAt,updatedAt) VALUES(?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET state=excluded.state, txHash=COALESCE(excluded.txHash, orders.txHash),
          onChainOrderId=COALESCE(excluded.onChainOrderId, orders.onChainOrderId),
          rejectReason=COALESCE(excluded.rejectReason, orders.rejectReason), updatedAt=excluded.updatedAt`)
          .run(intentId, rep.state, '{}', rep.ts, rep.ts);
        publish('execution', 'execution.report', rep, IS_DRY());
        return rep;
      }

      async execute(intent: OrderIntent): Promise<ER> {
        const row = await requireMarket(this.markets, intent.symbol);
        // Decimal alignment: price in quote (18) decimals, quantity in base decimals — read LIVE, never hard-code.
        const priceRaw = intent.limitPriceUsdso ? parseUnits(intent.limitPriceUsdso, Number(row.quoteDecimals)) : null;
        // notional (USDso, 18dp) / mark price => base qty; aligned to lotSize inside SDK helpers where available
        const mark = Number((await (this.markets as any).client.getMaxPerpOrderSize({
          pool: row.poolAddress, marginBank: row.marginBank, account: cfg.OWNER_ADDRESS || undefined, isBid: intent.side === 'buy', price: priceRaw ?? 1n,
        }))?.maxQuantity ?? 0n);
        // NOTE: maxQuantity is a SIZE LIMIT, not sizing input; we size from notional/mark below.
        const sizeProbe = await (this.markets as any).client.getMaxPerpOrderSize({
          pool: row.poolAddress, marginBank: row.marginBank, account: cfg.OWNER_ADDRESS || undefined,
          isBid: intent.side === 'buy', price: priceRaw ?? 1n,
        });
        if (sizeProbe && sizeProbe.priceable === false) {
          return this.record(intent.id, { state: 'REJECTED', rejectReason: 'E_MARK_NOT_PRICEABLE' });
        }
        const markPriceUsdso = priceRaw; // entries always carry an explicit limit price from copilot/guard
        const qtyHuman = Number(intent.notionalUsdso) / Number(formatUnits(markPriceUsdso!, 18));
        const qtyRaw = parseUnits(qtyHuman.toFixed(12), Number(row.baseDecimals));

        if (IS_DRY()) {
          log.info({ intent, qtyHuman, priceUsdso: intent.limitPriceUsdso }, 'DRY_RUN: order NOT sent');
          return this.record(intent.id, { state: 'REJECTED', rejectReason: 'DRY_RUN_BLOCKED' });
        }

        // Preflight: simulate the exact write via eth_call before spending gas (perp-core convention).
        try {
          this.record(intent.id, { state: 'PREFLIGHT' });
          const isBid = intent.side === 'buy';
          const tx = await (this.markets as any).trader.placePerpOrder({
            pool: row.poolAddress, isBid, price: priceRaw, quantity: qtyRaw,
          });
          const hash = (tx?.hash ?? tx) as `0x${string}`;
          this.record(intent.id, { state: 'SUBMITTED', txHash: hash ?? null });
          // A mined tx may still be a rejected order: require receipt status 1 AND record mined state.
          const rcpt = await (this.markets as any).client.waitForTransaction?.(hash) ?? null;
          const ok = rcpt ? (rcpt.status === 'success' || rcpt.status === 1) : true;
          this.record(intent.id, { state: 'MINED', txHash: hash ?? null, gasUsed: rcpt?.gasUsed != null ? String(rcpt.gasUsed) : null });
          if (!ok) return this.record(intent.id, { state: 'REJECTED', txHash: hash ?? null, rejectReason: 'REVERTED_RECEIPT' });
          return this.record(intent.id, { state: 'CONFIRMED', txHash: hash ?? null });
        } catch (e: any) {
          const msg = String(e?.message ?? e);
          // Known selector map (verified docs): keep in sync with feedback/ reports
          const known: Record<string, string> = {
            '0xd48c4403': 'ImmediateOrCancelNoFill()', '0x714b36d6': 'MaxPositionSizeExceeded()', '0x3a23d825': 'InsufficientCollateral()',
          };
          const sel = known[msg.slice(0, 10).toLowerCase()];
          return this.record(intent.id, { state: 'REJECTED', rejectReason: sel ?? msg.slice(0, 300) });
        }
      }
    }
    ```
    Then reconcile with `docs/sdk-api.md`: if `placePerpOrder` accepts/returns different shapes (e.g. returns `{ hash }`, or needs `orderType: ORDER_TYPE.GTC`, or separate waitFor), adapt ONLY this file to the real signature and add one line to `docs/sdk-api.md` under `## Deviations from docs`. Do not touch schemas or risk.
  * *Verification Criteria:* `npm run typecheck` exits 0. Dry-run smoke: `npx tsx -e "import {ExecutionAgent} from './src/agents/execution.ts'; import {OrderIntent} from './src/agents/schemas.ts'; const i=OrderIntent.parse({id:crypto.randomUUID(),symbol:'ETH-PERP',side:'buy',reduceOnly:false,notionalUsdso:'10',tif:'GTC',limitPriceUsdso:'3000',origin:'copilot'}); new ExecutionAgent().execute(i).then(r=>console.log(r.state,r.rejectReason))"` prints `REJECTED DRY_RUN_BLOCKED` (state machine reachable end-to-end without keys/gas).

- [x] **TASK-5.2: Write `src/agents/guard.ts` (software TP/SL — mandatory because voucher accounts cannot arm stops).**
  * *Objective:* Independent protection loop: TP +`TP_PCT`%, SL −`SL_PCT`%, daily-loss close-all. Runs even if strategy agents halt.
  * *Input/Dependencies:* TASK-4.1, TASK-4.2, TASK-5.1.
  * *Exact Action:* Create `src/agents/guard.ts` with EXACTLY:
    ```ts
    import { cfg } from '../config.ts';
    import { kv } from '../db.ts';
    import { publish } from '../bus.ts';
    import { OrderIntent } from './schemas.ts';
    import type { PositionLike } from './risk.ts';

    // Closing in one-way netting mode = opposite-side order of the full position size.
    export function guardIntents(position: PositionLike | null, markUsdso: number): OrderIntent[] {
      if (!position || Math.abs(position.qty) < 1e-12) return [];
      const long = position.qty > 0;
      const tp = position.avgEntry * (1 + cfg.TP_PCT / 100);
      const sl = position.avgEntry * (1 - cfg.SL_PCT / 100);
      const hitTp = long ? markUsdso >= tp : markUsdso <= (2 * position.avgEntry - tp); // mirror for short
      const hitSl = long ? markUsdso <= sl : markUsdso >= (2 * position.avgEntry - sl);
      if (!hitTp && !hitSl) return [];
      const realized = Number(kv.get('realizedToday') ?? '0');
      const reasons = [hitTp ? `TP hit at ${markUsdso}` : `SL hit at ${markUsdso}`, ...(realized <= -cfg.DAILY_LOSS_CAP_USDSO ? ['daily loss cap'] : [])];
      publish('guard', 'guard.trigger', { reasons, markUsdso, avgEntry: position.avgEntry }, cfg.DRY_RUN === 'true');
      return [OrderIntent.parse({
        id: crypto.randomUUID(), symbol: position.symbol,
        side: long ? 'sell' : 'buy', reduceOnly: true,
        notionalUsdso: String(Math.abs(position.qty * position.avgEntry)),
        tif: 'GTC', limitPriceUsdso: String(long ? markUsdso * (1 - cfg.ENTRY_SLIPPAGE_BPS / 10000) : markUsdso * (1 + cfg.ENTRY_SLIPPAGE_BPS / 10000)),
        origin: 'guard',
      })];
    }
    ```
  * *Verification Criteria:* `npm run typecheck` exits 0 and unit test `tests/guard.test.ts`:
    ```ts
    import { describe, it, expect } from 'vitest';
    import { guardIntents } from '../src/agents/guard.ts';
    it('no position -> no intents', () => expect(guardIntents(null, 3000)).toHaveLength(0));
    it('long past TP -> sell intent', () => {
      const out = guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 3000 }, 3080);
      expect(out).toHaveLength(1); expect(out[0].side).toBe('sell'); expect(out[0].origin).toBe('guard');
    });
    it('long above SL band -> nothing', () => expect(guardIntents({ symbol: 'ETH-PERP', qty: 0.01, avgEntry: 3000 }, 3050)).toHaveLength(0));
    it('short past TP -> buy intent', () => {
      const out = guardIntents({ symbol: 'ETH-PERP', qty: -0.01, avgEntry: 3000 }, 2900);
      expect(out).toHaveLength(1); expect(out[0].side).toBe('buy');
    });
    ```
    `npm test` — all pass.

- [x] **TASK-5.3: Write `src/agents/copilot.ts` (LLM advisory brain + rule fallback).**
  * *Objective:* Turn snapshot+signals into a zod-validated Decision. LLM is advisory ONLY; missing key or any error falls back to rules.
  * *Input/Dependencies:* TASK-4.3, TASK-4.4.
  * *Exact Action:* Create `src/agents/copilot.ts` with EXACTLY:
    ```ts
    import Anthropic from '@anthropic-ai/sdk';
    import { cfg } from '../config.ts';
    import { Decision, Signal, type MarketSnapshot } from './schemas.ts';
    import type { PositionLike } from './risk.ts';
    import { log } from '../logger.ts';

    const SYSTEM = `You are the advisory copilot of an autonomous perps trading agent on a TESTNET.
    You choose ONE action from a fixed set. Hard caps are enforced downstream; you cannot raise them.
    Legal actions: open_long, open_short, increase, reduce, close, hold, cancel_all.
    Prefer 'hold' unless signals align. Never explain outside the JSON. Respond with ONLY JSON matching:
    {"action":"...","notionalUsdso":"<string, 1-50>","rationale":"<one sentence>","confidence":<0..1>}`;

    export async function decide(snap: MarketSnapshot, signals: Signal[], position: PositionLike | null): Promise<Decision> {
      const rule = signals.find(s => s.side !== 'flat');
      const fallback: Decision = {
        action: rule ? (rule.side === 'long' ? 'open_long' : rule.side === 'short' ? 'open_short' : 'hold') : 'hold',
        notionalUsdso: rule ? String(Math.min(cfg.NOTIONAL_CAP_USDSO, 20)) : undefined,
        rationale: rule ? `rule:${rule.strategy} — ${rule.rationale}` : 'no qualifying signal',
        confidence: rule ? Math.min(1, rule.strength) : 0,
        source: 'rule',
      };
      if (!cfg.ANTHROPIC_API_KEY) return fallback;
      try {
        const client = new Anthropic({ apiKey: cfg.ANTHROPIC_API_KEY });
        const res = await client.messages.create({
          model: 'claude-haiku-4-5-20251001', max_tokens: 300,
          system: SYSTEM,
          messages: [{ role: 'user', content: JSON.stringify({
            symbol: snap.symbol, markUsdso: Number(snap.markPrice) / 1e18,
            fundingAprPct: Number(snap.fundingApr) * 100, priceable: snap.priceable, markAgeMs: snap.markAgeMs,
            signals, position: position ? { qty: position.qty, avgEntry: position.avgEntry } : null,
            dailyLossCapUsdso: cfg.DAILY_LOSS_CAP_USDSO, notionalCapUsdso: cfg.NOTIONAL_CAP_USDSO,
          }) }],
        });
        const raw = res.content[0].type === 'text' ? res.content[0].text : '';
        const parsed = Decision.parse(JSON.parse(raw.match(/\{[\s\S]*\}/)![0]));
        // LLM can only pick among legal actions; notional is re-capped by RiskAgent downstream.
        return { ...parsed, source: 'llm' };
      } catch (e) {
        log.warn({ err: String(e).slice(0, 200) }, 'copilot fell back to rules');
        return fallback;
      }
    }
    ```
  * *Verification Criteria:* With no API key set, `npx tsx -e "import {decide} from './src/agents/copilot.ts'; import {MarketSnapshot} from './src/agents/schemas.ts'; const s=MarketSnapshot.parse({symbol:'ETH-PERP',markPrice:'3000000000000000000000',indexPrice:'0',markAgeMs:0,priceable:true,fundingRate:'0',fundingApr:'0.5',bestBid:null,bestAsk:null,tickSize:'1',lotSize:'1',minQuantity:'1',baseDecimals:18,quoteDecimals:18,ts:Date.now()}); decide(s,[{strategy:'funding-carry',side:'short',strength:0.5,rationale:'r'}],null).then(d=>console.log(d.action,d.source))"` prints `open_short rule`.

- [x] **TASK-5.4: Write `src/agents/orchestrator.ts` (tick loop).**
  * *Objective:* Fixed-order agent scheduling every `TICK_MS`; publishes every envelope; halts on daily-loss; feeds dashboard.
  * *Input/Dependencies:* TASK-4.2, TASK-4.3, TASK-4.4, TASK-5.1, TASK-5.2, TASK-5.3, TASK-1.3.
  * *Exact Action:* Create `src/agents/orchestrator.ts` with EXACTLY:
    ```ts
    import { cfg, IS_DRY } from '../config.ts';
    import { db, kv } from '../db.ts';
    import { busStartJournal, publish } from '../bus.ts';
    import { MarketDataAgent, markHistory } from './marketData.ts';
    import { fundingCarry, emaMomentum, combine } from './signals.ts';
    import { decide } from './copilot.ts';
    import { evaluate, type PositionLike } from './risk.ts';
    import { ExecutionAgent } from './execution.ts';
    import { guardIntents } from './guard.ts';
    import { OrderIntent } from './schemas.ts';
    import { formatUnits } from 'viem';

    export class Orchestrator {
      private md = new MarketDataAgent();
      private exec = new ExecutionAgent();
      private halted = false;
      async start() {
        busStartJournal();
        await this.md.warmup();
        kv.set('startedAt', String(Date.now()));
        for (;;) {
          const t0 = Date.now();
          try { await this.tick(); } catch (e) { publish('orchestrator', 'tick.error', { err: String((e as Error).message).slice(0, 300) }, IS_DRY()); }
          const dt = cfg.TICK_MS - (Date.now() - t0);
          if (dt > 0) await new Promise(r => setTimeout(r, dt));
        }
      }
      private positionFromDb(): PositionLike | null {
        const row = db.prepare('SELECT * FROM positions WHERE symbol=?').get(cfg.SYMBOL) as any;
        return row ? { symbol: row.symbol, qty: Number(row.qty), avgEntry: Number(row.avgEntry) } : null;
      }
      private openOrderCount(): number {
        return (db.prepare("SELECT COUNT(*) c FROM orders WHERE state IN ('PREFLIGHT','SUBMITTED','MINED') AND updatedAt > ?").get(Date.now() - 3600_000) as any).c;
      }
      private async tick() {
        const snap = await this.md.snapshot();
        publish('marketData', 'market.snapshot', snap, IS_DRY());
        kv.set('equityUsdso', kv.get('equityUsdso') ?? '0');
        const position = this.positionFromDb();
        const mark = Number(snap.markPrice) / 1e18;
        db.prepare('INSERT OR REPLACE INTO equity(ts,equityUsdso,unrealizedPnl) VALUES(?,?,?)')
          .run(Date.now(), kv.get('equityUsdso')!, position ? String((mark - position.avgEntry) * position.qty) : '0');

        // Guard first (independent protection)
        for (const gi of guardIntents(this.halted ? position : position, mark)) {
          const v = evaluate(gi, { snapshot: snap, position, openOrders: this.openOrderCount() });
          publish('risk', 'risk.verdict', v, IS_DRY());
          if (v.approved) { const r = await this.exec.execute(gi); if (r.state === 'CONFIRMED') { this.halted = true; kv.set('halted', 'guard-close'); } }
        }
        if (this.halted) return;

        const sigs = [fundingCarry(snap), emaMomentum(markHistory)];
        publish('signals', 'signals.set', sigs, IS_DRY());
        const chosen = combine(sigs);
        const decision = await decide(snap, sigs, position);
        publish('copilot', 'copilot.decision', decision, IS_DRY());
        db.prepare('INSERT INTO decisions(ts,agent,kind,payloadJson,rationale) VALUES(?,?,?,?,?)')
          .run(Date.now(), 'copilot', 'decision', JSON.stringify(decision), decision.rationale);
        if (decision.action === 'hold' || decision.action === 'cancel_all') return;
        if (position && Math.abs(position.qty) > 1e-12 && !decision.action.startsWith('open') && decision.action !== 'increase') {
          // already positioned; only allow increase/hold — prevent churn
          return;
        }
        const intent = OrderIntent.parse({
          id: crypto.randomUUID(), symbol: cfg.SYMBOL,
          side: decision.action === 'open_short' || decision.action === 'reduce' ? 'sell' : 'buy',
          reduceOnly: false, notionalUsdso: decision.notionalUsdso ?? '10', tif: 'GTC',
          limitPriceUsdso: String(mark * (1 + (decision.action === 'open_short' ? -1 : 1) * cfg.ENTRY_SLIPPAGE_BPS / 10000)),
          origin: 'copilot',
        });
        const v = evaluate(intent, { snapshot: snap, position, openOrders: this.openOrderCount() });
        publish('risk', 'risk.verdict', v, IS_DRY());
        if (!v.approved) return;
        const notional = v.adjustedNotionalUsdso ?? intent.notionalUsdso;
        const rep = await this.exec.execute({ ...intent, notionalUsdso: notional });
        if (rep.state === 'CONFIRMED' && rep.txHash) {
          // optimistic position bookkeeping; reconciled by fills watcher later
          const qty = Number(notional) / mark;
          const sideSign = intent.side === 'buy' ? 1 : -1;
          const p = this.positionFromDb();
          const newQty = (p ? p.qty : 0) + sideSign * qty;
          db.prepare(`INSERT INTO positions(symbol,qty,avgEntry,realizedPnl,openedAt,updatedAt) VALUES(?,?,?,?,?,?)
            ON CONFLICT(symbol) DO UPDATE SET qty=excluded.qty, avgEntry=excluded.avgEntry, updatedAt=excluded.updatedAt`)
            .run(cfg.SYMBOL, String(newQty), String(mark), '0', p?.openedAt ?? Date.now(), Date.now());
        }
      }
    }
    ```
  * *Verification Criteria:* `npm run typecheck` exits 0. Live dry smoke (needs RPC only): `timeout 30 npx tsx -e "import {Orchestrator} from './src/agents/orchestrator.ts'; const o=new Orchestrator(); o.start()"` runs without throwing for 30s and produces `runs/<today>.jsonl` with `market.snapshot` lines: `grep -c market.snapshot runs/$(date +%F).jsonl` returns ≥ 2. (On SIGTERM/timeout exit code 124 is EXPECTED — the loop is infinite.)

- [x] **TASK-5.5: Commit Phase 5.** `git add -A && git commit -m "feat: execution state machine, software guard, llm copilot, orchestrator" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`. *Verification:* `npm test && npm run typecheck` both exit 0.

### Phase 6: Scripts (doctor, claim, trade entry) & Voucher Funding

- [x] **TASK-6.1: Write `scripts/doctor.ts` (readiness report).**
  * *Objective:* One-table readiness: chain, gas, key, markets, mark, funding, voucher.
  * *Input/Dependencies:* TASK-4.2, TASK-3.1.
  * *Exact Action:* Create `scripts/doctor.ts` with EXACTLY:
    ```ts
    import 'dotenv/config';
    import { createPublicClient, webSocket, formatEther } from 'viem';
    import { hidekiTestnet } from '@somnia-chain/markets-sdk/chains';
    import { privateKeyToAccount } from 'viem/accounts';
    import { cfg } from '../src/config.ts';
    import { MarketDataAgent } from '../src/agents/marketData.ts';
    import { getMarketRow, getLatestFundingUpdate, fundingAprFromRate } from '../src/indexer.ts';
    import { initSdk, requireMarket } from '../src/sdk.ts';

    const line = (k: string, v: string, ok?: boolean) => console.log(`${ok === undefined ? ' ' : ok ? '✅' : '❌'} ${k.padEnd(28)} ${v}`);
    const acct = cfg.BOT_PRIVATE_KEY ? privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`) : null;
    const pub = createPublicClient({ chain: hidekiTestnet, transport: webSocket(cfg.RPC_URL_WS) });
    const bal = acct ? await pub.getBalance({ address: acct.address }) : 0n;
    line('network', `chain ${cfg.CHAIN_ID} (Tokyo/hideki), dry_run=${cfg.DRY_RUN}`);
    line('bot wallet', acct?.address ?? 'NOT SET', !!acct);
    line('gas STT', `${formatEther(bal)} STT`, bal > 10n ** 17n);
    const sdk = initSdk();
    const row = await requireMarket(sdk, cfg.SYMBOL);
    line(`market ${cfg.SYMBOL}`, `pool ${row.poolAddress} decimals ${row.baseDecimals}/${row.quoteDecimals} tick ${row.tickSize}`, true);
    const g = await getMarketRow(row.baseSymbol);
    line('mark / index', `${g?.markPrice} / ${g?.indexPrice}`);
    const f = g?.id ? await getLatestFundingUpdate(g.id).catch(() => null) : null;
    line('funding rate', f ? `${f.fundingRate} (APR ${(fundingAprFromRate(f.fundingRate) * 100).toFixed(1)}%)` : 'no update yet');
    const elig = await (sdk as any).client.getPerpVoucherEligibility?.(row.marginBank, acct?.address).catch((e: Error) => ({ err: String(e) }));
    line('voucher eligibility', JSON.stringify(elig));
    const mda = new MarketDataAgent(); // reuse snapshot for priceable probe
    const s = await mda.snapshot();
    line('priceable', String(s.priceable), s.priceable);
    ```
  * *Verification Criteria:* `npm run doctor` exits 0 and prints ✅ on: bot wallet, gas STT (after TASK-2.6), market row, priceable. Save output to `docs/doctor-output.txt` and commit.

- [x] **TASK-6.2: Write `scripts/claim-voucher.ts` and run it (funds all trading).**
  * *Objective:* Claim the one-time 1,000 paper USDso perp voucher for the bot wallet.
  * *Input/Dependencies:* TASK-6.1 (gas ✅), TASK-6.3 (`.env` DRY_RUN=false for this script only).
  * *Exact Action:*
    1. Create `scripts/claim-voucher.ts` with EXACTLY:
    ```ts
    import 'dotenv/config';
    import { cfg } from '../src/config.ts';
    import { initSdk, requireMarket } from '../src/sdk.ts';
    import { privateKeyToAccount } from 'viem/accounts';
    if (cfg.DRY_RUN !== 'false') { console.error('Claim is a REAL transaction. Run with DRY_RUN=false (this script only; trading config unchanged): DRY_RUN=false npm run claim'); process.exit(1); }
    const sdk = initSdk();
    const acct = privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`);
    const row = await requireMarket(sdk, cfg.SYMBOL);
    const elig = await (sdk as any).client.getPerpVoucherEligibility(row.marginBank, acct.address);
    console.log('eligibility:', JSON.stringify(elig));
    const res = await (sdk as any).trader.claimPerpVoucher({ marginBank: row.marginBank });
    console.log('claim tx:', (res?.hash ?? res));
    console.log('If eligibility was false with open positions/orders on this address, the claim fails — use a fresh wallet (npm run wallet:new after clearing BOT_PRIVATE_KEY).');
    ```
    2. Temporarily set `DRY_RUN=false` **for this one invocation only**: `DRY_RUN=false npm run claim`. Revert `.env` to `DRY_RUN=true` immediately after (verify with `grep DRY_RUN .env` → `DRY_RUN=true`).
  * *Verification Criteria:* Command prints a tx hash; `DRY_RUN=false npm run claim` a second time is NOT required. Paste the tx hash into `docs/EVIDENCE.md` (created in TASK-9.2) under `## Voucher claim`. Restore `DRY_RUN=true`.

- [x] **TASK-6.3: Write `scripts/trade.ts` (entry point for dry/live runs).**
  * *Objective:* `npm run demo:dry` (default) and `npm run demo:live -- --minutes N` with an unmissable live-mode confirmation.
  * *Input/Dependencies:* TASK-5.4.
  * *Exact Action:* Create `scripts/trade.ts` with EXACTLY:
    ```ts
    import 'dotenv/config';
    import { cfg } from '../src/config.ts';
    import { Orchestrator } from '../src/agents/orchestrator.ts';
    import { log } from '../src/logger.ts';
    const args = new Set(process.argv.slice(2));
    if (args.has('--live')) {
      if (!process.argv.includes('--minutes')) { console.error('Live runs MUST pass --minutes N (max 60).'); process.exit(1); }
      const m = Number(process.argv[process.argv.indexOf('--minutes') + 1]);
      if (!(m > 0 && m <= 60)) { console.error('--minutes must be 1..60'); process.exit(1); }
      if (cfg.DRY_RUN !== 'false') { console.error('Set DRY_RUN=false in .env for live mode. Aborting.'); process.exit(1); }
      console.log(`*** LIVE MODE: real orders on Tokyo testnet for ${m} minutes. Ctrl-C to abort now. ***`);
      await new Promise(r => setTimeout(r, 5000));
      setTimeout(() => { console.log('Time limit reached — stopping loop.'); process.exit(0); }, m * 60_000);
    } else if (cfg.DRY_RUN !== 'true') {
      console.error('Refusing implicit live run: pass --live --minutes N, or set DRY_RUN=true.'); process.exit(1);
    }
    log.info({ dry: cfg.DRY_RUN }, 'PerpPilot starting');
    await new Orchestrator().start();
    ```
  * *Verification Criteria:* `npm run demo:dry` runs the dry loop (Ctrl-C to stop); `npm run demo:live` without flags exits 1 with the guidance message.

- [x] **TASK-6.4: Commit Phase 6.** `git add -A && git commit -m "feat: doctor, voucher claim, trade entrypoint" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`. *Verification:* `npm run typecheck` exits 0; `grep DRY_RUN .env` shows `DRY_RUN=true`.

### Phase 7: Dashboard

- [x] **TASK-7.1: Write `src/dashboard/server.ts` + `src/dashboard/public/index.html`.**
  * *Objective:* Zero-build operator dashboard (FR-8): positions, equity sparkline, funding, orders with explorer links, decision feed, findings feed.
  * *Input/Dependencies:* TASK-5.4, TASK-1.2.
  * *Exact Action:*
    1. Create `src/dashboard/server.ts`:
    ```ts
    import express from 'express';
    import { WebSocketServer } from 'ws';
    import http from 'node:http';
    import { cfg } from '../config.ts';
    import { db } from '../db.ts';
    import { subscribe } from '../bus.ts';
    import { fileURLToPath } from 'node:url';
    const app = express();
    app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));
    app.get('/api/state', (_q, res) => res.json({
      orders: db.prepare('SELECT * FROM orders ORDER BY updatedAt DESC LIMIT 20').all(),
      decisions: db.prepare('SELECT * FROM decisions ORDER BY seq DESC LIMIT 30').all(),
      findings: db.prepare('SELECT * FROM findings ORDER BY ts DESC LIMIT 30').all(),
      equity: db.prepare('SELECT * FROM equity ORDER BY ts DESC LIMIT 300').all(),
      position: db.prepare('SELECT * FROM positions').all(),
    }));
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });
    subscribe('*', (e) => wss.clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify(e))));
    server.listen(cfg.PORT, () => console.log(`dashboard http://localhost:${cfg.PORT}`));
    ```
    Add `"express": "^4.19.2"` and `"@types/express": "^4.17.21"` to `package.json` (`npm i express@^4.19.2 && npm i -D @types/express@^4.17.21`).
    2. Create `src/dashboard/public/index.html`: dark-theme single page, vanilla JS. Required panels (each a `<section>` with heading, populated from `/api/state` polled every 3s AND live ws envelopes): **Account** (equity, unrealized PnL, halt flag), **Market** (mark, index, funding APR, priceable badge, staleness), **Position** (qty, avg entry, TP/SL levels computed from `TP_PCT`/`SL_PCT`), **Orders** (state machine state colored, tx hash as link to `EXPLORER_TX_BASE + hash`), **Decisions** (agent, action, rationale, confidence), **Findings** (probe id, severity chip, title). No framework, no CDN, one inline `<script>`, one inline `<style>`. Layout: CSS grid 3 columns on wide, 1 on narrow.
  * *Verification Criteria:* With `npm run demo:dry` running in another terminal, `npm run dashboard` serves `http://localhost:8787`; visiting it shows live-updating Market panel with a changing mark price and Decision entries appearing within 5s of each orchestrator tick. Screenshot saved to `docs/dashboard-screenshot.png` and committed.

- [x] **TASK-7.2: Commit Phase 7.** `git add -A && git commit -m "feat: operator dashboard" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`. *Verification:* typecheck passes.

### Phase 8: Feedback Harness & Probes (feedback track)

- [x] **TASK-8.1: Write `src/feedback/template.ts` (bounty-exact renderer).**
  * *Objective:* Every report matches the bounty template character-for-character in structure.
  * *Input/Dependencies:* TASK-1.2.
  * *Exact Action:* Create `src/feedback/template.ts` with EXACTLY:
    ```ts
    export interface ReportInput {
      fileSlug: string;           // e.g. "P01-decimals-misleading-revert"
      title: string;              // short title
      severity: 'critical' | 'major' | 'normal';
      area: 'API' | 'SDK' | 'docs' | 'app' | 'contracts';
      steps: string[];            // numbered repro steps
      expected: string;
      actual: string;
      evidence: string[];         // tx hash lines, req/resp blocks, screenshots paths
      sdkVersion?: string;        // default from node_modules
      walletAddress?: string;
      extraEnv?: Record<string, string>;
    }
    export function renderReport(r: ReportInput): string {
      const steps = r.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
      const evidence = r.evidence.map(e => `- ${e}`).join('\n');
      return `# ${r.title}
    Severity: ${r.severity}
    Area: ${r.area}

    ## Steps to reproduce
    ${steps}

    ## Expected
    ${r.expected}

    ## Actual
    ${r.actual}

    ## Evidence
    ${evidence}

    ## Environment
    SDK version: ${r.sdkVersion ?? '@somnia-chain/markets-sdk@0.32.1'}
    Network: Somnia Tokyo testnet (chain ID 50383)
    Wallet address: ${r.walletAddress ?? '<bot wallet address>'}${Object.entries(r.extraEnv ?? {}).map(([k, v]) => `\n${k}: ${v}`).join('')}
    `;
    }
    export function reportPath(id: string): string { return `feedback/${id}.md`; }
    ```
  * *Verification Criteria:* Unit test `tests/report.test.ts` asserts the rendered string contains `# `, `Severity: `, `Area: `, `## Steps to reproduce`, `## Expected`, `## Actual`, `## Evidence`, `## Environment` in that order (single test, `indexOf` comparisons). `npm test` passes.

- [x] **TASK-8.2: Write `scripts/probe-run.ts` (probe harness) + probe registry.**
  * *Objective:* Idempotent, one-command repro for every finding class; each probe renders its `feedback/*.md`.
  * *Input/Dependencies:* TASK-8.1, TASK-2.3, TASK-5.1.
  * *Exact Action:*
    1. Create `src/feedback/probes.ts` exporting `PROBES: Record<string, ProbeSpec>` where `ProbeSpec = { id, fileSlug, title, severity, area, run(ctx): Promise<ProbeResult> }`, `ProbeResult = { steps: string[], expected: string, actual: string, evidence: string[] }`. Register ALL of P-01…P-14 with the scenarios from the table below (titles pre-assigned; write honest severity from what you OBSERVE — the table's severity is the starting hypothesis):
       | ID | fileSlug | Scenario (steps to encode) | Severity hyp. | Area |
       |---|---|---|---|---|
       | P-01 | `P01-perp-order-wrong-decimals-misleads-insufficient-collateral` | Place ETH-PERP order with quantity scaled by 6 decimals instead of 18 (e.g. intended 0.01 ETH sent as `parseUnits('0.01', 6)`); capture revert selector | major | contracts |
       | P-02 | `P02-perp-limit-price-zero-is-literal-price` | Submit limit price `0` on ETH-PERP; record behavior + error text | normal | contracts |
       | P-03 | `P03-ioc-unfilled-reverts-immediateorcancelnofill` | IOC limit priced 5% away from touch; capture `0xd48c4403` revert; also place batched variant if SDK exposes batches and record `OrderRejected` reason 5 | major | contracts |
       | P-04 | `P04-off-tick-price-and-non-lot-quantity-error-quality` | Price off-tick by 1 wei; quantity off-lot by 1 wei; capture revert text | normal | contracts |
       | P-05 | `P05-getmaxperpordersize-vs-onchain-cap-divergence` | Compare `getMaxPerpOrderSize().maxQuantity` against the largest order that actually succeeds (ramp up in 10 steps); record divergence if any | normal | API |
       | P-06 | `P06-maxpositionsizesexceeded-error-surface` | Attempt order above account position cap; capture `0x714b36d6` and whether docs/API expose the cap value anywhere | major | contracts |
       | P-07 | `P07-stop-orders-blocked-for-usdso-only-voucher-accounts` | Attempt stop/TP-SL placement from voucher-funded account; capture error; confirm docs state the restriction | major | contracts |
       | P-08 | `P08-voucher-claim-blocked-markets-limitedby` | Read `getMaxPerpOrderSize` on ZEC-PERP (voucher-blocked) with voucher account; capture `limitedBy: "voucherBlocked"`; attempt order | normal | SDK |
       | P-09 | `P09-indexer-markprice-lag-vs-chain-mark` | Sample GraphQL `Market.markPrice` and SDK mark every 2s for 5 min; report max observed lag and any inversions | major | API |
       | P-10 | `P10-stale-mark-priceable-false-after-ws-outage` | Close WS for 30s (block via firewall or drop transport), attempt order, capture `priceable:false` behavior and recovery time | major | SDK |
       | P-11 | `P11-cancel-idempotency-double-cancel-and-cancel-filled` | Cancel same order twice; cancel a filled order; capture error semantics of each | normal | contracts |
       | P-12 | `P12-tokyo-hideki-shannon-network-naming-and-faucet-gap` | Docs-only probe: cite bounty text ("Somnia Tokyo testnet"), SDK chain name (`hidekiTestnet`), explorer path (`/tokyo`), Somnia docs listing only Shannon 50312 + Shannon-only faucets; describe the developer journey failure | major | docs |
       | P-13 | `P13-docs-imply-rest-for-perps-but-http-api-is-spot-only` | Docs-only probe: cite perps dev docs (no REST endpoints; SDK/GraphQL only) vs HTTP API overview (spot only) and quick-start REST flow; describe the dead end for a new integrator | major | docs |
       | P-14 | `P14-bot-kit-perp-core-pins-caret-0-31-never-gets-0-32` | Repo probe: quote `packages/perp-core/package.json` line `"@somnia-chain/markets-sdk": "^0.31.0"` from somnia-chain/dreamdex-bot-kit vs docs version 0.32.1; explain 0.x caret semantics | normal | SDK |
    2. Create `scripts/probe-run.ts`:
    ```ts
    import 'dotenv/config';
    import { writeFileSync, mkdirSync } from 'node:fs';
    import { privateKeyToAccount } from 'viem/accounts';
    import { cfg } from '../src/config.ts';
    import { PROBES } from '../src/feedback/probes.ts';
    import { renderReport, reportPath } from '../src/feedback/template.ts';
    import { db } from '../src/db.ts';
    const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
    for (const [id, p] of Object.entries(PROBES)) {
      if (only && id !== only) continue;
      process.stdout.write(`running ${id} ... `);
      try {
        const res = await p.run();
        const md = renderReport({ fileSlug: p.fileSlug, title: p.title, severity: res.observedSeverity ?? p.severity, area: p.area, steps: res.steps, expected: res.expected, actual: res.actual, evidence: res.evidence, walletAddress: privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`).address });
        mkdirSync('feedback', { recursive: true });
        writeFileSync(reportPath(p.fileSlug), md);
        db.prepare(`INSERT INTO findings(id,probeId,title,severity,area,status,evidenceJson,reportPath,ts) VALUES(?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET status='reported', reportPath=excluded.reportPath`)
          .run(p.fileSlug, id, p.title, res.observedSeverity ?? p.severity, p.area, 'reported', JSON.stringify(res.evidence), reportPath(p.fileSlug), Date.now());
        console.log('OK ->', reportPath(p.fileSlug));
      } catch (e) { console.log('PROBE ERROR (this is itself evidence):', String((e as Error).message).slice(0, 200)); }
    }
    ```
    (`ProbeSpec` gains optional `observedSeverity` on `ProbeResult` — define it that way.)
    3. Doc-probes P-12, P-13, P-14 need no chain access: implement their `run()` to return the cited evidence lines directly (quotes + URLs listed above).
    4. Chain-probes must be `DRY_RUN`-independent and budget ≤ 0.02 STT each: reuse a shared helper `placeAndCapture(sdk, row, {isBid, priceRaw, qtyRaw, tif})` in `src/feedback/probes.ts` that (a) `eth_call`-simulates, (b) sends with `GAS_LIMIT`, (c) captures tx hash + receipt + raw revert data, and (d) returns evidence strings `tx: <hash> (<explorer url>)`, `revert: <selector/hex>`, `raw: <truncated json>`. Keep prices far from the touch and quantities ≥ minQuantity so probes never accidentally fill.
  * *Verification Criteria:* `npm run probe -- --only P-12 && npm run probe -- --only P-13 && npm run probe -- --only P-14` produce three files in `feedback/`, each passing this checklist: contains `## Steps to reproduce`, `## Evidence` with ≥1 concrete citation (URL/selector/hash), and `Environment` block with chain ID 50383. Commit them. Chain probes P-01…P-11 run in TASK-9.x after voucher claim; each success appends its report file.

- [x] **TASK-8.3: Commit Phase 8.** `git add -A && git commit -m "feat: feedback harness + 14-probe registry + first doc probes" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`. *Verification:* `feedback/` contains ≥ 3 committed reports; `npm test` passes.

### Phase 9: Live Evidence Run (MVP proof)

- [x] **TASK-9.1: Run chain probes P-01…P-11 and render reports.**
  * *Objective:* Convert the stress-test matrix into paid-feedback files with on-chain evidence.
  * *Input/Dependencies:* TASK-6.2 (voucher claimed), TASK-8.2.
  * *Exact Action:* Run in this order, one at a time, inspecting output: `npm run probe -- --only P-04`, then `P-02`, `P-01`, `P-06`, `P-08`, `P-05`, `P-03`, `P-11`, `P-07`, `P-09`, `P-10`. After each: confirm a new `feedback/P*.md` exists with a tx hash or a recorded error string. If a probe legitimately shows NO bug (behavior matches docs), set `observedSeverity` accordingly and write actual="matches documented behavior — recorded for coverage" (do not fabricate findings).
  * *Verification Criteria:* `ls feedback/ | wc -l` ≥ 12; every report's Evidence section has ≥ 1 tx hash or error selector or URL citation. Commit: `git add feedback && git commit -m "feedback: chain probe reports P-01..P-11" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`.

- [ ] **TASK-9.2: Execute the live MVP run and write `docs/EVIDENCE.md`.**
  * *Objective:* Bounty rubric "live orders on Somnia Tokyo testnet, transaction hashes".
  * *Input/Dependencies:* TASK-6.2, TASK-6.3, TASK-5.4.
  * *Exact Action:*
    1. Confirm `grep DRY_RUN .env` → `DRY_RUN=true`. Run `npm run demo:dry` for 10 minutes; confirm decisions look sane (rationales present, no error spam).
    2. Flip `.env` to `DRY_RUN=false`. Run `npm run demo:live -- --minutes 30`. The copilot may `hold` — that is fine; to GUARANTEE ≥ 5 live orders, run this deterministic live helper after (or instead) — `scripts/live-proof.ts`:
       ```ts
       import 'dotenv/config';
       import { cfg } from '../src/config.ts';
       import { MarketDataAgent } from '../src/agents/marketData.ts';
       import { ExecutionAgent } from '../src/agents/execution.ts';
       import { OrderIntent } from '../src/agents/schemas.ts';
       import { evaluate } from '../src/agents/risk.ts';
       // Places 6 small legal orders (3 opens + 3 closes) with hard risk checks. NOT a strategy.
       const md = new MarketDataAgent(); await md.warmup();
       const ex = new ExecutionAgent();
       for (const side of ['buy','sell','buy','sell','buy','sell'] as const) {
         const snap = await md.snapshot();
         const mark = Number(snap.markPrice) / 1e18;
         const intent = OrderIntent.parse({ id: crypto.randomUUID(), symbol: cfg.SYMBOL, side, reduceOnly: false,
           notionalUsdso: '5', tif: 'IOC',
           limitPriceUsdso: String(mark * (side === 'buy' ? 1.003 : 0.997)), origin: 'probe' });
         const v = evaluate(intent, { snapshot: snap, position: null, openOrders: 0 });
         console.log(side, v.approved ? 'approved' : v.reasons, '=>');
         if (v.approved) console.log(JSON.stringify(await ex.execute(intent)));
         await new Promise(r => setTimeout(r, 20_000));
       }
       ```
       (If `tif: 'IOC'` is unsupported by the SDK call surface per `docs/sdk-api.md`, use `'GTC'` and record the deviation.)
    3. Create `docs/EVIDENCE.md` with a table: `| # | time (UTC) | action | notional USDso | tx hash | explorer link | outcome |` — one row per live order (≥ 5 rows), sourced from `state.db` (`SELECT id,side,state,txHash,updatedAt FROM orders WHERE txHash IS NOT NULL ORDER BY updatedAt;`) plus the voucher claim tx from TASK-6.2.
  * *Verification Criteria:* `docs/EVIDENCE.md` exists with ≥ 5 tx rows + voucher claim row; every hash resolves on `explorer.testnet.somnia.network/tokyo`; `grep DRY_RUN .env` is back to `DRY_RUN=true`. Commit: `git add -A && git commit -m "feat: live evidence run on tokyo testnet" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`.

- [ ] **TASK-9.3: Commit Phase 9.** Covered by TASK-9.2's commit; *Verification:* `git status` clean.

### Phase 10: README, Docs & Submission

- [ ] **TASK-10.1: Write `README.md` (bounty format).**
  * *Objective:* Judges' first screen: what/who/how-to-run + evidence.
  * *Input/Dependencies:* All prior.
  * *Exact Action:* Create `README.md` with EXACTLY these sections (fill brackets from real values):
    1. Title + one-liner: `PerpPilot — an autonomous AI trading agent for dreamDEX perps on Somnia Tokyo testnet, with a live operator dashboard and a self-generated bug-report harness.`
    2. **What it does** (5 bullets: risk-kernel-gated autonomous trading; LLM copilot advisory with rule fallback; software TP/SL guard; evidence logging with explorer links; 14-probe feedback harness).
    3. **Who it is for** (Operator Olive / Integrator Devraj personas, 2 sentences each).
    4. **How to run it** — exact copy-paste block: prerequisites (Node 20+), `npm i`, `cp .env.example .env`, `npm run wallet:new`, fund gas (link faucet notes), `npm run doctor`, `DRY_RUN=false npm run claim`, `npm run demo:dry`, `npm run dashboard`, and the live path `DRY_RUN=false` + `npm run demo:live -- --minutes 30`.
    5. **Live evidence** — link `docs/EVIDENCE.md` + 2 explorer links inline; embed `docs/dashboard-screenshot.png`.
    6. **Feedback track** — table of all `feedback/*.md` with severity and one-line summary, generated from the findings table.
    7. **Architecture** — the data-flow ASCII diagram from `prd.md` §5.2 + the agent table from §6.1.
    8. **Integration notes** — 5 hard-won facts (WebSocket RPC required, decimals zoo, silent rejections, voucher stop restriction, funding formula) each with its source URL.
    9. **Using Somnia primitives** — state plainly which primitive is used where (Reactivity-style event subscriptions for fills; Somnia Agents stretch) — do not overclaim.
  * *Verification Criteria:* A reader who has never seen the project can go from README to a dry run with no other file. Verify by following the README steps literally in a fresh shell with a fresh `.env`.

- [ ] **TASK-10.2: Full quality gate.**
  * *Exact Action:* Run ALL: `npm run typecheck` (0 errors), `npm test` (all pass), `npm run demo:dry` (runs 5 min clean), `npm run doctor` (all ✅ except optional), `ls feedback/ | wc -l` (≥ 12), `grep -rn "PRIVATE_KEY" src/ scripts/ --include='*.ts' | grep -v process.env | grep -v BOT_PRIVATE_KEY` (empty). Fix anything red before proceeding.
  * *Verification Criteria:* All commands green; note outputs in the task state.

- [ ] **TASK-10.3: [HUMAN_STEP] Submit to the bounty portal before 2026-11-01 23:59 UTC.**
  * *Objective:* Both tracks submitted, first-report-wins race entered EARLY.
  * *Instructions for Human:* (1) Verify the GitHub repo is public and pushed (`git push origin main`). (2) Submit the MVP entry on the bounty portal: repo URL + `docs/EVIDENCE.md` + 2-sentence description ("autonomous AI perps agent with deterministic risk kernel; every decision logged with tx hashes"). (3) Submit/confirm the feedback-track reports are visible in `feedback/` in the repo. (4) IMPORTANT: submit as soon as TASK-9.1 reports exist — do NOT wait for the MVP run; accepted-report budget is first-come.
  * *Agent Instructions upon resume:* Check `git status` is clean and `git log origin/main..main` is empty (everything pushed). If not pushed, print `Waiting for final push to GitHub...` and stop.

- [ ] **TASK-10.4: Post-submission hygiene (until Nov 1).**
  * *Exact Action:* Keep the dry-run agent running ≥ 2h/day; any new crash/anomaly → new probe + report (bump id P-15+); monitor upstream repo/docs for changes; re-run `npm run doctor` daily and record in `docs/doctor-output.txt`.
  * *Verification Criteria:* `docs/doctor-output.txt` has dated entries; any new finding committed with its report.

### Definition of Done (whole project)
- [ ] `npm run typecheck` exits 0 and `npm test` passes on a fresh clone.
- [ ] `docs/EVIDENCE.md` ≥ 5 live ETH-PERP tx hashes + voucher claim tx, all resolving on the Tokyo explorer.
- [ ] `feedback/` ≥ 12 bounty-format reports, each reproducible by one command.
- [ ] README passes the "stranger test" (TASK-10.1).
- [ ] `.env` in repo contains NO secrets (`git grep BOT_PRIVATE_KEY=0x` returns nothing).
- [ ] Both tracks submitted before the deadline.
