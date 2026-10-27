# bot-kit perp-core caret-pins markets-sdk ^0.31.0
Severity: normal
Area: SDK

## Steps to reproduce
1. Open somnia-chain/dreamdex-bot-kit packages/perp-core/package.json on main.
2. Read the @somnia-chain/markets-sdk dependency.
3. Compare with the version named by current perps docs (0.32.1).

## Expected
The reference perps package accepts the documented SDK line.

## Actual
On 2026-10-27, main pins "@somnia-chain/markets-sdk": "^0.31.0". For 0.x, a caret range allows only compatible patch updates, so ^0.31.0 means >=0.31.0 <0.32.0. npm will never install 0.32.1 into that package. This repo pins 0.32.1 exactly because the 0.32 constructor (wsRpcUrl, indexerUrl, placePerpOrder receipt) is what the live typings describe.

## Evidence
- https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/packages/perp-core/package.json
- Fetched 2026-10-27 from https://raw.githubusercontent.com/somnia-chain/dreamdex-bot-kit/main/packages/perp-core/package.json — dependencies["@somnia-chain/markets-sdk"] === "^0.31.0".
- Installed in this repo: @somnia-chain/markets-sdk@0.32.1.

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
