# Tokyo, hidekiTestnet, and Shannon are documented as different networks
Severity: major
Area: docs

## Steps to reproduce
1. Open the bounty brief: it names Somnia Tokyo testnet.
2. Import hidekiTestnet from @somnia-chain/markets-sdk/chains and read its id.
3. Open the Tokyo explorer path /tokyo.
4. Open the dreamDEX HTTP API environment table and the Somnia faucet.

## Expected
One network name, one chain id, and a faucet that pays that chain.

## Actual
The same chain is Tokyo in the bounty and explorer path, hidekiTestnet (id 50383, display name "Hideki Testnet") in the SDK, and absent from the HTTP API table, which lists only Shannon 50312 and mainnet 5031. The public faucet at testnet.somnia.network pays Shannon 50312 only. A developer who follows Somnia network docs never finds chain 50383.

## Evidence
- SDK: hidekiTestnet.id = 50383, name "Hideki Testnet", default websocket wss://api.hideki2.infra.testnet.somnia.network/ws. The chain object sets no block explorer. Source: node_modules/@somnia-chain/markets-sdk/dist/chains/definitions/hidekiTestnet.d.ts (package 0.32.1).
- Explorer path used by this repo: https://explorer.testnet.somnia.network/tokyo
- dreamDEX HTTP API environments (docs index verified 2026-10-20): mainnet chain 5031 https://api.dreamdex.io/v0 ; Shannon testnet chain 50312 https://stg.api.dreamdex.io/v0 . No 50383 row. https://app.dreamdex.io/docs/developers/http-api
- Faucet: https://testnet.somnia.network/ serves Shannon 50312 only. Confirmed while funding this bot on 2026-10-27. No public faucet for 50383. Gas arrived from the dreamDEX app bot-link top-up.

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
