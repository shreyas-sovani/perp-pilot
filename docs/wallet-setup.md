# Wallet Setup (live, verified 2026-10-27)

Project status (2026-10-27): Phase 7 dashboard is up at `http://localhost:8787` (`npm run dashboard`) while `npm run demo:dry` writes the run. Screenshot: `docs/dashboard-screenshot.png`. Cross-process marks come from `runs/<date>.jsonl` because the in-process bus does not cross processes. Owner margin 2000 USDso. `DRY_RUN=true` still blocks sends (`REJECTED DRY_RUN_BLOCKED` once the 2000 equity anchor lets risk approve). Funding APR helper is still the raw integer. Next is Phase 8 (feedback harness). Private repo: `https://github.com/shreyas-sovani/perp-pilot`. Bounty submission still needs a public repo before the portal deadline.

All on Somnia Tokyo testnet (hideki), chain ID `50383`. Private key lives only in local `.env` (gitignored).

## Accounts

| Role | Address | State (verified via RPC) |
|---|---|---|
| Bot EOA (MetaMask, linked in app) | `0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F` | 5 STT gas (auto-sent by app at link time) |
| Trading wallet (OWNER_ADDRESS, linked in dreamDEX app) | `0xf9beA92fee8105aC59186dAced61910Fc1DE80f6` | 35.44 STT; USDso margin visible in app |
| Login burner EOA | `0xFe…690A` (keep private) | STT on Shannon 50312 only — not used for perps |
| dreamDEX app signing key | `0x22…4574` | Pays gas for app-level actions |

## Mode: linked-bot (not voucher/own-account)

- Bot was added via dreamDEX app → Manage → Bot access → Link a bot, **Perps** ticked, "Send it for gas" ON.
- Capabilities: place / cancel / reduce orders for the trading wallet only. No withdrawals. Fills settle to the trading wallet.
- `.env` uses `OWNER_ADDRESS=0xf9be…80f6` so the SDK trades `placeOrderFor`-style on the wallet's behalf.
- Perps permission is per-market: when dreamDEX lists new perp markets, re-add the bot in the app.
- Voucher claim (backlog TASK-6.2) is optional backup only — trading wallet already holds margin.
- Bot key was generated in MetaMask. Note: it was also pasted into a chat session, so treat it as testnet-only. Never reuse pattern with funded keys.

## Gas

No public faucet exists for 50383 (Shannon faucet `testnet.somnia.network` serves 50312 only — different chain, unusable for perps). Bot gas route = in-app: Bots tab → Top up (Send STT) from the trading wallet. Real cost per perp tx: 0.0003–0.003 STT, so 5 STT ≈ thousands of transactions. Emergency fallback: Somnia Discord `#dev-chat`.

## Margin (verified by `npm run doctor`, 2026-10-27)

| Account | Equity | Voucher |
|---|---|---|
| Bot `0x8AF6…275F` | 0 USDso, status Healthy | eligible, grant 1000 paper USDso. Not claimed. |
| Owner `0xf9be…80f6` | 2000 USDso, status Healthy | `alreadyClaimed` |

Margin sits in MarginBank account health (`getAccountHealth`), not in the USDso ERC20 `balanceOf`. The earlier zero ERC20 read was the wrong surface. Full table: `docs/doctor-output.txt`.

`Trader.placePerpOrder` takes no account field. It signs as the bot. The 2000 USDso is on the owner. Live orders still need a path that spends the owner's margin (app bot-link / operator), or they will hit an empty bot account. Voucher claim stays optional and unsent.
