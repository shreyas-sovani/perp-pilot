# Cancel idempotency for a double cancel and a filled order
Severity: normal
Area: contracts

## Steps to reproduce
1. Cancel orderId 1 twice on ETH-PERP.
2. A filled-order cancel is recorded when TASK-9 has a real fill id.

## Expected
Second cancel is idempotent or returns a stable error.

## Actual
first cancel: @somnia-chain/markets-sdk: cancelOrder reverted: IncorrectSender(0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F, 0x0000000000000000000000000000000000000000) | second cancel: @somnia-chain/markets-sdk: cancelOrder reverted: IncorrectSender(0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F, 0x0000000000000000000000000000000000000000)

## Evidence
- No resting order id was supplied. Double-cancel needs an order placed in TASK-9.
- first cancel: @somnia-chain/markets-sdk: cancelOrder reverted: IncorrectSender(0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F, 0x0000000000000000000000000000000000000000)
- second cancel: @somnia-chain/markets-sdk: cancelOrder reverted: IncorrectSender(0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F, 0x0000000000000000000000000000000000000000)

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
