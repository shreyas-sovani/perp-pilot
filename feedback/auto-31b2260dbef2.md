# Auto tick: tick.error
Severity: normal
Area: app

## Steps to reproduce
1. Run the agent
2. Observe bus kind tick.error

## Expected
The agent continues without this rejection or error.

## Actual
tick.error

## Evidence
- ts=1793295818926
- payload={"err":"@somnia-chain/markets-sdk: rpc multicall failed: The request took too long to respond."}

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: <bot wallet address>
