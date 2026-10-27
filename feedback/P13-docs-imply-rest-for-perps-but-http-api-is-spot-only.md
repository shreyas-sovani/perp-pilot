# Docs route integrators to REST, which does not serve perps
Severity: major
Area: docs

## Steps to reproduce
1. Start at the developer overview, which offers contracts, REST, and WebSocket.
2. Follow Quick Start, which includes a REST flow.
3. Open the perps developer page.
4. Compare with the HTTP API environment table.

## Expected
The perps quick path names SDK plus GraphQL, and does not send the reader to the spot HTTP API.

## Actual
The developer overview and quick start present REST as a first-class integration. The HTTP API table has no Tokyo/50383 host. Perps on this repo are SDK plus the hideki GraphQL indexer only. A new integrator who copies the REST quick start has no perps endpoints to call.

## Evidence
- https://app.dreamdex.io/docs/developers — integration choices include REST.
- https://app.dreamdex.io/docs/welcome/quick-start — first order via CLI, REST, or contracts.
- https://app.dreamdex.io/docs/developers/perps-testnet — perps developer surface.
- https://app.dreamdex.io/docs/developers/http-api — environments are chain 5031 and Shannon 50312 only.
- Local indexer used for perps reads: https://hideki-dev.smk.somnia.host/v1/graphql . No perps REST client exists in this repo.

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
