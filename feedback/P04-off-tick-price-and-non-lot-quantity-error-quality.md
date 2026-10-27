# Off-tick price and non-lot quantity error quality
Severity: normal
Area: contracts

## Steps to reproduce
1. Price = tickSize + 1 wei.
2. Quantity = lotSize + 1 wei.
3. Capture the revert text.

## Expected
A constraint error that names tick or lot.

## Actual
@somnia-chain/markets-sdk: placeOrder reverted: InvalidPrice(10000000000000001, 10000000000000000)

## Evidence
- revert: no selector in message
- raw: @somnia-chain/markets-sdk: placeOrder reverted: InvalidPrice(10000000000000001, 10000000000000000)

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
