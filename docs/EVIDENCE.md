# Evidence

Recorded 2026-10-27 on Somnia Tokyo testnet, chain ID `50383`. `DRY_RUN` in `.env` stayed `true` except for one-shot process env overrides.

## Voucher claim

| time (UTC) | action | result |
|---|---|---|
| 2026-10-27 | `claimPerpVoucher` for bot `0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F` | Not broadcast. `getPerpVoucherEligibility` said eligible for 1000 USDso. The SDK `eth_call` then reverted `claim()` with data `0x3e31dcc2` and `errorName` unset. That selector is not in the installed SDK error ABI. Distributor `0x2ACD9EFdA721450906bfE1bef3edE269636E42C4`. |

No explorer row. The node rejected the simulation before a transaction was sent.

## Why there are no live order hashes

| account | equity | `getMaxPerpOrderSize` on ETH-PERP |
|---|---|---|
| Bot signer `0x8AF6…275F` | 0 USDso | `maxQuantity 0`, `placeable false`, `limitedBy collateral`. `autoPull: true` → `limitedBy walletBalance`. |
| Owner `0xf9be…80f6` | 2000 USDso | `placeable true`, about 17.03 base. This key is not in `.env`. `placePerpOrder` has no on-behalf-of field. |

An on-tick minimum bid (`price` aligned to tick `1e16`, `qty` = `minQuantity`) was simulated and reverted `Error(ERC20: insufficient allowance)`. The SDK did not broadcast it.

`DRY_RUN=false npx tsx scripts/live-proof.ts` approved six 5 USDso IOC intents and `ExecutionAgent` rejected each one before a hash existed. Five failed `InvalidPrice` because the 0.3% limit was not on the tick (`10000000000000000`). One failed `rpc execute failed: The request took too long to respond`.

## Chain probes

Reports are in `feedback/P01` … `feedback/P11`. They carry the revert string or the read. They do not carry order transaction hashes, because those calls reverted in simulation.

Checked `0xFeAf5C921996FC53f4DEf35e181E766e6D74690A` on 2026-10-27: 50 STT on Tokyo, perps equity 0, `placeable false`, `limitedBy collateral`. It is not `OWNER_ADDRESS`. The funded signer is still missing.

## What would unblock five explorer rows

The private key for `0xf9beA92fee8105aC59186dAced61910Fc1DE80f6`, which already has 2000 USDso and is placeable. A claim that credits the bot signer would also work. The login burner above does not.
