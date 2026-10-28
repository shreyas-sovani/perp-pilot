# Voucher-blocked market reports limitedBy voucherBlocked
Severity: normal
Area: SDK

## Steps to reproduce
1. Read getMaxPerpOrderSize on ZEC-PERP for the bot account.
2. If limitedBy is voucherBlocked, attempt one order and record the revert.

## Expected
limitedBy voucherBlocked once the account has voucher credit. Until then collateral masks it.

## Actual
Bot limitedBy collateral. Owner limitedBy collateral. voucherBlocked is masked while the account is unfunded or the claim reverts.

## Evidence
- bot signer limitedBy collateral max 0
- owner limitedBy collateral max 773500000
- Precedence: collateral on an unfunded account masks voucherBlocked. The bot claim that would add voucher credit reverts 0x3e31dcc2 (P-15), so the documented voucherBlocked case stays unreachable here.

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
