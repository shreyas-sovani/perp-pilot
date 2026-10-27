# Wallet Setup (live, verified 2026-10-27)

Project status (2026-10-27): `0xFeAf5C921996FC53f4DEf35e181E766e6D74690A` is the login burner, not `OWNER_ADDRESS`. It has 50 STT on Tokyo and 0 perps equity. The 2000 USDso still sits on `0xf9beA92fee8105aC59186dAced61910Fc1DE80f6`, and this repo cannot sign for that account. `.env` `DRY_RUN=true`. No private key from chat was written into the repo.

All on Somnia Tokyo testnet (hideki), chain ID `50383`. Private key lives only in local `.env` (gitignored).

## Accounts

| Role | Address | State (verified via RPC) |
|---|---|---|
| Bot EOA (MetaMask, linked in app) | `0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F` | 5 STT gas (auto-sent by app at link time) |
| Trading wallet (OWNER_ADDRESS, linked in dreamDEX app) | `0xf9beA92fee8105aC59186dAced61910Fc1DE80f6` | 35.44 STT; USDso margin visible in app |
| Login burner EOA | `0xFeAf5C921996FC53f4DEf35e181E766e6D74690A` | 50 STT on Tokyo 50383. Perps equity 0. `placeable false`, `limitedBy collateral`. Not the funded trading wallet. |
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
