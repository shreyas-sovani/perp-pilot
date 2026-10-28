# Bot voucher claim eth_call reverts with unnamed selector 0x3e31dcc2
Severity: major
Area: SDK

## Steps to reproduce
1. Read getPerpVoucherEligibility for the bot signer.
2. eth_call voucherDistributor.claim(). Do not broadcast.

## Expected
Eligibility and the claim simulation agree, and any revert is a named SDK error.

## Actual
eligible=true grant=1000000000000000000000. eth_call: Execution reverted for an unknown reason.

Raw Call Arguments:
  from:  0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
  to:    0x2ACD9EFdA721450906bfE1bef3edE269636E42C4
  data:  0x4e71d92d

Details: execution reverted
Version: viem@2.57.12. Selector named in contractErrorsAbi: false.

## Evidence
- eligible: true
- grantAmount: 1000000000000000000000
- reason: none
- eth_call: Execution reverted for an unknown reason.

Raw Call Arguments:
  from:  0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
  to:    0x2ACD9EFdA721450906bfE1bef3edE269636E42C4
  data:  0x4e71d92d

Details: execution reverted
Version: viem@2.57.12
- broadcast: none

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
