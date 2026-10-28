# GraphQL fundingRate integer scale is not stated on the funding page
Severity: normal
Area: docs

## Steps to reproduce
1. Open https://app.dreamdex.io/docs/trading/perps-testnet/funding (fetched 2026-10-29).
2. Read the worked example: 0.08% is written as the fraction 0.0008 in `size × index × rate / 8`.
3. Read a live ETH `Market.fundingRate` from the Tokyo indexer. The value is `100000000000000`.
4. Read `FUNDING_PRECISION` and `annualizedFundingRate` in `@somnia-chain/markets-sdk@0.32.1` `dist/funding.d.ts`.

## Expected
The trading page states the integer scale of the rate a client actually receives, so `100000000000000` can be turned into `0.0001` per 8h window without a second source.

## Actual
The page only shows decimal fractions. It does not say the stored rate is a 1e18 fixed-point fraction. The installed SDK does: `FUNDING_PRECISION = 1000000000000000000n`, and `annualizedFundingRate(100000000000000n, 28800)` returns `0.1095`. `getPerpSystemConfig` has no scale field. `getFundingPayments` for the funded owner returned 0 rows on 2026-10-29, so the payment identity could not be solved from settlements. The live ETH row also returned `fundingWindowSec = 28800` and `fundingIntervalSec = 3600`.

## Evidence
- Docs page fetched 2026-10-29: hourly payment = size × index × rate / 8, example rate 0.0008.
- Indexer `Market` ETH: `fundingRate=100000000000000`, `fundingWindowSec=28800`, `fundingIntervalSec=3600`.
- SDK `dist/funding.d.ts`: `FUNDING_PRECISION` and `annualizedFundingRate`.
- `getFundingPayments(OWNER_ADDRESS, { limit: 5 })` length 0.

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0xf9beA92fee8105aC59186dAced61910Fc1DE80f6
