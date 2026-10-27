# getMaxPerpOrderSize versus the order that actually succeeds
Severity: normal
Area: API

## Steps to reproduce
1. Read getMaxPerpOrderSize at an on-tick mark.
2. Ramp live size only when placeable is true.

## Expected
maxQuantity equals the largest order that succeeds.

## Actual
maxQuantity 0 placeable false limitedBy collateral. No ramp: nothing is placeable on this account.

## Evidence
- maxQuantity 0 limitedBy collateral placeable false

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
