# Indexer markPrice lag versus the chain mark
Severity: major
Area: API

## Steps to reproduce
1. Every 2s for 5 minutes, read GraphQL Market.markPrice and getPerpHealthSnapshot().markPrice.
2. Report max absolute lag and direction inversions.

## Expected
Indexer mark tracks the chain mark within one funding tick.

## Actual
max abs lag raw 2455775720782000000 (about 2.46 USDso if the value is 18-decimal quote). Inversions counted by the probe: 62. The indexer mark stayed `2348293119345175500000` for the whole 5-minute sample while the chain mark moved.

## Evidence
- t=0s chain=2347751263704788000000 index=2348293119345175500000
- t=60s chain=2348236519822838500000 index=2348293119345175500000
- t=120s chain=2347506818716252000000 index=2348293119345175500000
- t=180s chain=2347457151616274500000 index=2348293119345175500000
- t=240s chain=2346851864664210000000 index=2348293119345175500000

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
