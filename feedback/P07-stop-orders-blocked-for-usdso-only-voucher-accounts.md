# Stop orders blocked for USDso-only voucher accounts
Severity: major
Area: contracts

## Steps to reproduce
1. Call placePerpStopOrder on ETH-PERP from the bot signer.

## Expected
Revert for a USDso-only account.

## Actual
@somnia-chain/markets-sdk: a perp stop order — needs operatorRegistry or addresses.operatorPermissionsRegistry

## Evidence
- stopRegistry: 0x44bfa5b28684e8d2156d15b85902da18f02b3a34
- docs: USDso-only voucher accounts cannot place stops (0.15 STT each). https://app.dreamdex.io/docs/trading/perps-testnet/orders
- revert: @somnia-chain/markets-sdk: a perp stop order — needs operatorRegistry or addresses.operatorPermissionsRegistry

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
