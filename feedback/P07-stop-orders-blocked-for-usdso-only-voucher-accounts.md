# Stop orders blocked for USDso-only voucher accounts
Severity: major
Area: contracts

## Steps to reproduce
1. Read PerpMarket.stopRegistry for ETH-PERP.
2. Compare it with OperatorPermissionsRegistry on the live contract-addresses page.
3. Call placePerpStopOrder only when the row has a registry. This call threw before broadcast.

## Expected
A stop registry on the allowlisted market, or a documented absence. The operator-permissions registry is a different contract.

## Actual
ETH-PERP stopRegistry from the SDK row is 0x44bfa5b28684e8d2156d15b85902da18f02b3a34. placePerpStopOrder did not broadcast: it requires operatorRegistry or addresses.operatorPermissionsRegistry. The contract-addresses page fetched 2026-10-29 lists mainnet 5031 and Shannon 50312 only. It does not list Tokyo 50383 and does not contain 0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3A.

## Evidence
- ETH-PERP stopRegistry from the SDK market row: 0x44bfa5b28684e8d2156d15b85902da18f02b3a34
- Contract-addresses page fetched 2026-10-29 lists mainnet chain 5031 and Shannon testnet chain 50312. It does not list Tokyo chain 50383 and does not contain 0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3A. That chat address is not cited as a stop registry.
- Shannon OperatorPermissionsRegistry on that page: 0x15C7e8CE38F021c5b45d098AaD788f63090bF20A. Mainnet OperatorPermissionsRegistry: 0xE7a190736B6024a4DbafadC04E283075877005ce. Neither is PerpMarket.stopRegistry.
- revert: @somnia-chain/markets-sdk: a perp stop order — needs operatorRegistry or addresses.operatorPermissionsRegistry

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
