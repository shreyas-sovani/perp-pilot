# Stale mark sets priceable false after a socket drop
Severity: normal
Area: SDK

## Steps to reproduce
1. Read priceable.
2. Call markets.close() and wait 30s (no host firewall).
3. Open a new client and read priceable again.

## Expected
A dropped socket surfaces priceable:false until the feed recovers.

## Actual
SDK `close()` did not make the mark unpriceable. priceable stayed true after 31s. A process-local close is not a mark-oracle outage. No order was sent.

## Evidence
- before priceable: true
- after priceable: true
- transport drop was SDK close(), not a firewall rule

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
