# Perp limit price 0 is a literal price
Severity: normal
Area: contracts

## Steps to reproduce
1. Submit ETH-PERP limit price 0 with minQuantity.
2. Record whether 0 is treated as a market order or a literal price.

## Expected
price 0 is a literal price and does not cross the book.

## Actual
@somnia-chain/markets-sdk: price and quantity must be > 0

## Evidence
- revert: no selector in message
- raw: @somnia-chain/markets-sdk: price and quantity must be > 0

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
