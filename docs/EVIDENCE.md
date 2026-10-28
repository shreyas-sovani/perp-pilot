# Evidence

Recorded 2026-10-27 on Somnia Tokyo testnet, chain ID `50383`. `DRY_RUN` in `.env` stayed `true` except for one-shot process env overrides.

## Voucher claim

| time (UTC) | action | result |
|---|---|---|
| 2026-10-27 | `claimPerpVoucher` for bot `0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F` | Not broadcast. `getPerpVoucherEligibility` said eligible for 1000 USDso. The SDK `eth_call` then reverted `claim()` with data `0x3e31dcc2` and `errorName` unset. That selector is not in the installed SDK error ABI. Distributor `0x2ACD9EFdA721450906bfE1bef3edE269636E42C4`. |

No explorer row. The node rejected the simulation before a transaction was sent.

## Live ETH-PERP orders

Sent with the bot key via `placeOrderFor` for owner `0xf9beA92fee8105aC59186dAced61910Fc1DE80f6`. Notional 20 USDso, IOC, tick-aligned. Net position after the set was 0. `.env` `DRY_RUN` stayed `true`. The process override was `DRY_RUN=false`.

| # | time (UTC) | action | notional USDso | tx hash | explorer | outcome |
|---|---|---|---|---|---|---|
| 1 | 2026-10-27T18:25:42Z | buy | 20 | `0x2767f1944a055a814c0592a05278bf3f1407cadb20a8feb736c869e948dd2714` | https://explorer.testnet.somnia.network/tokyo/tx/0x2767f1944a055a814c0592a05278bf3f1407cadb20a8feb736c869e948dd2714 | CONFIRMED |
| 2 | 2026-10-27T18:26:27Z | sell | 20 | `0xea603c88bdc2f0a065ce41bb2371632ca5502b5afbf9682dfb95db68c1747178` | https://explorer.testnet.somnia.network/tokyo/tx/0xea603c88bdc2f0a065ce41bb2371632ca5502b5afbf9682dfb95db68c1747178 | CONFIRMED |
| 3 | 2026-10-27T18:26:29Z | buy | 20 | `0xd702d14c908af523adaac39ab5183c7e78a467dd35e86d824fbf6dc7d3b07776` | https://explorer.testnet.somnia.network/tokyo/tx/0xd702d14c908af523adaac39ab5183c7e78a467dd35e86d824fbf6dc7d3b07776 | CONFIRMED |
| 4 | 2026-10-27T18:26:32Z | sell | 20 | `0x32ce5e4b6e9a69049e0570edd2bd58c0743822d398ab021a7852af857605c116` | https://explorer.testnet.somnia.network/tokyo/tx/0x32ce5e4b6e9a69049e0570edd2bd58c0743822d398ab021a7852af857605c116 | CONFIRMED |
| 5 | 2026-10-27T18:26:34Z | buy | 20 | `0x8550113c3304b6a61ae9095b66b494a2cbe7c0a6bc5685c2ab61d21d3f009b40` | https://explorer.testnet.somnia.network/tokyo/tx/0x8550113c3304b6a61ae9095b66b494a2cbe7c0a6bc5685c2ab61d21d3f009b40 | CONFIRMED |
| 6 | 2026-10-27T18:26:36Z | sell | 20 | `0x233742d73551568bb2df26471c86264cea2789da9659e1bcdf07eb15ecd70ad1` | https://explorer.testnet.somnia.network/tokyo/tx/0x233742d73551568bb2df26471c86264cea2789da9659e1bcdf07eb15ecd70ad1 | CONFIRMED |

`getPerpPosition` for the owner on ETH-PERP was size 0 after the last sell. A follow-up `cancelOrderFor` on those ids reverted `IncorrectSender`, which matches an order that already filled and is no longer resting.

## Why the first attempts had no hash

The SDK `trader.placePerpOrder` signs for the bot's own empty account. The documented path is `placeOrderFor(owner, …)` from [perp-core operator.ts](https://github.com/somnia-chain/dreamdex-bot-kit/blob/main/packages/perp-core/src/operator.ts). The bot was already authorized for place, cancel, and reduce on the ETH-PERP pool. The owner private key is not required and was not used.

## Chain probes

Reached means the probe hit the case the docs describe. Prior legs stay in the report.

| Probe | Reached | What the run showed |
| --- | --- | --- |
| P-01 | partial | 6-decimal qty is `InvalidQuantity`, not `InsufficientCollateral`. Over-margin `placeOrderFor` reverted. |
| P-02 | yes | Price 0 is rejected before send. |
| P-03 | yes | IOC under the touch reverts `ImmediateOrCancelNoFill()`. |
| P-04 | yes | Off-tick price reverts `InvalidPrice`. |
| P-05 | partial | Owner max is non-zero (`limitedBy collateral`). A min-qty bid was accepted. The full ramp to max was not sent. |
| P-06 | partial | Owner over-cap `placeOrderFor` reverted. Selector `0x714b36d6` was not named in the message. Prior allowance revert kept. |
| P-07 | partial | SDK row has a stop registry. The call never broadcast: trader wants a configured operator registry. Tokyo is absent from the addresses page. |
| P-08 | no | Owner and bot both `limitedBy collateral`. `voucherBlocked` stays masked. |
| P-09 | yes | Indexer mark lagged the chain mark by about 2.46 USDso for 5 minutes. |
| P-10 | no | No `priceable:false` in 8 samples over 2 minutes. `close()` is not that case. |
| P-11 | yes | Real order id `10311729937203650058363`. First `cancelOrderFor` succeeded. Second reverted `IncorrectSender` with expected `0x000…0`. |
| P-12 | yes | Tokyo / hideki / Shannon naming gap. |
| P-13 | yes | HTTP API is spot-only. |
| P-14 | yes | bot-kit pins `^0.31.0`. |
| P-15 | yes | Bot eligibility true, grant 1000. `claim()` eth_call reverted unnamed. No broadcast. |
| P-16 | yes | Funding page omits the 1e18 integer scale. SDK `annualizedFundingRate` returns 0.1095 on the live `1e14` rate. |

Checked `0xFeAf5C921996FC53f4DEf35e181E766e6D74690A` on 2026-10-27: 50 STT on Tokyo, perps equity 0, `placeable false`, `limitedBy collateral`. It is not `OWNER_ADDRESS`. The funded signer is still missing.

## What would unblock five explorer rows

Done. Six CONFIRMED ETH-PERP hashes are in the table above. The login burner `0xFeAf…690A` was not used.
