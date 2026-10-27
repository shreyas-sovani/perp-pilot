# Wallet Setup (live, verified 2026-10-27)

Project status (2026-10-27): Phase 5 is in. Execution dry-run blocks broadcasts (`REJECTED DRY_RUN_BLOCKED`). Guard tests pass. Copilot falls back to rules when `ANTHROPIC_API_KEY` is blank. Orchestrator produced 12 live snapshots in 25s with no tick errors. It does not send orders: funding APR is still the raw helper (always short) and risk vetoes `E_CAP_LEVERAGE` while equity is 0. `DRY_RUN=true`. Bot holds 5 STT. Next is Phase 6 (`doctor`, claim, trade entry). Private repo: `https://github.com/shreyas-sovani/perp-pilot`. Bounty submission still needs a public repo before the portal deadline.

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

## Open verification item

Trading wallet shows USDso in the app, but `balanceOf` on the USDso ERC20 and on MarginBank (`0x4787…1394`) returns 0 / reverts — margin is held inside dreamDEX's internal perps accounting, not as a plain ERC20 balance. Confirm actual usable margin via `npm run doctor` once the SDK layer is built (backlog TASK-6.1). If margin turns out to sit in the spot side, move it with the in-app Perps ⇆ Spot tool.
