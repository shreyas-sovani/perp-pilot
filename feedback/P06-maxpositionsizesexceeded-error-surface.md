# MaxPositionSizeExceeded error surface
Severity: major
Area: contracts

## Steps to reproduce
1. Read maxPositionSize from getMaxPerpOrderSize when priceable.
2. Submit quantity above that cap.
3. Capture selector 0x714b36d6 if present.

## Expected
MaxPositionSizeExceeded 0x714b36d6 and a readable cap in the API.

## Actual
@somnia-chain/markets-sdk: placeOrder reverted: Error(ERC20: insufficient allowance)

## Evidence
- maxPositionSize: 399561200000000000000
- limitedBy: collateral
- revert: no selector in message
- raw: @somnia-chain/markets-sdk: placeOrder reverted: Error(ERC20: insufficient allowance)

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
