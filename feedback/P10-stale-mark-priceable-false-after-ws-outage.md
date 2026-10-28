# Stale mark sets priceable false after a socket drop
Severity: normal
Area: SDK

## Steps to reproduce
1. Keep the close() observation as a secondary leg.
2. Sample getPerpHealthSnapshot every 15s for 2 minutes. priceable:false means a stale mark, not a closed socket.

## Expected
priceable:false when the mark feed is stale, then recovery. A client close() is not that case.

## Actual
No priceable:false in 8 samples over 2 minutes starting 2026-10-28T20:55:47.320Z.

## Evidence
- Prior leg (kept): markets.close() left priceable true after 31s. close() is not a stale mark.
- 2026-10-28T20:55:48.000Z priceable=true
- 2026-10-28T20:56:03.130Z priceable=true
- 2026-10-28T20:56:18.336Z priceable=true
- 2026-10-28T20:56:33.495Z priceable=true
- 2026-10-28T20:56:48.625Z priceable=true
- 2026-10-28T20:57:03.761Z priceable=true
- 2026-10-28T20:57:18.895Z priceable=true
- 2026-10-28T20:57:34.027Z priceable=true

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
