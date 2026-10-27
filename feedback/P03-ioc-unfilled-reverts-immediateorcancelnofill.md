# Unfilled IOC reverts ImmediateOrCancelNoFill
Severity: major
Area: contracts

## Steps to reproduce
1. Place an IOC bid 5% below the live mark.
2. SDK 0.32.1 has no batch placePerpOrders. Record the single-order revert.

## Expected
ImmediateOrCancelNoFill selector 0xd48c4403.

## Actual
@somnia-chain/markets-sdk: placeOrder reverted: ImmediateOrCancelNoFill()

## Evidence
- revert: no selector in message
- raw: @somnia-chain/markets-sdk: placeOrder reverted: ImmediateOrCancelNoFill()
- batch: no placePerpOrders on Trader in @somnia-chain/markets-sdk@0.32.1

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
