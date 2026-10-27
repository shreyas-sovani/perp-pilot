import { cfg } from '../config.ts';
import { initSdk, requireMarket, type Markets } from '../sdk.ts';
import { getMarketRow, getLatestFundingUpdate, fundingAprFromRate } from '../indexer.ts';
import { MarketSnapshot, type MarketSnapshot as MS } from './schemas.ts';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

export const markHistory: number[] = []; // one mark per tick, capped at EMA_SLOW_TICKS

export class MarketDataAgent {
  private markets: Markets;
  private marketRow: Awaited<ReturnType<typeof requireMarket>> | null = null;
  private lastMarkTs = 0;
  private lastMark = 0n;

  constructor() { this.markets = initSdk(); }

  async warmup() {
    this.marketRow = await requireMarket(this.markets, cfg.SYMBOL);
    return this.marketRow;
  }

  accountAddress(): string {
    if (cfg.OWNER_ADDRESS) return cfg.OWNER_ADDRESS as `0x${string}`;
    return privateKeyToAccount(cfg.BOT_PRIVATE_KEY as `0x${string}`).address;
  }

  async snapshot(): Promise<MS> {
    if (!this.marketRow) await this.warmup();
    const row = this.marketRow!;
    const acct = this.accountAddress();
    // Read live mark via getMaxPerpOrderSize's priceable flag (docs: priceable=false => stale mark)
    const probe = await (this.markets as any).client.getMaxPerpOrderSize({
      pool: row.poolAddress, marginBank: row.marginBank, account: acct, isBid: true,
      price: 10n ** 18n, // arbitrary on-tick-ish price; only priceable/maxQuantity matter here
    });
    const base = row.baseSymbol;
    if (!base) throw new Error(`Perp market ${cfg.SYMBOL} has no baseSymbol`);
    const g = await getMarketRow(base);
    const markStr = g?.markPrice ?? '0';
    const mark = BigInt(markStr || '0');
    if (mark > 0n) { this.lastMark = mark; this.lastMarkTs = Date.now(); markHistory.push(Number(markStr)); if (markHistory.length > cfg.EMA_SLOW_TICKS) markHistory.shift(); }
    const f = g?.id ? await getLatestFundingUpdate(g.id).catch(() => null) : null;
    const rate = f?.fundingRate ?? g?.fundingRate ?? '0';
    const snap = MarketSnapshot.parse({
      symbol: cfg.SYMBOL,
      markPrice: markStr, indexPrice: String(g?.indexPrice ?? '0'),
      markAgeMs: Date.now() - this.lastMarkTs, priceable: Boolean(probe?.priceable),
      fundingRate: String(rate), fundingApr: String(fundingAprFromRate(rate)),
      bestBid: null, bestAsk: null, // book reads optional; snapshot does not require them
      tickSize: String(row.tickSize), lotSize: String(row.lotSize), minQuantity: String(row.minQuantity),
      baseDecimals: Number(row.baseDecimals), quoteDecimals: Number(row.quoteDecimals),
      ts: Date.now(),
    });
    return snap;
  }
}
