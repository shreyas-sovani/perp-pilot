# MaxPositionSizeExceeded error surface
Severity: major
Area: contracts

## Steps to reproduce
1. Read maxPositionSize on the funded owner.
2. eth_call placeOrderFor above that cap.
3. Keep the earlier allowance revert as its own leg.

## Expected
MaxPositionSizeExceeded 0x714b36d6 when size exceeds the per-account cap.

## Actual
Prior leg (kept): bot placePerpOrder reverted ERC20: insufficient allowance. That leg is an allowance UX gap, not the position cap. Owner over-cap: The contract function "placeOrderFor" reverted.

Error: InsufficientCollateral()
 
Contract Call:
  address:   0xd6cb1dd58580b84d76068ac21594219ce03aeddf
  function:  placeOrderFor(address owner, bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType,

## Evidence
- Prior leg (kept): bot placePerpOrder reverted ERC20: insufficient allowance. That leg is an allowance UX gap, not the position cap.
- owner maxPositionSize: 399561200000000000000
- limitedBy: collateral
- The contract function "placeOrderFor" reverted.

Error: InsufficientCollateral()
 
Contract Call:
  address:   0xd6cb1dd58580b84d76068ac21594219ce03aeddf
  function:  placeOrderFor(address owner, bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType,

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
