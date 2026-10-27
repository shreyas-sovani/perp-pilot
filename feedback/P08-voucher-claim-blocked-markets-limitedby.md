# Voucher-blocked market reports limitedBy voucherBlocked
Severity: normal
Area: SDK

## Steps to reproduce
1. Read getMaxPerpOrderSize on ZEC-PERP for the bot account.
2. If limitedBy is voucherBlocked, attempt one order and record the revert.

## Expected
limitedBy "voucherBlocked" for a voucher account on ZEC-PERP.

## Actual
limitedBy collateral

## Evidence
- limitedBy: collateral maxQuantity: 0 placeable: false

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
