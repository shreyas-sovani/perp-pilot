---
title: dreamDEX Documentation Index for Agents
purpose: Canonical link map for researching dreamDEX integration patterns, trading semantics, APIs, contracts, security, and bot best practices.
last_verified: 2026-10-20
---

# dreamDEX Documentation Index for Agents

Use this file as a **navigation index**, not as a replacement for the linked documentation. It indexes every page listed in the live dreamDEX docs navigation observed on 2026-10-20, plus related public documentation and agent skill files in repositories published by the official `somnia-chain` GitHub organization.

- **Primary docs:** <https://app.dreamdex.io/docs>
- **Trading overview:** <https://app.dreamdex.io/docs/trading>
- **Developer documentation:** <https://app.dreamdex.io/docs/developers>
- **Quick Start:** <https://app.dreamdex.io/docs/welcome/quick-start>
- **Bot-building toolkit:** <https://github.com/somnia-chain/dreamdex-bot-kit>
- **CLI and LLM reference:** <https://github.com/somnia-chain/somnia-dex-cli/blob/main/SKILL.md>

The website describes itself as a living document, so re-open the source page before relying on values, routes, contract addresses, supported features, or order semantics. Links and implementation details can change.

## 1. Fast routing: which docs should an agent read?

| Agent task | Start here | Then consult |
|---|---|---|
| Understand the protocol and its assumptions | [Introduction](https://app.dreamdex.io/docs) | [Why dreamDEX?](https://app.dreamdex.io/docs/welcome/why-dreamdex), [Trading overview](https://app.dreamdex.io/docs/trading) |
| Place a first trade or build a minimal integration | [Quick Start](https://app.dreamdex.io/docs/welcome/quick-start) | [Link a Bot](https://app.dreamdex.io/docs/trading/common/link-a-bot), [HTTP API overview](https://app.dreamdex.io/docs/developers/http-api) |
| Build an autonomous trading bot | [dreamdex-bot SKILL.md](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/skills/dreamdex-bot/SKILL.md) | [Bot kit getting started](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/getting-started.md), [Gotchas](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/gotchas.md), [CLI LLM skill](https://github.com/somnia-chain/somnia-dex-cli/blob/main/SKILL.md) |
| Integrate by REST | [HTTP API overview](https://app.dreamdex.io/docs/developers/http-api) | [Authentication](https://app.dreamdex.io/docs/developers/http-api/authentication), [Market Data](https://app.dreamdex.io/docs/developers/http-api/market-data), [Trading](https://app.dreamdex.io/docs/developers/http-api/trading), [Error Handling](https://app.dreamdex.io/docs/developers/http-api/error-handling) |
| Stream order book, trades, or order updates | [WebSocket API overview](https://app.dreamdex.io/docs/developers/websocket-api) | [Real-Time Feed](https://app.dreamdex.io/docs/developers/websocket-api/real-time-feed), [Operations](https://app.dreamdex.io/docs/developers/websocket-api/operations), [Errors](https://app.dreamdex.io/docs/developers/websocket-api/errors) |
| Interact directly with contracts | [Contract Addresses](https://app.dreamdex.io/docs/developers/contracts/contract-addresses) | [Specifications](https://app.dreamdex.io/docs/developers/contracts/contract-specifications), [Functions](https://app.dreamdex.io/docs/developers/contracts/functions), [Events](https://app.dreamdex.io/docs/developers/contracts/events), [Types](https://app.dreamdex.io/docs/developers/contracts/types), [Errors](https://app.dreamdex.io/docs/developers/contracts/errors) |
| Use session keys or delegated/operator trading | [Operators & Session Keys](https://app.dreamdex.io/docs/trading/spot/operators) | [Bot kit session keys](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/session-keys.md), [SpotRouter](https://app.dreamdex.io/docs/developers/contracts/spot-router) |
| Build on Event Contracts | [Building on Event Contracts](https://app.dreamdex.io/docs/developers/event-contracts) | [Recipes](https://app.dreamdex.io/docs/developers/event-contracts/recipes), [Market Structure & Lifecycle](https://app.dreamdex.io/docs/developers/event-contracts/market-structure), [Contracts & Addresses](https://app.dreamdex.io/docs/developers/event-contracts/contracts-and-addresses), [Gotchas](https://app.dreamdex.io/docs/developers/event-contracts/gotchas), [Bot kit Event Contracts](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/event-contracts.md) |
| Build on Perps | [Perps developer docs](https://app.dreamdex.io/docs/developers/perps-testnet) | [Bot kit Perps guide](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/perps.md), [Trading Perps overview](https://app.dreamdex.io/docs/trading/perps-testnet) |
| Debug rejected or unexpected behavior | [HTTP API Error Handling](https://app.dreamdex.io/docs/developers/http-api/error-handling) | [Contract Errors](https://app.dreamdex.io/docs/developers/contracts/errors), [Bot kit Gotchas](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/gotchas.md), [Support FAQ](https://app.dreamdex.io/docs/support/faq) |
| Verify risk assumptions and security posture | [Risks](https://app.dreamdex.io/docs/security/risks) | [Audits](https://app.dreamdex.io/docs/security/audits), [Get Help / official channels](https://app.dreamdex.io/docs/support/get-help) |
| Run a bot continuously in production | [24/7 Operations](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/24-7-operations.md) | [Architecture](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/architecture.md), [Railway deployment](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/railway.md), [Measuring Edge](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/measuring-edge.md) |

## 2. Main dreamDEX web docs: complete published navigation

### Welcome

| Page | What it covers | Link |
|---|---|---|
| Introduction | Protocol overview, values, capabilities, top-level navigation | <https://app.dreamdex.io/docs> |
| Why dreamDEX? | Design choices, trade-offs, positioning, agent-native access | <https://app.dreamdex.io/docs/welcome/why-dreamdex> |
| Making Your First Deposit | End-user wallet connection and funding flow in the app | <https://app.dreamdex.io/docs/welcome/making-your-first-deposit> |
| Quick Start | First order through CLI, REST, or direct contract tooling; environment setup | <https://app.dreamdex.io/docs/welcome/quick-start> |
| Roadmap | Product direction and distinctions between current and planned capabilities | <https://app.dreamdex.io/docs/welcome/roadmap> |

### Trading

| Page | What it covers | Link |
|---|---|---|
| Trading overview | On-chain CLOB, order matching, settlement, yield, integration overview | <https://app.dreamdex.io/docs/trading> |
| Fees | Maker/taker fees and gas sponsorship context | <https://app.dreamdex.io/docs/trading/common/fees> |
| Collateral Yield Algorithm | How yield is allocated to market makers and how quote proximity affects it | <https://app.dreamdex.io/docs/trading/common/yield-algorithm> |
| Order Types | Supported order types and order execution behavior | <https://app.dreamdex.io/docs/trading/common/order-types> |
| Link a Bot | Paths for connecting a bot or agent to dreamDEX | <https://app.dreamdex.io/docs/trading/common/link-a-bot> |
| Spot overview | Spot product and order-book basics | <https://app.dreamdex.io/docs/trading/spot> |
| Simple Swap | App-level swap flow | <https://app.dreamdex.io/docs/trading/spot/simple-swap> |
| Operators & Session Keys | Delegated trading, operators, and session-key concepts | <https://app.dreamdex.io/docs/trading/spot/operators> |
| Stop Orders | Stop-order placement, trigger behavior, and lifecycle | <https://app.dreamdex.io/docs/trading/spot/stop-orders> |
| Event Contracts overview | Up/Down market semantics, collateral, pricing, and settlement | <https://app.dreamdex.io/docs/trading/event-contracts> |
| Event Contracts: Settlement & Voids | Settlement reference, lifecycle, and void behavior | <https://app.dreamdex.io/docs/trading/event-contracts/settlement-and-voids> |
| Event Contracts FAQ | Common questions about prices, resolution, exits, voids, and bots | <https://app.dreamdex.io/docs/trading/event-contracts/faq> |
| Perps (Testnet) overview | Testnet perpetuals product overview | <https://app.dreamdex.io/docs/trading/perps-testnet> |
| Perps: Margin & Liquidations | Margin requirements and liquidation mechanics | <https://app.dreamdex.io/docs/trading/perps-testnet/margin-and-liquidations> |
| Perps: Funding | Perpetual funding mechanics | <https://app.dreamdex.io/docs/trading/perps-testnet/funding> |
| Perps: Orders | Perpetual order behavior | <https://app.dreamdex.io/docs/trading/perps-testnet/orders> |
| Lend overview | Supplying, borrowing, and repaying through SomniaLend in the app | <https://app.dreamdex.io/docs/trading/earn> |

### Developers: contracts

| Page | What it covers | Link |
|---|---|---|
| Developers overview | Integration choices: contracts, REST, WebSocket, and libraries | <https://app.dreamdex.io/docs/developers> |
| Contracts overview | On-chain integration surface overview | <https://app.dreamdex.io/docs/developers/contracts> |
| Contract Addresses | Deployed contract addresses by environment | <https://app.dreamdex.io/docs/developers/contracts/contract-addresses> |
| Contract Specifications | Contract-level specifications and parameter conventions | <https://app.dreamdex.io/docs/developers/contracts/contract-specifications> |
| Functions | External contract functions and their behaviors | <https://app.dreamdex.io/docs/developers/contracts/functions> |
| Events | Emitted events and how to interpret them | <https://app.dreamdex.io/docs/developers/contracts/events> |
| Types | Contract structs, enums, and shared types | <https://app.dreamdex.io/docs/developers/contracts/types> |
| Errors | Contract error names and meanings | <https://app.dreamdex.io/docs/developers/contracts/errors> |
| SpotRouter | SpotRouter contract reference | <https://app.dreamdex.io/docs/developers/contracts/spot-router> |

### Developers: HTTP API

| Page | What it covers | Link |
|---|---|---|
| HTTP API overview | REST base URLs, environment selection, API capabilities and limitations | <https://app.dreamdex.io/docs/developers/http-api> |
| Error Handling | HTTP error response shape and machine-readable error names | <https://app.dreamdex.io/docs/developers/http-api/error-handling> |
| Authentication | Sign-In with Ethereum (SIWE) and bearer-token workflow | <https://app.dreamdex.io/docs/developers/http-api/authentication> |
| Market Data | Market, currency, price, candle, and order-book data endpoints | <https://app.dreamdex.io/docs/developers/http-api/market-data> |
| Trading | Order preparation and order-related REST endpoints | <https://app.dreamdex.io/docs/developers/http-api/trading> |
| Builder Fees | Builder-code and fee-related API integration | <https://app.dreamdex.io/docs/developers/http-api/builder-fees> |
| Vault | Vault balances and deposit/withdraw/approval operations | <https://app.dreamdex.io/docs/developers/http-api/vault> |
| Wallets | Wallet-related endpoints | <https://app.dreamdex.io/docs/developers/http-api/wallets> |
| Portfolio | Portfolio and position/balance aggregation endpoints | <https://app.dreamdex.io/docs/developers/http-api/portfolio> |

### Developers: libraries, Event Contracts, Perps, and WebSocket

| Page | What it covers | Link |
|---|---|---|
| Libraries overview | Client library options | <https://app.dreamdex.io/docs/developers/libraries> |
| CCXT | CCXT-compatible library integration | <https://app.dreamdex.io/docs/developers/libraries/ccxt> |
| Building on Event Contracts | Developer integration model and SDK-oriented entry point | <https://app.dreamdex.io/docs/developers/event-contracts> |
| Event Contracts recipes | Task-oriented Event Contracts implementation recipes | <https://app.dreamdex.io/docs/developers/event-contracts/recipes> |
| Event Contract Market Structure & Lifecycle | Market representation and lifecycle | <https://app.dreamdex.io/docs/developers/event-contracts/market-structure> |
| Event Contracts: Contracts & Addresses | Event Contracts contract addresses and deployment references | <https://app.dreamdex.io/docs/developers/event-contracts/contracts-and-addresses> |
| Event Contracts: Gotchas | Known integration pitfalls and edge cases | <https://app.dreamdex.io/docs/developers/event-contracts/gotchas> |
| Perps developer docs (Testnet) | Developer entry point for perpetuals on testnet | <https://app.dreamdex.io/docs/developers/perps-testnet> |
| WebSocket API overview | Real-time API overview and connection guidance | <https://app.dreamdex.io/docs/developers/websocket-api> |
| WebSocket: Real-Time Feed | Channels, subscriptions, and streaming payloads | <https://app.dreamdex.io/docs/developers/websocket-api/real-time-feed> |
| WebSocket: Operations | Subscribe/unsubscribe and protocol operations | <https://app.dreamdex.io/docs/developers/websocket-api/operations> |
| WebSocket: Errors | WebSocket error cases and handling | <https://app.dreamdex.io/docs/developers/websocket-api/errors> |

### Security, support, and troubleshooting

| Page | What it covers | Link |
|---|---|---|
| Risks | Protocol and trading risk discussion | <https://app.dreamdex.io/docs/security/risks> |
| Audits | Published audit information | <https://app.dreamdex.io/docs/security/audits> |
| Support overview | Support paths and common problem categories | <https://app.dreamdex.io/docs/support> |
| Get Help | Official support process, official links, and scam-avoidance guidance | <https://app.dreamdex.io/docs/support/get-help> |
| FAQ overview | Troubleshooting index | <https://app.dreamdex.io/docs/support/faq> |
| My funds are not showing | Missing or delayed funds troubleshooting | <https://app.dreamdex.io/docs/support/faq/funds-not-showing> |
| My order was rejected | Order rejection troubleshooting | <https://app.dreamdex.io/docs/support/faq/order-rejected> |
| My stop did not work | Stop-order troubleshooting | <https://app.dreamdex.io/docs/support/faq/stop-order-did-not-work> |
| My Event Contract settled against me | Settlement dispute and verification guidance | <https://app.dreamdex.io/docs/support/faq/event-contract-settlement> |
| Fees and gas | Fee, funding, and gas troubleshooting | <https://app.dreamdex.io/docs/support/faq/fees-funding-and-gas> |
| I got scammed or hacked | Security incident response guidance | <https://app.dreamdex.io/docs/support/faq/scammed-or-hacked> |

## 3. Official public agent and bot-building resources

These repositories are under the official `somnia-chain` GitHub organization. Treat their implementation examples as useful references, but use the live protocol docs above as the authority for current contract addresses, API behavior, order semantics, and supported features.

### dreamdex-bot-kit

- [Repository README](https://github.com/somnia-chain/dreamdex-bot-kit): overview, package layout, working bot examples, strategy templates, and project setup.
- [dreamdex-bot `SKILL.md`](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/skills/dreamdex-bot/SKILL.md): agent-oriented DreamDEX bot guidance, common workflows, order behavior, gotchas, session keys, and toxic-fill analysis.
- [Somnia `SKILL.md`](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/skills/somnia/SKILL.md): Somnia network, chain configuration, and underlying chain concepts.
- [Getting Started](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/getting-started.md): initial bot setup and first workflow.
- [Architecture](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/architecture.md): bot kit components and design.
- [Gotchas](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/gotchas.md): DreamDEX-specific edge cases; read before implementing write paths.
- [Session Keys](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/session-keys.md): delegated trading and session-key approach.
- [Backtesting](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/backtesting.md): backtest engine and historical strategy evaluation.
- [Measuring Edge](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/measuring-edge.md): analyze captured spread, adverse selection, and fill quality.
- [24/7 Operations](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/24-7-operations.md): continuous operation and reliability considerations.
- [Railway Deployment](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/railway.md): deployment guide for Railway.
- [Event Contracts guide](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/event-contracts.md): bot-kit-specific Event Contracts integration notes.
- [Perps guide](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/perps.md): bot-kit-specific Perps notes.
- [Examples directory](https://github.com/somnia-chain/dreamdex-bot-kit/tree/main/examples): sanitized bot examples; check the docs and gotchas before reusing.
- [Strategies directory](https://github.com/somnia-chain/dreamdex-bot-kit/tree/main/strategies): strategy templates.
- [Core packages](https://github.com/somnia-chain/dreamdex-bot-kit/tree/main/packages): shared integration code.
- [Advanced EIP-7702 example](https://github.com/somnia-chain/dreamdex-bot-kit/tree/main/advanced/batch-7702): advanced transaction batching example, not a trading strategy.
- [Edge analytics tool](https://github.com/somnia-chain/dreamdex-bot-kit/tree/main/tools/edge-analytics): analysis tooling for post-trade performance.

### dreamDEX CLI

- [CLI repository](https://github.com/somnia-chain/somnia-dex-cli): Go CLI for interacting with dreamDEX.
- [CLI README](https://github.com/somnia-chain/somnia-dex-cli/blob/main/README.md): installation, configuration, CLI workflows, MCP setup, and available tool inspection.
- [CLI `SKILL.md`](https://github.com/somnia-chain/somnia-dex-cli/blob/main/SKILL.md): command reference designed for LLM agents, including arguments, outputs, order semantics, and environment setup.
- [CLI license](https://github.com/somnia-chain/somnia-dex-cli/blob/main/LICENSE.md): repository license.

## 4. Environment and protocol reminders

The HTTP API overview currently documents these values. Verify them against the live docs before deploying or signing transactions.

| Environment | Somnia chain ID | REST base URL | Public WebSocket |
|---|---:|---|---|
| Mainnet | `5031` | `https://api.dreamdex.io/v0` | `wss://api.dreamdex.io/v0/ws/public` |
| Testnet (Somnia Shannon) | `50312` | `https://stg.api.dreamdex.io/v0` | `wss://stg.api.dreamdex.io/v0/ws/public` |

- The `/v0` API path prefix is required in both environments.
- The HTTP API is not, by itself, a transaction broadcaster. The documented integration flow requires the client to sign and broadcast the transaction to Somnia.
- Use WebSocket streams for continuously changing book/trade/order state when the relevant channel is available, rather than building a needless high-frequency polling loop.
- Perps pages are explicitly marked Testnet. Do not treat them as a mainnet production capability without current official confirmation.
- Event Contracts have their own developer surface. The official docs state that the HTTP API covers spot only and that Event Contracts use `@somnia-chain/markets-sdk`; verify the current SDK version and API before coding.

## 5. High-impact bot implementation pitfalls

These are highlighted by the official [dreamdex-bot skill](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/skills/dreamdex-bot/SKILL.md) and [Gotchas guide](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/docs/gotchas.md). Re-check those links before acting because these details are version-sensitive.

- **Do not use removed order-placement functions.** The bot kit flags `placeTakerOrderWithoutVault` as removed in the June 2026 spot upgrade. Start from the current [Functions reference](https://app.dreamdex.io/docs/developers/contracts/functions) and bot-kit core API instead of adapting an old snippet blindly.
- **`price = 0` is not a market order.** The bot skill says zero is a literal limit price. Check the current order type and crossing rules in [Order Types](https://app.dreamdex.io/docs/trading/common/order-types) before submitting.
- **Expiration units matter.** Direct-contract bot code must supply a future `expireTimestampNs` in nanoseconds; zero, past, or current timestamps are rejected according to the skill. Verify the function docs for the target contract version.
- **A mined transaction can still be an unsuccessful order attempt.** The bot skill notes `placeOrder` may return `success = false` without reverting. Simulate before sending, then inspect the mined receipt and expected events rather than treating a successful transaction receipt as proof that an order was accepted.
- **Read token decimals, do not assume them.** The bot skill flags USDso as 18 decimals. Query decimals or use a well-tested token metadata source rather than applying USDC-style six-decimal assumptions.
- **Do not rely on REST as the sole source of execution truth.** The bot skill warns REST book/trade snapshots can lag or stall. For fills and inventory, reconcile against on-chain events/state; use the [WebSocket Real-Time Feed](https://app.dreamdex.io/docs/developers/websocket-api/real-time-feed) for live updates where suitable.
- **Keep dry-run and testnet on during development.** The bot skill says strategy templates default to `DRY_RUN=true`; only switch to live order submission after reviewing the strategy, keys, network, sizes, and risk controls.

## 6. Agent operating rules for reliable integrations

1. **Read the relevant live source before coding.** Use the routing table above. Open the live page directly instead of relying on memory or stale snippets.
2. **Prefer specifications over examples.** For contract calls, start with Addresses, Specifications, Functions, Types, Events, and Errors. For HTTP behavior, start with the API pages. Bot examples can lag behind protocol changes.
3. **Re-check addresses and network selection.** Never infer deployment addresses from a code sample. Resolve the appropriate official address page and environment before forming a transaction.
4. **Respect order and amount constraints.** Discover current market symbols, tick sizes, lot sizes, minimum quantities, and supported order/funding-source combinations from current docs/API data. Do not hard-code assumptions across markets.
5. **Handle execution as a state machine.** Account for prepared-but-not-broadcast transactions, confirmations, partial fills, resting orders, cancellation, expiry, and failures. Use events or WebSocket updates where appropriate and reconcile with on-chain state for critical decisions.
6. **Treat secrets and signatures as high-risk.** Never ask a user to paste a seed phrase or private key into chat, logs, a repository, or a prompt. Keep signing material in a secure wallet/keystore or explicitly configured secret store. Do not sign or submit a value-moving transaction without clear user authorization and an explicit review of its chain, contract, asset, amount, and intended effect.
7. **Fail closed on uncertainty.** If an endpoint, function, address, token, error, or order semantic is not found in the official sources, do not invent it. Search the docs and official repositories, then state what remains unverified.
8. **Read the gotchas before adapting older code.** The current bot-kit README warns that DreamDEX spot contracts were upgraded in June 2026 and that older examples may call the removed `placeTakerOrderWithoutVault` function. Do not copy older order-placement code without validating it against the current contract and `gotchas.md`.
9. **Separate facts from strategy judgments.** Protocol docs establish behavior, not profitability. For a trading strategy, backtest it, measure realized edge and adverse selection, include gas/execution failure costs, and avoid claims of guaranteed returns.
10. **Keep citations in generated code or reports.** For consequential design decisions, record the official documentation URL next to the assumption so future maintainers can re-verify it.

## 7. Related underlying-chain reference

This is not DreamDEX-published documentation, but can be relevant when an integration needs Somnia network behavior or tooling:

- [Somnia documentation](https://docs.somnia.network)
- [Somnia official GitHub organization](https://github.com/somnia-chain)

---

## Scope note

This index covers the complete set of pages visible in the live dreamDEX docs navigation on **2026-10-20**, plus the listed official public CLI and bot-kit docs. It is not a guarantee that no unlinked, newly published, or private documentation exists. Rebuild or refresh the index when the site navigation or official repositories change.
