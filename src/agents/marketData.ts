import { cfg } from '../config.ts';
import { initSdk, requireMarket, type Markets } from '../sdk.ts';
import { getMarketRow, getLatestFundingUpdate, fundingAprFromRate } from '../indexer.ts';
import { MarketSnapshot, type MarketSnapshot as MS } from './schemas.ts';
import { privateKeyToAccount } from 'viem/accounts';
import { log } from '../logger.ts';
import 'dotenv/config';

export const markHistory: number[] = []; // one chain mark per tick, capped at EMA_SLOW_TICKS

type Indexer = {
  getMarketRow: typeof getMarketRow;
  getLatestFundingUpdate: typeof getLatestFundingUpdate;
};

export class MarketDataAgent {
  private markets: Markets;
  private indexer: Indexer;
  private marketRow: Awaited<ReturnType<typeof requireMarket>> | null = null;
  private lastHealthReadTs = 0;

  constructor(deps?: { markets?: Markets; indexer?: Indexer; marketRow?: Awaited<ReturnType<typeof requireMarket>> }) {
    this.markets = deps?.markets ?? initSdk();
    this.indexer = deps?.indexer ?? { getMarketRow, getLatestFundingUpdate };
    this.marketRow = deps?.marketRow ?? null;
  }

  async warmup() {
    if (!this.marketRow) this.marketRow = await requireMarket(this.markets, cfg.SYMBOL);
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
    const health = await this.markets.client.getPerpHealthSnapshot(row.poolAddress);
    this.lastHealthReadTs = Date.now();
    const priceable = health.priceable === true;
    const chainMark = priceable ? health.markPrice : 0n;
    try {
      const probe = await this.markets.client.getMaxPerpOrderSize({
        pool: row.poolAddress, marginBank: row.marginBank, account: acct as `0x${string}`, isBid: true,
        price: priceable && chainMark > 0n ? chainMark : 10n ** 18n,
      });
      log.info({ healthPriceable: priceable, maxSizePriceable: probe.priceable }, 'max-size priceable cross-check');
    } catch (e) {
      log.info({ err: String((e as Error).message ?? e).slice(0, 200) }, 'max-size priceable cross-check failed');
    }
    const base = row.baseSymbol;
    if (!base) throw new Error(`Perp market ${cfg.SYMBOL} has no baseSymbol`);
    const g = await this.indexer.getMarketRow(base);
    const indexerMark = BigInt(g?.markPrice || '0');
    const lag = chainMark > indexerMark ? chainMark - indexerMark : indexerMark - chainMark;
    if (chainMark > 0n) {
      markHistory.push(Number(chainMark));
      if (markHistory.length > cfg.EMA_SLOW_TICKS) markHistory.shift();
    }
    const tops = await this.markets.client.getBookTopsOnchain([{ id: row.id, poolAddress: row.poolAddress }]);
    const top = tops.tops[row.id.toLowerCase()];
    const f = g?.id ? await this.indexer.getLatestFundingUpdate(g.id).catch(() => null) : null;
    const rate = f?.fundingRate ?? g?.fundingRate ?? '0';
    return MarketSnapshot.parse({
      symbol: cfg.SYMBOL,
      markPrice: chainMark.toString(),
      indexPrice: String(g?.indexPrice ?? '0'),
      markAgeMs: Math.max(0, Date.now() - this.lastHealthReadTs),
      priceable,
      fundingRate: String(rate),
      fundingApr: String(fundingAprFromRate(String(rate))),
      bestBid: top?.bestBid ?? null,
      bestAsk: top?.bestAsk ?? null,
      indexerMarkPrice: indexerMark.toString(),
      indexerLagRaw: lag.toString(),
      tickSize: String(row.tickSize), lotSize: String(row.lotSize), minQuantity: String(row.minQuantity),
      baseDecimals: Number(row.baseDecimals), quoteDecimals: Number(row.quoteDecimals),
      ts: Date.now(),
    });
  }
}
