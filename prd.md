# PRD — PerpPilot: Autonomous AI Trading Agent & Evidence Harness for dreamDEX Perps

- **Repo:** `dreamdex-perps-pilot`
- **Bounty:** dreamDEX Perps Builder Bounty (Somnia Tokyo testnet, Oct 19 – Nov 1, 2026)
- **Tracks entered:** MVP (bots & agents category) + Feedback (systematic API/SDK stress test)
- **Network facts (verified 2026-10-20):** Somnia Tokyo testnet, chain ID `50383`, RPC `https://api.hideki2.infra.testnet.somnia.network` (WebSocket required — the SDK fails a genesis check on HTTP-only RPC), explorer `https://explorer.testnet.somnia.network/tokyo`, indexer GraphQL `https://hideki-dev.smk.somnia.host/v1/graphql`, SDK `@somnia-chain/markets-sdk@0.32.1`, collateral USDso (18 decimals), gas STT.

---

## 1. Executive Summary

**The hook (2 sentences):** PerpPilot is an autonomous AI trading agent that trades real dreamDEX perps on Somnia Tokyo testnet with a deterministic risk kernel, a live operations dashboard, and an evidence log of every on-chain action — while the same codebase systematically stress-tests the dreamDEX API/SDK surface and emits bounty-format bug reports. One 48-hour build simultaneously competes for the $500 MVP prize and the $1,500 feedback pool.

**Core value proposition:** Today there is no tool that gives an operator a *safe, observable, evidence-producing* autonomous perps loop on dreamDEX — claim funds → size a position → trade → guard → report. PerpPilot ships exactly that loop, with an LLM copilot that only *advises* inside hard-coded risk limits (deterministic code always has veto power), which is the credibility bar judges and real users require for autonomous trading.

**The ecosystem gap:** dreamDEX perps launched recently on Tokyo testnet and its developer surface is powerful but raw: no REST API for perps (direct SDK/contract only), six different base-asset decimal regimes (6/7/8/9/18/24), silent on-chain rejections and misleading revert reasons, stop orders that paper-USDso accounts cannot arm, funding data buried in an undocumented GraphQL indexer, and official docs that call the same network "Tokyo" (bounty), "hidekiTestnet" (SDK), and omit it entirely from Somnia's own network docs. Existing tools cover fragments of this; none close the loop.

---

## 2. Ecosystem Research & Unfair Advantage

### 2.1 Existing solutions analyzed

