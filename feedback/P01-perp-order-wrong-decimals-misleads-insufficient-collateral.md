# ETH-PERP order sized with 6 decimals reverts as InsufficientCollateral
Severity: major
Area: contracts

## Steps to reproduce
1. Leg A, already observed: size 0.01 ETH as 6 decimals and record the revert.
2. Leg B: 18-decimal tick/lot-aligned quantity of 50 ETH via owner placeOrderFor. eth_call only.

## Expected
Docs say a decimal bug reverts InsufficientCollateral() 0x3a23d825. Leg A did not. Leg B records the owner-path revert for an over-margin size.

## Actual
Leg A (kept, 2026-10-27, no rebroadcast): 6-decimal qty parseUnits("0.01", 6) reverted InvalidQuantity(10000, 100000000000000), not InsufficientCollateral(). Leg B reached the over-margin case: The contract function "placeOrderFor" reverted.

Error: InsufficientCollateral()
 
Contract Call:
  address:   0xd6cb1dd58580b84d76068ac21594219ce03aeddf
  function:  placeOrderFor(address owner, bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestamp

## Evidence
- Leg A (kept, 2026-10-27, no rebroadcast): 6-decimal qty parseUnits("0.01", 6) reverted InvalidQuantity(10000, 100000000000000), not InsufficientCollateral().
- leg B account: 0xf9beA92fee8105aC59186dAced61910Fc1DE80f6
- leg B price 2355790000000000000000 qty 50000000000000000000
- leg B revert: The contract function "placeOrderFor" reverted.

Error: InsufficientCollateral()
 
Contract Call:
  address:   0xd6cb1dd58580b84d76068ac21594219ce03aeddf
  function:  placeOrderFor(address owner, bool isBid, uint64 userData, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k)
  args:                   (

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
