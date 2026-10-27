# ETH-PERP order sized with 6 decimals reverts as InsufficientCollateral
Severity: major
Area: contracts

## Steps to reproduce
1. Size an intended 0.01 ETH as parseUnits("0.01", 6) instead of 18.
2. Submit a resting ETH-PERP bid at 2000 USDso.
3. Record the revert selector.

## Expected
A decimal-aware error, not a collateral failure.

## Actual
@somnia-chain/markets-sdk: placeOrder reverted: InvalidQuantity(10000, 100000000000000)

## Evidence
- revert: no selector in message
- raw: @somnia-chain/markets-sdk: placeOrder reverted: InvalidQuantity(10000, 100000000000000)

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