| # | Solution | What it does | What is missing / broken (our gap) |
|---|---|---|---|
| 1 | **dreamdex-bot-kit** `perp-*` strategies (official, `somnia-chain/dreamdex-bot-kit`) | 4 reference strategies: `perp-starter` (open + TP/SL), `perp-maker` (flat-skew quotes), `perp-funding` (hold the paid side), `perp-guard` (margin-health trimmer). Thin `perp-core` wrapper over the markets SDK. | Reference-grade only: no AI/LLM layer, no operator dashboard, no position/account state persistence, no feedback or evidence tooling, no software-stop guard for paper-USDso accounts (starter's real stops need non-voucher accounts), and `packages/perp-core/package.json` pins `@somnia-chain/markets-sdk ^0.31.0` while live docs specify `0.32.1` — a caret pin on a 0.x line that never receives 0.32.x. |
| 2 | **Hummingbot / Freqtrade / Jesse / OctoBot** | Mature open-source perps bot frameworks with market-making, connectors, backtesting. | Zero dreamDEX or Somnia connector; CEX/AMM-centric architecture; perps access in dreamDEX is SDK+contract only (no REST), so porting a connector is a multi-week effort, not a hackathon task. |
| 3 | **somnia-dex-cli (+ MCP server, LLM SKILL.md)** | Official Go CLI and agent skill for dreamDEX: markets, orders, login, watch. | Spot only. No perps commands, no perps market data, no session-key perps flow — the primary "LLM agents trade dreamDEX" entry point cannot see perps at all. |
| 4 | **Somnia-DreamDEX-Agent (prior DoraHacks hackathon build)** | AI agent trading dreamDEX from the earlier Somnia × DreamDEX collaboration. | Predates the perps testnet launch; spot-era integration. No perps AI agent exists publicly today — the "AI agent trading dreamDEX perps" category is empty. |

### 2.2 Gap synthesis

The developer surface has four structural holes, all verified against live docs on 2026-10-20:

1. **No perps REST API.** The documented HTTP API (`api.dreamdex.io/v0`) is spot-only; perps are SDK + raw contracts + an undocumented GraphQL indexer. Every "normal" trading-tool pattern (poll REST, sign prepared tx) does not apply.
2. **Hostile error surface.** Wrong decimals fail as `InsufficientCollateral()` (`0x3a23d825`); unfilled IOC reverts `ImmediateOrCancelNoFill()`; batch rejections surface only as `OrderRejected` reason codes; mined transactions can succeed while the order was silently rejected. Nothing maps raw outcomes to developer-meaningful diagnostics.
3. **Risk-tooling vacuum for the paper-USDso path every hacker starts on.** Voucher accounts cannot arm stop orders (0.15 STT-backed stops are blocked for USDso-only accounts), leverage is locked while the voucher is held, and six markets are voucher-blocked. Bots on vouchers must implement their own software stops; none ship one.
4. **Documentation fragmentation.** The same network is "Somnia Tokyo testnet" (bounty), `hidekiTestnet` / `hideki2` (SDK + RPC host), explorer path `/tokyo`, chain `50383` — while Somnia's official network docs only document Shannon `50312` and its faucets. A developer following official docs cannot find the perps chain at all.

### 2.3 Unfair competitive advantage (48-hour leverage)

1. **Dual-track compounding.** Every probe written for the feedback track hardens the MVP's error handling, and every MVP incident auto-generates a paid-feedback report. Competitors build one track; we get paid twice from one codebase. The harness *is* the architecture, not an add-on.
2. **Risk-kernel-first autonomy.** The LLM never holds signing keys' authority: a deterministic `RiskAgent` vetoes anything outside hard caps (max notional, max effective leverage, daily loss cap, stale-mark, one-market). This is the design reviewers trust for "worth using."
3. **Evidence-native.** Every decision, order, and fill is persisted with tx hash + explorer link + request/response capture. The bounty's "Evidence of building: live orders, transaction hashes, repo and demo" rubric is satisfied as a side effect of normal operation.
4. **Somnia primitives (bounty plus).** Off-chain Somnia Reactivity-style event subscriptions drive fill/guard reactions (no polling where a stream exists); a documented integration point invokes the decision step through Somnia Agents as a stretch goal.
5. **First-mover in an empty category.** No public AI agent trades dreamDEX perps; being first, with working tx hashes on Tokyo, is the moat a 48-hour window can actually build.

---

## 3. User Personas & User Journeys

### Persona A — "Operator Olive" (crypto-native trader, primary user)
Wants an agent that trades perps 24/7 inside limits she sets, and shows her what it is doing and why in real time.

**Journey (happy path):**
1. Clones `dreamdex-perps-pilot`, copies `.env.example` → `.env`, generates a dedicated bot key with one command (`npm run wallet:new` — key never leaves the machine).
2. Funds the bot address with testnet STT gas (faucet — one human step), runs `npm run doctor` — sees markets, marks, funding rates, gas balance, key readiness in one table.
3. Runs `npm run claim` — bot claims its 1,000 paper USDso voucher on-chain (tx hash printed).
4. Runs `npm run trade` — DRY_RUN first: dashboard at `localhost:8787` shows live marks, signals, and the exact orders the agent *would* send; every decision has an LLM/rule rationale line.
5. Flips `DRY_RUN=false`: agent places a real ETH-PERP order on Tokyo testnet; dashboard shows position, entry, unrealized PnL, funding accrued, software TP/SL levels; order log shows tx hashes linking to `explorer.testnet.somnia.network/tokyo`.
6. Overnight: guard closes at TP/SL or daily loss cap; morning: `npm run report:pack` prints the run summary — trades, PnL, evidence tx list.
7. Viral/repeat loop: she re-runs daily; each session appends to the equity curve and the findings log.

### Persona B — "Integrator Devraj" (developer integrating dreamDEX, feedback-track beneficiary)
Wants to build on the perps SDK without falling into the decimals/rejection/docs traps.

**Journey:**
1. Hits a confusing failure (e.g., `InsufficientCollateral` from a decimal bug) while following official docs.
2. Finds our repo via the bounty gallery; reads `feedback/` — 10+ reproducible, evidence-backed reports in exactly the bounty's format, each with steps, expected/actual, tx hash or request/response, SDK version and chain ID.
3. Copies our probe script for that failure class into his own CI (`npm run probe -- --only P-01`), gets a red/green signal instead of a mystery revert.
4. Our README's "Verified integration notes" section becomes his shortcut; he stars the repo.

### Persona C — "Judge Jordan" (bounty evaluator)
Wants: clear user value, credible scope, repeat-use loop, live on-chain evidence.

**Journey:**
1. Opens repo → README states what/who/how-to-run in the first screen.
2. Clicks `docs/EVIDENCE.md` → table of real ETH-PERP orders on Tokyo with tx hashes (opens in explorer), PnL summary.
3. Runs `npm run demo` (scripted 5-minute dry-run against live marks) — sees the agent think, decide, and (in live mode) execute.
4. Reads `feedback/` — sees systematic coverage of API/SDK/docs/app areas with repro steps and evidence.

---

## 4. Core Functional Requirements (non-negotiable)

- **FR-1 Config & safety gates.** All behavior driven by validated `.env` config (zod-parsed). `DRY_RUN=true` is the default and blocks all signing/_broadcast; a live run requires explicit `DRY_RUN=false`. The bot key is a dedicated burner EOA, never the user's main wallet key.
- **FR-2 Market state read path.** Read perps markets, mark/index prices, order book, funding rate, and account state via `@somnia-chain/markets-sdk@0.32.1` (WebSocket RPC, chain `50383`) plus the GraphQL indexer (`FundingRateUpdate`, `FundingPayment`, `Fill` entities). Every read records a staleness timestamp; stale inputs veto writes.
- **FR-3 Funding flow.** `npm run wallet:new` (burner key), `npm run claim` (voucher eligibility check → `claimPerpVoucher` → verify margin balance), `npm run doctor` (one-table readiness report: gas, key, markets, marks, funding, voucher status).
- **FR-4 Order lifecycle state machine.** Every order walks `INTENT → PREFLIGHT (eth_call simulation + getMaxPerpOrderSize priceable check) → SIGNED → SUBMITTED → MINED → CONFIRMED/REJECTED(reason)` with the tick/lot/min-quantity/decimal alignment applied from live market parameters (never hard-coded). Receipt with `success=false` or empty/absent fill events is classified REJECTED with the decoded reason (`listPerpOrderRejections`).
- **FR-5 Deterministic risk kernel (hard vetoes).** Max notional per position 50 USDso; max effective leverage 5x ( vouchers lock leverage — code enforces ≤ what margin allows); daily realized loss cap 10 USDso (breach → close all + halt); max 3 open orders; single market (`ETH-PERP`); mark-age veto > 10s; price-band veto (no orders when mark moved > 50 bps since signal).
- **FR-6 Software TP/SL guard.** Because voucher (USDso-only) accounts cannot arm on-chain stops, a guard loop polls mark every 2s and submits reduce-only close orders when TP (+2%) or SL (−1.5%) triggers, or on daily-loss breach. Guard runs even when the strategy/LLM layer is stopped.
- **FR-7 Strategy layer with LLM copilot.** Two rule signals (funding-carry: hold the paid side while `fundingApr > threshold`; EMA momentum: 9/21 EMA cross on 1m candles) produce candidate intents. An LLM copilot (Anthropic API) reviews the snapshot + signals + open risk and returns a zod-validated JSON decision with a reason string; its output can only *select among* risk-kernel-legal actions — it cannot raise limits. No API key ⇒ pure rule mode (product must work without the LLM).
- **FR-8 Operations dashboard.** Local web dashboard (`localhost:8787`, Express + WebSocket push, zero build step): positions, equity sparkline, live funding, order log with tx links, agent decision log, risk status, findings feed. Read-only; no auth required on localhost; never exposes the private key.
- **FR-9 Evidence & feedback capture.** Every RPC error, revert, silent rejection, staleness event, and doc discrepancy is captured to SQLite with full context; `npm run report -- <id>` renders `feedback/<id>-<slug>.md` in the exact bounty template (title, Severity, Area, Steps to reproduce, Expected, Actual, Evidence, Environment). Probe suite (P-01…P-14) reproduces each known issue class deterministically and idempotently.
- **FR-10 Live on-chain proof.** At least 5 real ETH-PERP orders (open/close, long/short) on Tokyo testnet with captured tx hashes in `docs/EVIDENCE.md`, produced by `npm run demo:live` under `DRY_RUN=false`.
- **FR-11 README per bounty spec.** What it does, who it is for, how to run it (exact commands), architecture diagram, evidence links, and the feedback-track index.
- **FR-12 Replayable run logs.** All agent envelopes append to `runs/<date>.jsonl`; `npm run replay -- runs/<file>.jsonl` re-simulates decisions without keys (no signing material in logs, ever).

---

## 5. Technical Architecture

### 5.1 Layout (single Node 20 + TypeScript ESM repo, no monorepo tooling)

```
dreamdex-perps-pilot/
├─ package.json / tsconfig.json / .env.example / .gitignore
├─ src/
│  ├─ config.ts          # zod env parsing, derived constants
│  ├─ logger.ts          # pino, redacts keys
│  ├─ db.ts              # better-sqlite3 schema + accessors
│  ├─ bus.ts             # typed in-process event bus (envelopes)
│  ├─ sdk.ts             # SomniaMarkets init (ws RPC, hidekiTestnet), .d.ts-extracted surface
│  ├─ indexer.ts         # GraphQL client (markets, funding, fills, pnl)
│  ├─ agents/
│  │  ├─ orchestrator.ts # 2s tick loop, agent scheduling, halt logic
│  │  ├─ marketData.ts   # MarketSnapshot builder (SDK + indexer + staleness)
│  │  ├─ signals.ts      # funding-carry + EMA momentum rule engines
│  │  ├─ copilot.ts      # LLM advisory decision (zod-gated) / rule fallback
│  │  ├─ risk.ts         # deterministic kernel: approve/veto OrderIntent
│  │  ├─ execution.ts    # order state machine (preflight→submit→confirm)
│  │  ├─ guard.ts        # software TP/SL + loss-cap enforcement
│  │  └─ reporter.ts     # anomaly capture → findings table → feedback/*.md
│  ├─ feedback/
│  │  ├─ template.ts     # bounty-format markdown renderer
│  │  └─ probes.ts       # probe registry (P-01…P-14)
│  └─ dashboard/
│     ├─ server.ts       # express + ws broadcaster
│     └─ public/index.html
├─ scripts/              # wallet:new, doctor, claim, trade, demo:live, probe-*, report, replay
├─ tests/                # vitest: sizing math, risk kernel, state machine, renderer
├─ feedback/             # generated bounty-format reports (committed)
├─ docs/                 # EVIDENCE.md, sdk-api.md (extracted), integration-notes.md
└─ runs/                 # jsonl decision logs
```

### 5.2 Data flow

```
             ┌──────────────────────── 2s tick (orchestrator) ─────────────────────────┐
             │                                                                          │
  WS RPC ───►│ MarketDataAgent ──MarketSnapshot──► SignalsAgent ──Signal[]──┐           │
  GraphQL ──►│        │                                                     ▼           │
             │        │                                        CopilotAgent (LLM advisory)│
             │        │                                                     │           │
             │        ▼                                                     ▼           │
             │   GuardAgent ◄──positions── RiskAgent ◄──OrderIntent─────────┘           │
             │   (TP/SL,        (vetoes)      │approved                                 │
             │   loss cap)                    ▼                                         │
             │                          ExecutionAgent ──tx──► Somnia Tokyo (50383)     │
             │                                │        │                               │
             │                                ▼        └─►tx hash → explorer link       │
             │                          ReporterAgent ──► findings db ──► feedback/*.md │
             └──────────────────────────────────────────────────────────────────────────┘
                                  all envelopes ──► runs/*.jsonl + dashboard ws push
```

### 5.3 Backend / API surfaces consumed

- **On-chain (via SDK over WebSocket RPC, chain 50383):** `SomniaMarkets` read client (`listPerpMarkets`, `getMaxPerpOrderSize`, `getPerpVoucherEligibility`, `getPerpSystemConfig`, `listPerpOrderRejections`) and trader (`placePerpOrder`, `claimPerpVoucher`). Exact constructor/method signatures are extracted from the installed package's `.d.ts` at build time and recorded in `docs/sdk-api.md` (anti-drift step; see backlog TASK-2.4).
- **GraphQL indexer:** `POST https://hideki-dev.smk.somnia.host/v1/graphql` — `Market {markPrice indexPrice fundingRate fundingIntervalSec fundingWindowSec tickSize lotSize minQuantity baseDecimals quoteDecimals marginBank poolAddress …}`, `fundingRateUpdates(...)`, `fundingPayments(...)`, `fills(...)`, `accountMarketPnl(...)`. Verified live via introspection on 2026-10-20.
- **Contract constants (fallback):** MarginBank `0x478769E1177C0773c43A593DCCc4Ad15F15F1394`, USDso `0xed7993A74dAe1e6656B704A424DcD8711aAf4F72`, PerpPoolFactory `0xE631fAEE547baeE07353E290f0562ea67d856560`, LiquidationEngine `0xA66d3C24Ad4a389d863846905D8173e1017e9F4D`, InsuranceFund `0x50826894D47C6D4f3BeA38BFDC7Dc5c5be171b80`. Always prefer per-market row fields over constants.
- **No REST API** is used (perps have none) — this is itself a documented feedback finding.
- **External LLM API (optional):** Anthropic Messages API via `@anthropic-ai/sdk`; key optional, product fully functional in rule mode without it.

### 5.4 Database (SQLite via better-sqlite3, file `state.db`)

```
kv(key TEXT PK, value TEXT)                         -- runtime state (halt flags, daily anchor)
marketsCache(symbol TEXT PK, json TEXT, ts INTEGER) -- last snapshot per market
orders(id TEXT PK, symbol, side, qtyRaw, priceRaw, tif, state, intentJson,
       txHash, orderId, rejectReason, createdAt, updatedAt)
fills(id TEXT PK, orderRef, qty, price, fee, txHash, ts)
positions(symbol TEXT PK, qty, avgEntry, realizedPnl, openedAt, updatedAt)
decisions(seq INTEGER PK, ts, agent, kind, payloadJson, rationale)
findings(id TEXT PK, probeId, title, severity, area, status, evidenceJson, reportPath, ts)
equity(ts REAL PK, equityUsdso, unrealizedPnl)
```

### 5.5 Frontend

Single static `index.html` (vanilla JS + minimal CSS, no framework, no build step) served by Express; receives `snapshot` and `decision` frames over WebSocket. Panels: Account (equity, margin health), Market (mark/index/funding + staleness badge), Position (qty/entry/uPnL + TP/SL lines), Orders (state machine states + explorer links), Decisions (agent rationale feed), Findings (bug feed). Dark theme.

### 5.6 Key protocol facts encoded in the design (all verified 2026-10-20)

| Fact | Design consequence |
|---|---|
| Base-asset decimals vary per market: BTC/DOGE/ZEC=8, ETH/AVAX/BNB/LINK=18, SOL/SUI/TAO=9, ADA/HYPE/PUMP/XRP=6, XLM=7, NEAR=24; USDso quote always 18 | All sizing via `parseUnits(value, market.baseDecimals)` read live from the market row; never hard-code |
| Unfilled IOC reverts `ImmediateOrCancelNoFill()`; batches report `OrderRejected` reason 5 instead | IOC paths wrap this revert as a *normal* outcome, not an error; batch results read `successes[i]` |
| `placeOrder`-style txs can mine while the order was rejected | Post-mine verification: require expected event / positive state delta, else classify REJECTED + report |
| Per-account position cap ≈ 1/10 of market OI cap; `MaxPositionSizeExceeded()` `0x714b36d6` | Pre-check via `getMaxPerpOrderSize` (`maxQuantity`, `limitedBy`, `priceable`) before every intent |
| Stops: 0.15 STT locked each; USDso-only (voucher) accounts cannot place them | Software TP/SL in GuardAgent; no on-chain stop dependence on voucher accounts |
| Funding: 8h window settled hourly, payment = size × index × rate ÷ 8, peer-to-peer | Funding-carry signal computes APR from `FundingRateUpdate` stream; accrual shown per position |
| Voucher: 1,000 paper USDso, claim requires no open positions/orders; 6 markets voucher-blocked | Claim gated on eligibility + empty state; default market `ETH-PERP` (allowlisted) |
| Mark staleness → `priceable:false`; stale reads veto | Staleness ≤ 10s enforced by RiskAgent for both reads and writes |
| Gas: bot-kit uses 10,000,000 limit; out-of-gas receipts show status 0 with no reason | Fixed generous gas limit + `eth_call` preflight at parent block; receipt status checked explicitly |
| SDK requires WebSocket RPC (`genesis check failed` on HTTP-only) | Config validates `ws://`/`wss://` scheme; doctor fails fast with this exact hint |

---

## 6. Multi-Agent System Architecture

Seven cooperating agents run in one Node process, coordinated by a tick-loop orchestrator over a typed bus. Every inter-agent message is a zod-validated envelope, persisted to `runs/*.jsonl` (replayable) and mirrored to the dashboard.

### 6.1 Agents, roles, tools

| Agent | Role | Tools / inputs | Outputs |
|---|---|---|---|
| **Orchestrator** | 2s tick; schedules agents in fixed order (marketData → signals → copilot → risk → execution → guard → reporter); global halt on fatal conditions; DRY_RUN enforcement | bus, kv state | tick envelopes, halt directives |
| **MarketDataAgent** | Builds the single source-of-truth snapshot | SDK reads (listPerpMarkets, marks, book), GraphQL (funding, fills, pnl), local clock | `MarketSnapshot` |
| **SignalsAgent** | Pure functions: funding-carry + EMA(9/21) momentum on 1m candles | `MarketSnapshot`, positions | `Signal[]` with score + rationale |
| **CopilotAgent** | Advisory brain: picks one legal action + reason; explains decisions in the dashboard and README demo | `MarketSnapshot`, `Signal[]`, open position/risk, Anthropic API (optional) | `Decision` (action + rationale + confidence); falls back to highest-scoring rule signal when no key or on API error |
| **RiskAgent** | Deterministic kernel with absolute veto; owns halt flag | `OrderIntent`, config caps, kv (daily anchor), snapshot staleness | `RiskVerdict {approved, reasons[]}` |
| **ExecutionAgent** | Order state machine; the only agent that signs/broadcasts (never in DRY_RUN) | SDK trader (placePerpOrder via trader path), viem for eth_call preflight, receipts/events | `ExecutionReport` |
| **GuardAgent** | Independent protection loop (runs even if strategy agents halt): software TP/SL (+2%/−1.5%), daily loss cap → close-all | positions, marks, clock | reduce-only `OrderIntent` (pre-approved class) + halt directives |
| **ReporterAgent** | Converts anomalies into bounty-grade findings | findings db, bus error envelopes, probe registry | `feedback/*.md`, findings feed |

### 6.2 Deterministic message schemas (zod; all envelopes share the frame)

```ts
// Frame: every message on the bus
export const Envelope = z.object({
  seq: z.number().int().nonnegative(),        // orchestrator-assigned, monotonic
  ts: z.number().int(),                       // epoch ms
  agent: z.enum(['orchestrator','marketData','signals','copilot','risk','execution','guard','reporter']),
  kind: z.string(),                            // payload discriminator
  payload: z.unknown(),                        // validated against the kind's schema below
  dryRun: z.boolean(),
});

export const MarketSnapshot = z.object({
  symbol: z.string(),                          // "ETH-PERP"
  markPrice: z.string(),  indexPrice: z.string(),        // decimal strings (18dp USDso)
  markAgeMs: z.number().int(), priceable: z.boolean(),
  fundingRate: z.string(), fundingApr: z.string(),       // live, from indexer/SDK
  bestBid: z.string().nullable(), bestAsk: z.string().nullable(),
  tickSize: z.string(), lotSize: z.string(), minQuantity: z.string(),
  baseDecimals: z.number().int(), quoteDecimals: z.number().int(),
  ts: z.number().int(),
});

export const Signal = z.object({
  strategy: z.enum(['funding-carry','ema-momentum']),
  side: z.enum(['long','short','flat']),
  strength: z.number(),                        // 0..1
  rationale: z.string(),
});

export const Decision = z.object({
  action: z.enum(['open_long','open_short','increase','reduce','close','hold','cancel_all']),
  notionalUsdso: z.string().optional(),        // requested size; risk kernel may shrink/veto
  rationale: z.string().min(1),
  confidence: z.number().min(0).max(1),
  source: z.enum(['llm','rule']),
});

export const OrderIntent = z.object({
  id: z.string().uuid(), symbol: z.string(),
  side: z.enum(['buy','sell']), reduceOnly: z.boolean(),
  notionalUsdso: z.string(), tif: z.enum(['GTC','IOC','FOK','ALO']),
  limitPriceUsdso: z.string().nullable(),      // null => cross-marketable limit derived at preflight
  origin: z.enum(['copilot','guard','probe']),
});

export const RiskVerdict = z.object({
  intentId: z.string(), approved: z.boolean(),
  reasons: z.array(z.string()),                // machine codes: E_STALE_MARK, E_DAILY_LOSS, E_CAP_NOTIONAL, …
  adjustedNotionalUsdso: z.string().optional(),
});

export const ExecutionReport = z.object({
  intentId: z.string(), state: z.enum(['PREFLIGHT','SIGNED','SUBMITTED','MINED','CONFIRMED','REJECTED']),
  txHash: z.string().nullable(), onChainOrderId: z.string().nullable(),
  rejectReason: z.string().nullable(),         // decoded via listPerpOrderRejections / revert map
  gasUsed: z.string().nullable(), ts: z.number().int(),
});

export const Finding = z.object({
  probeId: z.string(), title: z.string(),
  severity: z.enum(['critical','major','normal']),
  area: z.enum(['API','SDK','docs','app','contracts']),
  evidence: z.record(z.string(), z.unknown()), // txHash, req/resp, raw logs
});
```

### 6.3 Contract between agents (non-negotiable invariants)

1. Only `ExecutionAgent` touches signing keys; it refuses to run when `DRY_RUN=true` (logs the exact order it would send instead).
2. `RiskAgent` verdicts are final; no agent may bypass them, including `GuardAgent` (guard intents are a pre-approved class validated by the same code path with `origin:'guard'`).
3. Every bus message is appended to `runs/<date>.jsonl` before delivery (write-ahead), enabling keyless replay.
4. Any `Finding` produced during live trading is written by `ReporterAgent` within the same tick — no evidence loss on crash.
5. Secrets (private key, API key) never enter envelopes, logs, or the database; logger redacts by pattern.

---

## 7. Feedback-Track Plan (probe matrix)

Each probe is a committed, idempotent script producing a `feedback/` markdown report in the exact bounty template. Full spec in `backlog.md` Phase 8.

| ID | Area | Scenario | Expected finding class |
|---|---|---|---|
| P-01 | contracts | ETH-PERP order sized with 6-decimal assumption (vs actual 18) | Misleading `InsufficientCollateral()` revert |
| P-02 | contracts | Limit price `0` submitted | price=0 is a literal price, never crosses — error quality |
| P-03 | contracts | IOC priced far from touch | `ImmediateOrCancelNoFill()` revert (0xd48c4403) behavior |
| P-04 | contracts | Off-tick price / non-lot quantity | constraint revert message quality |
| P-05 | API/SDK | `getMaxPerpOrderSize` vs on-chain cap divergence on sized order | pre-check accuracy |
| P-06 | contracts | Over-cap order → `MaxPositionSizeExceeded()` 0x714b36d6 | error surfacing |
| P-07 | contracts | Stop-order placement attempt from voucher (USDso-only) account | documented restriction verification + UX |
| P-08 | SDK | Voucher claim on voucher-blocked market (e.g. ZEC-PERP) | `limitedBy: "voucherBlocked"` propagation |
| P-09 | API | GraphQL `markPrice` vs SDK live mark during volatility | indexer lag/staleness window |
| P-10 | SDK | Mark staleness: order attempt right after WS outage | `priceable:false` handling + recovery |
| P-11 | contracts | Double-cancel / cancel of filled order | idempotency + error semantics |
| P-12 | docs | Bounty says "Tokyo", SDK says `hidekiTestnet`, Somnia docs document only Shannon 50312, faucets Shannon-only | doc/network naming + faucet gap |
| P-13 | docs | Perps pages imply REST-style integration but HTTP API covers spot only | docs routing gap |
| P-14 | SDK | bot-kit `perp-core` pins `^0.31.0` (never receives 0.32.x on 0.x caret) vs docs' 0.32.1 | version skew |

---

## 8. Out of Scope (explicit non-goals)

- **Mainnet anything.** Perps are testnet-only; the $200 mainnet tranche is handled by keeping the repo deployable, not by building mainnet paths now.
- **Spot HTTP API / SIWE / JWT auth.** The `stg.api.dreamdex.io` surface is spot-only; perps need none of it. Not built, not proxied.
- **Real funds.** Voucher paper USDso only; no bridging, no swapping for real USDso, no withdrawals.
- **On-chain stop-order automation.** Blocked by voucher restriction; software stops only (documented as feedback P-07).
- **Backtesting engine.** bot-kit has one; we link it, we don't rebuild it.
- **Multi-market / hedge-mode / cross-market isolated accounts.** Single-market (`ETH-PERP`) by risk policy; isolated-mode cross-market trading is contract-blocked anyway.
- **Mobile app, user accounts, hosted multi-tenant service.** Local operator tool; dashboard is localhost, unauthenticated, read-only.
- **Rails/K8s/24-7 hosting.** Local long-run is enough for the demo window; Railway doc link provided as reference only.
- **Custom price oracle / cross-exchange arbitrage data.** Signals use dreamDEX-native prices and funding only.
- **Fine-tuning or local LLMs.** One hosted LLM behind an optional key; rule mode is the guaranteed baseline.

---

## 9. Evaluation Mapping (how the build scores on the stated rubric)

| Rubric item | Our evidence |
|---|---|
| MVP potential: clear user value | Operator gets a safe autonomous perps trader with live explainability (dashboard rationale feed) |
| Credible scope | 48h plan executes a single-market loop end-to-end; explicit out-of-scope list |
| Viral / repeat-use loop | Daily-run operator loop + reusable probe suite other entrants/integrators adopt; feedback/ is a standalone resource |
| Technical execution | Risk kernel + state machine + evidence logs; unit-tested pure modules |
| Evidence of building: live orders | `docs/EVIDENCE.md` tx hashes on Tokyo explorer; `npm run demo:live` reproduces |
| Feedback: severity/clarity/reproducibility/usefulness | 14 deterministic probe scripts → templated reports with tx hashes, req/resp, env block; each report reproducible by judges with one command |

## 10. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| STT gas faucet friction on chain 50383 (Somnia docs list Shannon faucets) | High | HUMAN step in hour 1 (app top-up + faucet + Discord fallback); bot gas use is tiny (0.0003–0.003 STT/tx); 14 probes budgeted ≤ ~0.1 STT |
| SDK API differs from doc-level names (constructor/methods) | Medium | TASK-2.4 extracts the installed `.d.ts` into `docs/sdk-api.md` before any code depends on it; deviations become feedback findings, not blockers |
| Voucher claim eligibility surprises (position/order state) | Low | Claim runs on fresh burner wallet before any orders; eligibility checked and printed first |
| LLM API outage/latency in decision loop | Medium | Rule-mode fallback is the default path; LLM strictly advisory with timeout |
| Testnet instability (indexer lag, WS drops) | Medium | Reconnect with backoff, staleness vetoes, probe P-09/P-10 turn the instability itself into findings |
| Duplicate feedback reports (first-report-wins rule) | Medium | Submit early-and-often: Phase 8 lands reports by hour 30, before the flood |
