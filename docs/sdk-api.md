# @somnia-chain/markets-sdk@0.32.1 — extracted 2026-10-27T09:56:44Z

## Chain exports (@somnia-chain/markets-sdk/chains)
node_modules/@somnia-chain/markets-sdk/dist/account.d.ts:31: *    chains: [l1, hideki],
node_modules/@somnia-chain/markets-sdk/dist/account.d.ts:39: *        [hideki.chain.id]: l2Engine.createExecutor({
node_modules/@somnia-chain/markets-sdk/dist/addresses.d.ts:21: *  Hideki testnet (chainId 50383, env `hideki-testnet-development`) protocol addresses, baked in

## SomniaMarkets class + constructor
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:35:export declare class SomniaMarketsError extends Error {
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-36-    constructor(message: string, options?: ErrorOptions);
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-37-}
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-38-/**
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-39- * @internal Classify the finite SDK vocabulary without inspecting arbitrary values.
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-40- * Invariant's genuine class is supplied privately to avoid an errors/raise runtime cycle.
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-41- */
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-42-export declare function sdkFailure(caught: unknown, Invariant: typeof import("./raise.js").InvariantError): import("./config.js").SomniaMarketsSocketFailure | undefined;
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-43-/**
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-44- * Internal error discrimination for owned mapping seams. A thrown value can be
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-45- * a Proxy whose prototype lookup fails; that failure must not replace the value
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-46- * being normalized or prevent rejection-time provenance from being recorded.
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-47- */
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-48-export declare function isErrorInstance<T extends SomniaMarketsError>(value: unknown, errorClass: abstract new (...args: never[]) => T): value is T;
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-49-/**
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-50- *  The call itself was wrong — a bad argument, an unknown symbol, or a method
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-51- *  used against the wrong kind of market. Thrown *before* any network round-trip.
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-52- *
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-53- *  **Details**
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-54- *
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-55- *  This says the *caller* is at fault, in contrast to {@link NotConfiguredError}
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-56- *  (the client is missing a config value) and {@link ContractRevertError} (the
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-57- *  call was well-formed but the chain rejected it).
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-58- *
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-59- *  **Gotchas**
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts-60- *

## Perp-related methods (listPerp|PerpVoucher|PerpOrder|PerpSystem|Rejections|position|Position|cancel|Cancel|amend|Amend|order|Order)
node_modules/@somnia-chain/markets-sdk/dist/account.d.ts:10: *  (`fetchBalance`, `fetchPositions`, …) use `address` on every chain; a write
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:38:     *  `Fill` and a `MarketStatusUpdate` in the same block and log position share
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:312:     *  cancellation record and `Order` carries only `placedTxHash`, so nothing in
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:313:     *  it is keyed by a cancel's own hash — the anchor turns that read from a
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:393: *  the row's CURRENT value, so an order placed in this block and cancelled three
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:394: *  blocks later reads `Cancelled` here — a state from this block's future. See
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:398: *  - `REMOVED` — it is not, so this block cancelled or amended it.
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:434:     *  Null for an owner cancel and for an order that was never cancelled — so a
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:437:    cancelReason: string | null;
node_modules/@somnia-chain/markets-sdk/dist/activity.d.ts:618: *  Newest first, breaking a shared timestamp on block then log position.
node_modules/@somnia-chain/markets-sdk/dist/balances.d.ts:4: *  collateral; outcome positions live on the ERC-6909 singleton — read those
node_modules/@somnia-chain/markets-sdk/dist/balances.d.ts:33: *  position (`balanceOf(account, id)`) on the outcome-token singleton `token`.
node_modules/@somnia-chain/markets-sdk/dist/balances.d.ts:40:    /** ERC-6909 position id (`yesId`/`noId`). Absent → read `token` as a plain ERC-20. */
node_modules/@somnia-chain/markets-sdk/dist/balances.d.ts:45: *  reads a portfolio's ERC-20 collateral and ERC-6909 outcome positions in one
node_modules/@somnia-chain/markets-sdk/dist/balances.d.ts:47: *  {@link BinaryPortfolio.getOutcomeBalance} (with `id`); results are returned positionally,
node_modules/@somnia-chain/markets-sdk/dist/chainRef.d.ts:23: *  An order named together with its chain and pool. `cancelOrder` accepts one
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:89: *  Each socket retains at most 64 cancellations, including cleanup in flight.
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:94: *  is already closed or closure cancels its pending release. Transport
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:98: *  response arrives during the probe. Closing the owner cancels pending work.
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:203: *  change an account name it in topic 1 (`PositionUpdated`, `Deposited`, `Withdrawn`,
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:205: *  `PositionTransferred` names the receiver in topic 2, and `AutoDeleveraged` the
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:206: *  bankrupt account in topic 3. A filter matches one topic position, so each position
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:240: *  holder's position or equity. First those about the market's own pool, by the topic
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:248:    readonly poolInTopic2: readonly ["PositionUpdated(address,address,int128,uint128,int256,int256)", "AutoDeleveraged(address,address,address,int128,uint256)", "FundingSettled(address,address,int256)"];
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:249:    readonly poolInTopic3: readonly ["PositionTransferred(address,address,address,int128,uint256)", "ForcedSettled(address,address,address,int128,uint256,bool,bool)"];
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:260: *  {@link ADL_QUEUE_EVENTS}: `PositionUpdated` (every fill, close and liquidation of a
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:261: *  position), `AutoDeleveraged` and `FundingSettled` with the pool in topic 2;
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:262: *  `PositionTransferred` (a liquidation takeover) and `ForcedSettled` (a wind-down)
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:267: *  liquidation's payment to the bidders that take its positions). `onLog` carries only the log's
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:274: *  - Order placement and cancellation (`CollateralLocked`, `CollateralUnlocked`) are
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:285:/** One `logs` subscription filter: the contracts, and the topics position by position. */
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:288:    /** Position by position: one topic, a list any of which matches, or `null` for any. */
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:299:    /** Its position in the block; `null` for a pending log. */
node_modules/@somnia-chain/markets-sdk/dist/client.d.ts:341:    /** The topic filter, position by position. `null` matches any value. */
node_modules/@somnia-chain/markets-sdk/dist/config.d.ts:178:     *  on every price write. `client.accountPositions.subscribe` has the node push the
node_modules/@somnia-chain/markets-sdk/dist/config.d.ts:476:     *  Cancels this client's in-flight indexer reads and receipt confirmations — pass one
node_modules/@somnia-chain/markets-sdk/dist/config.d.ts:485:     *  checks keep working — a cancellation is not an indexer failure.
node_modules/@somnia-chain/markets-sdk/dist/config.d.ts:491:     *  Local and wallet writes canceled before broadcast rethrow your reason.
node_modules/@somnia-chain/markets-sdk/dist/config.d.ts:494:     *  client's account views (`accountOrders`, `accountPositions` and
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:124:    readonly name: "AmendOldOrderGone";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:131:    readonly name: "AmendReplacementRejected";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:497:    readonly name: "ExpiredOrderMustBeCancelled";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:596:    readonly name: "ImmediateOrCancelNoFill";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:770:    readonly name: "InsuranceFundCandidateHasPositions";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:1352:    readonly name: "MaxPositionSizeExceeded";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:1454:    readonly name: "NoOpenPosition";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:1462:    readonly name: "NoPositionToFlatten";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:1474:    readonly name: "NoReducingPositionAtCreation";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:1781:    readonly name: "PerpPoolHasActivePositions";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:1862:    readonly name: "PositionBelowMinQuantity";
node_modules/@somnia-chain/markets-sdk/dist/contractErrorsAbi.d.ts:2204:    readonly name: "SelfMatchCancelTaker";
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:88: *  One outcome's half of a binary position, RAW units — the YES or NO book on
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:92: *  **Why this exists.** Every money field on {@link BinaryPositionPnL} is
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:96: *  position row can show that zero as its own PnL.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:98: *  Legs are only reachable through a position row, so the key that names one
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:108:export interface BinaryOutcomePositionPnL {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:118:     *  It is rounded independently of {@link BinaryOutcomePositionPnL.costBasis}, and
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:126:     *  So value a position with `costBasis`, and show `avgCost`. Deriving either from
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:153: *  An account's position + cost basis + PnL in one binary market, RAW units.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:165:export interface BinaryPositionPnL {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:180:     *  {@link BinaryOutcomePositionPnL.markPrice}.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:185:     *  to mark against — see {@link BinaryOutcomePositionPnL.markPrice}.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:194:     *  The same position split into its YES and NO books — see
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:195:     *  {@link BinaryOutcomePositionPnL} for why every field above is unusable to a
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:203:        yes: BinaryOutcomePositionPnL;
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:204:        no: BinaryOutcomePositionPnL;
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:208: *  One position-affecting event for the PnL fold, in the account's perspective,
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:237: *  ignored (they settle the position at payout, they don't change cost basis of a
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:254: *  and ordering on it would let a wrong one override the position it disagrees with.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:265: *  {@link BinaryPositionPnL}, avg-cost basis, RAW units. `oneCollateral =
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:290:export declare function computePositionPnL(events: PnLEvent[], balances: {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:296:}): BinaryPositionPnL;
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:314:/** Errors raised by {@link computePositionPnL}. */
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:315:export type ComputePositionPnLError = InvalidInputError;
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:317: *  One redeemable outcome position in a settled market — shaped to feed
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:322:export interface ClaimablePosition {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:343: * A settled binary position to evaluate for claimability.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:352:    /** 0 = YES, 1 = NO — which outcome this position holds. */
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:354:    /** Held outcome-token balance (raw). Non-positive positions are dropped. */
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:367:     *  from `BinaryMarket.payoutNumerators`. Supply these on a voided position so
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:381: *  Compute the estimated payout for one settled position (raw collateral).
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:405: *  Shape one settled portfolio position into a {@link ClaimableInput}.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:408: *  per-market fee read) stays in the client, and this maps one position plus its
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:425:export declare function claimableInputFor(position: {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:440: *  Filter and shape settled positions into {@link ClaimablePosition}s. A
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:441: *  position is claimable when the market is voided or when it holds the winning
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:443: *  positions are omitted.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:453:export declare function claimableFrom(inputs: ClaimableInput[]): ClaimablePosition[];
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:521: * The sell sides of {@link BinarySide} — what unwinds a position.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:590: *  A market SELL that unwinds an outcome position, shaped to feed straight into
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:611:     *  (raw, ≤ `quantity`). The IOC cancels the rest unfilled — when this is
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:613:     *  implying the whole position exits.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:635: *  caller's position, lot-aligned. The quote walks the crossable bids and
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:637: *  partial unwind up front rather than a silent IOC cancel.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:639: *  Returns `null` when there's nothing to sell (including a position below
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:646: * - `side`: "SELL_YES" (Up position) or "SELL_NO" (Down position).
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:657: *  when the book is empty. For an ODDS display; positions should mark with
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:677: *  Average entry price for a YES/NO position, in the outcome's OWN terms (raw),
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:683: *  mints don't appear in fills; positions built by mint+sell carry a
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:684: *  fills-only basis here, same as {@link computePositionPnL} without router
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:709: * An outcome position marked to a live price — one portfolio row's numbers.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:713:export interface OutcomePositionMark {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:714:    /** Current position value in collateral (raw): `balance × mark`. */
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:722: *  Mark an outcome position: `value = balance × mark`, `upnl = balance ×
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:729:export declare function markOutcomePosition(input: {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:737:}): OutcomePositionMark;
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:739: *  How a position should be marked, given its market's lifecycle:
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:743: *  - `"voided"` — cancelled; collateral refunds, zero PnL.
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:748:export type PositionMarkState = "live" | "won" | "lost" | "voided" | "settling";
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:750: *  Classify how a position marks from its market's status/resolution: a
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:757:export declare function positionMarkState(input: {
node_modules/@somnia-chain/markets-sdk/dist/derivedReads.d.ts:768:}): PositionMarkState;
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:108: * The serving indexer does not serve perp position changes: it predates the
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:109: * `PerpPositionChange` table. Reindex it with a compatible producer before
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:110: * pairing fills with their position updates. Until then, show a fill's own side.
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:114:export declare class PerpPositionChangesUnavailableError extends SomniaMarketsError {
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:227:     *  `getOrderHistoryPage`, `fetchMyTrades`, `fetchPositions`,
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:270: * A complete claimable read exceeded its bounded position page. Use
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:271: * `client.getClaimablePage` and follow its raw-position `nextOffset` instead.
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:370:     *  `getOrderHistoryPage`, `fetchMyTrades`, `fetchPositions`,
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:466: *  `"MarketNotSettled"`, `"ExpiredOrderMustBeCancelled"`) and `args` its
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:468: *  whether to cancel-then-retry, top up collateral, or give up.
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:489: *    if (e instanceof ContractRevertError && e.errorName === "ExpiredOrderMustBeCancelled") {
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:490: *      await trader.cancelExpiredOrders({ pool, orderIds: [orderId] });
node_modules/@somnia-chain/markets-sdk/dist/errors.d.ts:500:    /** Decoded arguments of the custom error, positionally, when `errorName` is set. */
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:55:    readonly name: "OrderCancelled";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:115:    readonly name: "OrderCancelledSelfMatch";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:124:    readonly name: "MakerOrderCancelledExceedsPosition";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:133:    readonly name: "OrderCancelledPreFill";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:225:    readonly name: "MakerOrderCancelledNegativeEquity";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:234:    readonly name: "MakerOrderCancelledStaleMark";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:249:    readonly name: "PositionUpdated";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:473:    readonly name: "PositionTransferred";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:590: *  `BadDebtAbsorbed`, `PositionTransferred`) land on `marginBankEventsAbi` above.
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:593: *  Account-level events carry NO pool: `AccountLiquidated` covers every position the
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:595: *  Only the per-position events are pool-scoped, which is why a per-pool liquidation
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:615:        readonly name: "positionsProcessed";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:634:    readonly name: "PositionLiquidated";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:655:    readonly name: "PositionSkippedBelowMinQuantity";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:672:    readonly name: "PositionTakenOver";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1324: *  liquidation and funding-settlement plane is handled, the per-account position and
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1377:    readonly name: "OrderCancelled";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1437:    readonly name: "OrderCancelledSelfMatch";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1446:    readonly name: "MakerOrderCancelledExceedsPosition";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1455:    readonly name: "OrderCancelledPreFill";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1464:    readonly name: "OrderAmendedInPlace";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1559:    readonly name: "MakerOrderCancelledNegativeEquity";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1568:    readonly name: "MakerOrderCancelledStaleMark";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1577:    readonly name: "PositionUpdated";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1801:    readonly name: "PositionTransferred";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1900:        readonly name: "positionsProcessed";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1919:    readonly name: "PositionLiquidated";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1940:    readonly name: "PositionSkippedBelowMinQuantity";
node_modules/@somnia-chain/markets-sdk/dist/eventsAbi.d.ts:1957:    readonly name: "PositionTakenOver";
node_modules/@somnia-chain/markets-sdk/dist/fillHistory.d.ts:15:type Position = Pick<OrderFillRow, "timestamp" | "blockNumber" | "logIndex">;
node_modules/@somnia-chain/markets-sdk/dist/fillHistory.d.ts:17: * Order two fill positions: negative when `a` is older, positive when `a` is
node_modules/@somnia-chain/markets-sdk/dist/fillHistory.d.ts:18: * newer, zero at the same position. Block numbers can exceed 2^53, so they are
node_modules/@somnia-chain/markets-sdk/dist/fillHistory.d.ts:21:export declare function comparePosition(a: Position, b: Position): number;
node_modules/@somnia-chain/markets-sdk/dist/fillHistory.d.ts:23: * A row the history can hold: canonical position scalars, a timestamp that is
node_modules/@somnia-chain/markets-sdk/dist/fillHistory.d.ts:26:export declare function isPositioned(row: FillRow): row is OrderFillRow;
node_modules/@somnia-chain/markets-sdk/dist/fillHistory.d.ts:32: * repeated or without a usable position; and a history that says older fills
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:3:type Position = {
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:30:    position: Position;
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:42:export declare const paginate: <R extends Position>(fetched: readonly R[], limit: number, binding: string, operation: string) => {
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:50:export declare const encode: (position: Position, binding: string, operation: string, generation?: string) => string;
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:51:export declare const validatePosition: (position: Position, operation: string) => void;
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:52:export declare const before: ({ timestamp, blockNumber, logIndex }: Position) => {
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:115: * The predicate continuing an ASCENDING block-position page after `position`.
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:117: * Only the block position appears: `(blockNumber, logIndex)` is already a total
node_modules/@somnia-chain/markets-sdk/dist/fillPagination.d.ts:122:export declare const after: ({ blockNumber, logIndex }: Position) => {
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:129:     *  {@link OrderFillRow} so the block position the order and the cursor rest on
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:156:    /** Existing fill rows, newest first by numeric timestamp, block and log position. */
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:174:     *  that are out of order, repeated or without a usable position.
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:204:    /** Cancels this call. The rejection is the signal's own reason. */
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:238:     *  position, not by second.
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:356: *  @param config - Owner-injected endpoint, chain and cancellation.
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:358: *  @throws {@link IndexerError} The read did not complete, or returned unusable block positions.
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:430:    /** Source log position. SDK reads populate it; caller-built rows may omit it. */
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:515: *  A fill with its position in the chain — {@link FillRow} plus the block and
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:588:    /** Reconciled lifecycle status (Open/Filled/Cancelled/Expired/Closed). */
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:593:     *  WHY the PROTOCOL cancelled the order, when it was not the owner. Null for an
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:594:     *  owner cancel and for an order that was never cancelled — so a `Cancelled`
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:597:    cancelReason: string | null;
node_modules/@somnia-chain/markets-sdk/dist/fills.d.ts:618:    /** The fill, with its block position and post-fill remainders. */
node_modules/@somnia-chain/markets-sdk/dist/graphqlBoundary.d.ts:6: *  identity or cancellation reason.
node_modules/@somnia-chain/markets-sdk/dist/graphqlBoundary.d.ts:18:/** Wait for a timer while preserving a caller's cancellation reason. */
node_modules/@somnia-chain/markets-sdk/dist/graphqlBoundary.d.ts:29: * - `options`: `headers` merged into the request; `timeoutMs` bounds it; `signal` cancels it (combined with `timeoutMs` — whichever fires first wins); `label` overrides the operation name in error messages (use it when the endpoint is not the main indexer, e.g. `"price-feed getCandles"`).
node_modules/@somnia-chain/markets-sdk/dist/graphqlBoundary.d.ts:38: * - Throws The caller's own abort reason, re-thrown UNWRAPPED when `signal` is what ended the request — a cancellation is not an indexer failure, and code that checks `err.name === "AbortError"` (or compares against its own `controller.signal.reason`) must still see it. A `timeoutMs` expiry is a failure and stays an {@link IndexerError}.
node_modules/@somnia-chain/markets-sdk/dist/hooks.d.ts:72:/** A component-visible watch acquisition failure. Cancellation from a superseded effect is ignored. */
node_modules/@somnia-chain/markets-sdk/dist/hooks.d.ts:300:     *  caller cancelled the wait by unmounting or by changing the pool. It is
node_modules/@somnia-chain/markets-sdk/dist/hooks.d.ts:310: * either way. Client reads take no per-request signal (cancellation is
node_modules/@somnia-chain/markets-sdk/dist/hooks.d.ts:486: *  never treats a failed watermark read as coverage. A caller-cancelled wait leaves
node_modules/@somnia-chain/markets-sdk/dist/hooks.d.ts:649: *  A SomniaLend account's health factor + positions (chain read). Re-runs when
node_modules/@somnia-chain/markets-sdk/dist/index.d.ts:1:export { SomniaMarketsError, InvalidInputError, FillHistoryRestartRequiredError, FillHistoryUnavailableError, PerpPositionChangesUnavailableError, NotConfiguredError, NotSupportedError, SignerRequiredError, IndexerError, IncompleteHistoryError, IncompletePortfolioError, IndexerUnavailableError, AccountsIndexerUnavailableError, AccountFeedRestartRequiredError, AccountViewError, IndexerWaitTimeoutError, RpcError, TransactionOutcomeUnknownError, ContractRevertError, CollateralOnWrongChainError, BridgeLiquidityError, BridgeDeliveryTimeoutError, type CollateralReadError, type IndexerRefusalReason, type AccountViewErrorReason, } from "./errors.js";
node_modules/@somnia-chain/markets-sdk/dist/index.d.ts:3:export { type SomniaMarketsClient, type SomniaMarketsClientGetPerpLinkedWalletRegistryError, type SomniaMarketsClientGetPerpMainFundingError, type SomniaMarketsClientGetPerpMaxLinkedChildrenError, type SomniaMarketsClientGetPerpWalletLinkageError, type SomniaMarketsClientGetPerpWalletPullCapacityError, type SomniaMarketsClientListPerpLinkedChildrenError, type SomniaMarketsClientQuotePerpFundingPayerError, type SomniaMarketsClientGetAccountHealthError, type SomniaMarketsClientGetEffectiveImfBpsError, type SomniaMarketsClientGetLiquidationPriceError, type SomniaMarketsClientGetMarginAccountError, type SomniaMarketsClientGetMaxPerpOrderSizeError, type SomniaMarketsClientGetPerpHealthSnapshotError, type SomniaMarketsClientGetPerpLeverageError, type SomniaMarketsClientGetPerpLeverageImSurchargeError, type SomniaMarketsClientGetPerpPositionAnalyticsError, type SomniaMarketsClientGetPerpRiskParamsError, type SomniaMarketsClientGetPerpSideHoldersError, type SomniaMarketsClientListPerpPositionAnalyticsError, type SomniaMarketsClientMeetsPerpImForFillError, type SomniaMarketsClientPreviewPerpClosePnlError, type SomniaMarketsClientPreviewPerpLiquidationPriceError, type SomniaMarketsClientPreviewPerpOrderMarginError, type SomniaMarketsClientQuoteMeetsPerpImForOrderError, type SomniaMarketsClientQuotePerpOrderTopUpError, type SomniaMarketsClientGetInsuranceFundStateError, type SomniaMarketsClientGetLiquidationEngineConfigError, type SomniaMarketsClientGetPerpCollateralBasisError, type SomniaMarketsClientGetPerpSystemConfigError, type SomniaMarketsClientTryGetPerpAccountEquityError, type SomniaMarketsClientGetPerpStateError, type SomniaMarketsClientGetPerpFundingPremiumError, type SomniaMarketsClientGetPerpPositionError, type SomniaMarketsClientGetManualVaultModeError, type SomniaMarketsClientGetErc20BalanceError, type SomniaMarketsClientGetErc20AllowanceError, type SomniaMarketsClientGetBuilderApprovalError, type SomniaMarketsClientGetEffectiveBuilderApprovalError, type SomniaMarketsClientGetMaxBuilderFeeBpsTimes1kError, type SomniaMarketsClientGetSchedulingCostError, type SomniaMarketsClientEarmarkedOfError, type SomniaMarketsClientCreditOfError, type SomniaMarketsClientOutstandingOfError, type SomniaMarketsClientWithdrawableOfError, type SomniaMarketsClientPayerCreditOfError, type SomniaMarketsClientPayerOfError, type SomniaMarketsClientResolveReserveError, type SomniaMarketsClientGetNativeBalanceError, type SomniaMarketsClientGetVaultBalanceError, type SomniaMarketsClientGetOutcomeBalanceError, type SomniaMarketsClientGetOnchainResolutionPriceError, type SomniaMarketsClientGetHeadBlockError, type SomniaMarketsClientGetClosingPriceError, type SomniaMarketsClientGetContractMetaError, type SomniaMarketsClientGetBankruptcyPriceError, type SomniaMarketsClientGetPerpMaxLeverageError, type SomniaMarketsClientTryGetPerpLeverageImSurchargeError, type SomniaMarketsClientGetBookTopsOnchainError, type SomniaMarketsClientGetOwnOpenOrdersOnchainError, type SomniaMarketsClientGetOpenOrdersOnchainError, type SomniaMarketsClientGetAllOpenOrdersOnchainError, type SomniaMarketsClientStopLiveError, type SomniaMarketsClientQuoteBinaryStakeError, type SomniaMarketsClientQuoteBinarySellError, type SomniaMarketsClientGetBinaryPositionPnLError, type SomniaMarketsClientWithObservations, type SomniaMarketsClientGetOpenPositionsWithPnLError, type SomniaMarketsClientGetClaimableError, type SomniaMarketsClientGetClaimablePageError, type SomniaMarketsClientGetPortfolioError, type SomniaMarketsClientCreateExecutorError, type SomniaMarketsClientCreateTraderError, type SomniaMarketsClientWatchPerpMarketsError, type SomniaMarketsClientGetUserFillsPageError, type SomniaMarketsClientGetUserFillHistoryError, type SomniaMarketsClientWaitForIndexedBlockError, type SomniaMarketsClientGetOpenOrdersError, type SomniaMarketsClientGetOrdersError, type SomniaMarketsClientCountOrdersError, type SomniaMarketsClientGetFillsError, type SomniaMarketsClientGetOrderFillsError, type SomniaMarketsClientGetUserFillsError, type SomniaMarketsClientGetFillsPageError, type SomniaMarketsClientGetLatestFillBlockError, type SomniaMarketsClientCountUserFillsError, type SomniaMarketsClientGetPerpStopOrderError, type SomniaMarketsClientGetPerpStopOrdersError, type SomniaMarketsClientGetMarginEventsError, type SomniaMarketsClientListLiquidationsError, type SomniaMarketsClientListPerpPositionChangesError, type SomniaMarketsClientListPerpPositionChangesForFillsError, type SomniaMarketsClientGetLiquidationsError, type SomniaMarketsClientListVaultPayoutFallbacksError, type SomniaMarketsClientGetCandlesError, type SomniaMarketsClientGetPerpFeedStatusError, type SomniaMarketsClientGetAccountEquityError, type SomniaMarketsClientListAccountEquitiesError, type SomniaMarketsClientGetPerpVoucherCampaignError, type SomniaMarketsClientGetPerpVoucherEligibilityError, type SomniaMarketsClientGetPerpVoucherError, type SomniaMarketsClientListRegistryMarketsCheckedError, type SomniaMarketsClientListPoolBindingsError, type SomniaMarketsClientListSeriesLatestMarketsError, type SomniaMarketsClientGetBinaryOrderBookError, type SomniaMarketsClientWatchPriceError, type SomniaMarketsClientWatchPricesError, type SomniaMarketsClientGetSpotOrderBookError, type SomniaMarketsClientGetOrderOnchainError, } from "./somniaMarketsClient.js";
node_modules/@somnia-chain/markets-sdk/dist/index.d.ts:7:export { TIMEFRAMES, type UnifiedBalance, type UnifiedBalances, type UnifiedChainBalance, type UnifiedFundingRate, type UnifiedMarket, type UnifiedMarketType, type UnifiedOHLCV, type UnifiedOrder, type UnifiedOrderBook, type UnifiedOrderStatus, type UnifiedPosition, type UnifiedPrice, type UnifiedStopOrder, type UnifiedStopOrderStatus, type UnifiedTicker, type UnifiedTrade, } from "./unified/structs.js";
node_modules/@somnia-chain/markets-sdk/dist/index.d.ts:40:export { quoteBinaryOrderOverBook, quoteBinaryStakeOverBook, quoteBinarySellOverBook, slippageForCrossing, DEFAULT_SLIPPAGE_BPS, DEFAULT_SLIPPAGE_MIN_TICKS, marketStats24hFromCandles, pnlEventsFor, computePositionPnL, claimableFrom, estPayoutFor, type BinaryOrderQuote, type BinaryStakeQuote, type BinarySellQuote, type BinaryBuySide, type BinarySellSide, type BinaryCrossingParams, type MarketStats24h, type BinaryPositionPnL, type BinaryOutcomePositionPnL, type PnLEvent, type ClaimablePosition, type ClaimableInput, type PnlEventsForError, type ComputePositionPnLError, type EstPayoutForError, type ClaimableFromError, midYesPrice, averageEntryPrice, outcomeMarkPrice, markOutcomePosition, positionMarkState, type EntryTrade, type OutcomePositionMark, type PositionMarkState, } from "./derivedReads.js";
node_modules/@somnia-chain/markets-sdk/dist/index.d.ts:41:export { type Trader, type TraderConfig, type TxResult, type OrderFill, type PlaceOrderResult, type PlaceStopOrderResult, type PlacePerpStopOrderResult, type PlaceOrderParams, type CancelOrderParams, type ReduceOrderParams, type CancelExpiredOrdersParams, type SweepExpiredAtLevelParams, type CaptureCloseParams, type ApproveBuilderParams, type WithdrawVaultParams, ORDER_TYPE, type PlaceSpotOrderParams, type TraderBuildPlaceSpotOrderError, type SpotOrderRequest, type PlaceSpotOrdersParams, type PlaceSpotOrdersResult, type BatchPlaceOutcome, type CancelOrdersParams, type CancelOrdersResult, type BatchCancelOutcome, type CancelAllOrdersOptions, type CancelAllOrdersResult, type CancelAllOrdersEmpty, type CancelAllOrdersSent, type TraderCancelAllOrdersError, type TraderBuildCancelOrdersError, type ReduceOrderRequest, type ReduceOrdersParams, type TraderBuildReduceOrdersError, type TraderSignRedeemAuthError, type PlacePerpOrderParams, SELF_MATCHING_OPTION, type BatchOrderRequest, type AmendOrderParams, type AmendOrderResult, type AmendOrdersParams, type AmendOrdersResult, type DepositMarginParams, type WithdrawMarginParams, type SetPerpLeverageParams, type PerpWalletLinkTarget, type ProposePerpWalletLinkParams, type AcceptPerpWalletLinkParams, type CancelPerpWalletLinkProposalParams, type UnlinkPerpWalletParams, type RepayPerpMainFundingParams, type RecallPerpMainFundingParams, type ClaimPerpVoucherParams, type TraderClaimPerpVoucherError, type TraderBuildClaimPerpVoucherError, type PlaceSpotStopOrderParams, type CancelStopOrderParams, type PerpStopIntent, type PerpStopOrderLeg, type PlacePerpStopOrderParams, type LinkPerpStopOrdersParams, type CancelPerpStopOrdersParams, type ClaimPerpStopSomiParams, type MintSetParams, type BurnSetParams, type RedeemParams, type RedeemAuthorization, type SignRedeemAuthParams, type RedeemForParams, type RedeemDirectParams, type RedeemManyParams, type SyncSettlementParams, type ClaimOwedParams, type FinalizeMarketParams, type ReleasePoolParams, type PokeOracleParams, type VoidExpiredParams, type DepositVaultParams, type DepositVaultNativeParams, type SetManualVaultModeParams, type SetOperatorApprovalForPoolParams, type SetOperatorApprovalGlobalParams, type SettlementRecord, type MintSetNativeParams, type MintSetPermit2Params, type RedeemNativeParams, type Permit2TransferFrom, type RouterMintBase, type FaucetParams, type ResolveParams, type VoidMarketParams, } from "./trade.js";
node_modules/@somnia-chain/markets-sdk/dist/index.d.ts:67:export { type LendAddresses, type LendReserve, type LendPosition, type LendAccount } from "./lend/types.js";
node_modules/@somnia-chain/markets-sdk/dist/index.d.ts:75:export { type OutcomeBalances, type Portfolio, type PortfolioMarket, type PortfolioPosition, type PortfolioOrder, type PortfolioTrade, type PortfolioOptions, type ClaimablePage, type GetClaimablePageOptions, type OpenPositionPnL, type VaultPayoutFallback, type ListVaultPayoutFallbacksOptions, type GetVaultBalanceParams, type GetOutcomeBalanceParams, } from "./binary/portfolio.js";

## Extraction note
The TASK-2.4 command greps only `dist/*.d.ts` (not recursive) and `head` cuts the perp section at 200 lines. `class SomniaMarkets` in that output is `SomniaMarketsError`, not the client. Symbols below were confirmed by reading the installed `.d.ts` directly. Live check 2026-10-27: `requireMarket('ETH-PERP')` returned `ETH 18` tick `10000000000000000`.

## Constructor (real)
`constructor(config: SomniaMarketsConfig)` in `dist/unified/exchange.d.ts`.
`SomniaMarketsConfig = (ClientConfig | SomniaMarketsChainsConfig) & SomniaMarketsSignerConfig`.
`ClientConfig` (`dist/config.d.ts`): `chain: Chain`, `wsRpcUrl?: string`, `indexerUrl?: string`.
`SomniaMarketsSignerConfig`: `privateKey?`, `account?`, `walletClient?`.
`hidekiTestnet` is exported from `@somnia-chain/markets-sdk/chains` (`dist/chains/index.d.ts`, definition `dist/chains/definitions/hidekiTestnet.d.ts`). Chain id `50383`. Default websocket `wss://api.hideki2.infra.testnet.somnia.network/ws`. The chain object sets no block explorer.

## Confirmed symbols
All of these exist in 0.32.1:
- `SomniaMarkets`
- `hidekiTestnet`
- `client.listPerpMarkets(opts?): Promise<PerpMarket[]>` (`dist/somniaMarketsClient.d.ts`)
- `client.getMaxPerpOrderSize({ pool, marginBank, account, isBid, price, autoPull?, builderFeeBpsTimes1k? }): Promise<PerpMaxOrderSize>`
- `trader.placePerpOrder({ pool, isBid, price, quantity, expireTimestampNs?, orderType?, selfMatchingOption?, builder?, builderFeeBpsTimes1k?, gas? }): Promise<PlaceOrderResult>`
- `client.getPerpVoucherEligibility(marginBank, account): Promise<PerpVoucherEligibility>`
- `trader.claimPerpVoucher({ marginBank }): Promise<TxResult>`
- `client.getPerpSystemConfig(marginBank): Promise<PerpSystemConfig>`
- `client.listPerpOrderRejections(opts?):` see `dist/perp/history.d.ts`
- `ORDER_TYPE` (`dist/trade.d.ts`): `LIMIT=0`, `FILL_OR_KILL=1`, `MARKET=2` (IOC), `POST_ONLY=3`

`PerpMarket` fields used by this repo: `baseSymbol`, `baseDecimals`, `quoteDecimals` (via `BaseMarket`), `tickSize`, `lotSize`, `minQuantity`, `poolAddress`, `marginBank`.

## Available position/cancel methods
- `SomniaMarkets.fetchPositions(refs?: MarketHandle[]): Promise<UnifiedPosition[]>`
- `SomniaMarkets.cancelOrder(id: string | ChainOrderRef, ref?: MarketHandle)`
- `Trader.cancelOrder({ pool, orderId, gas? }): Promise<TxResult>`
- `Trader.cancelOrders(params): Promise<CancelOrdersResult>`
- `Trader.cancelAllOrders(pool, opts?): Promise<CancelAllOrdersResult>`
- `Trader.reduceOrder({ pool, orderId, newQuantityRemaining, gas? })` — comment says spot and binary; confirm before using on perps
- `Trader.placePerpStopOrder({ registry, pool, intent?, pair?, ...leg }): Promise<PlacePerpStopOrderResult>`
- `Trader.cancelPerpStopOrder(params): Promise<TxResult>`
- `Trader.cancelPerpStopOrders(params): Promise<TxResult>`
- `PerpMarket.stopRegistry: Address | null` — null means no on-chain stop registry on that pool

## Deviations from docs
- Backlog draft passed `rpcUrl`. Installed `ClientConfig` field is `wsRpcUrl`. `src/sdk.ts` passes `wsRpcUrl: cfg.RPC_URL_WS`. `hidekiTestnet` already embeds that same websocket, so the override matches the chain default.
- `listPerpMarkets` is an indexer read. Omitting `indexerUrl` throws `NotConfiguredError`. `src/sdk.ts` passes `indexerUrl: cfg.GRAPHQL_URL`.
- `placePerpOrder` has no `tif` argument. GTC is the default expiry (~50y) with `orderType` omitted or `ORDER_TYPE.LIMIT` (0). IOC is `ORDER_TYPE.MARKET` (2). FOK is `ORDER_TYPE.FILL_OR_KILL` (1). Post-only is `ORDER_TYPE.POST_ONLY` (3). The perp comment on `orderType` only mentions 0 and 2; the shared `ORDER_TYPE` object still defines 1 and 3.
- Shallow `dist/*.d.ts` grep did not list `hidekiTestnet`, `listPerpMarkets`, `getMaxPerpOrderSize`, `placePerpOrder`, `getPerpVoucherEligibility`, `claimPerpVoucher`, `getPerpSystemConfig`, or `listPerpOrderRejections`. They are present in subpaths / past the `head -200` cut. Not absent from the package.
- `tsconfig.json` gained `allowImportingTsExtensions` and `noEmit`. Without them, `tsc` rejects the backlog's `.ts` import specifiers (`TS5097`).
- `placePerpOrder` returns `PlaceOrderResult` (`hash`, `receipt`, optional `orderId`, `fills`). There is no `client.waitForTransaction`. `src/agents/execution.ts` reads the receipt off the result. `orderType` maps `GTC→ORDER_TYPE.LIMIT`, `IOC→MARKET` (2), `FOK→FILL_OR_KILL`, `ALO→POST_ONLY`. Gas passed as `GAS_LIMIT`.
- Orders table columns `symbol` and `side` are `NOT NULL`. The draft INSERT omitted them. `record()` writes them plus `txHash` / `rejectReason` on the first insert.

## Indexer deviations
Live GraphQL `2026-10-27` against `https://hideki-dev.smk.somnia.host/v1/graphql`. The TASK-3.1 queries ran without a column error.

- `getMarketRow('ETH')` returned `baseSymbol=ETH`, `markPrice=2308975887405703000000` (raw 18-decimal quote per whole base, about 2308.98), `fundingRate=100000000000000`.
- `getLatestFundingUpdate` returned `timestamp=1793092758`, `fundingRate=100000000000000`.
- `fundingAprFromRate` is specified as `Number(rate) * 3 * 365`. On that raw integer it prints `10950000000000000000.00`, not a percent. The helper was left unchanged. If the raw rate is 1e18-scaled, `1e14/1e18 = 0.0001` and `0.0001 * 3 * 365 = 0.1095` (10.95% APR). That scale is a hypothesis, not confirmed against an SDK type. Signals must not treat the raw helper output as a human APR until the scale is verified.
