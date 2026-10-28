# getMaxPerpOrderSize versus the order that actually succeeds
Severity: normal
Area: API

## Steps to reproduce
1. Read getMaxPerpOrderSize for OWNER_ADDRESS.
2. Place one min-quantity resting bid and compare it to the quoted max. Do not ramp to the full max.

## Expected
Quoted maxQuantity matches the largest order the account can rest.

## Actual
Prior leg (bot signer, kept): maxQuantity 0 placeable false limitedBy collateral. Owner read: max 16979300000000000000 limitedBy collateral. accepted minQuantity 4000000000000000 vs quoted max 16979300000000000000 tx 0x2b5358724bc52fc9ec5f737ab49acffd1896f1bf1bab75d0d5522b526fcb880b

## Evidence
- Prior leg (bot signer, kept): maxQuantity 0 placeable false limitedBy collateral.
- owner maxQuantity 16979300000000000000 limitedBy collateral placeable true
- https://explorer.testnet.somnia.network/tokyo/tx/0x2b5358724bc52fc9ec5f737ab49acffd1896f1bf1bab75d0d5522b526fcb880b

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
