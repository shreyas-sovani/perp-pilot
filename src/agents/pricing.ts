import { cfg } from '../config.ts';

export interface BookQuote {
  markPrice: string;
  bestBid: string | null;
  bestAsk: string | null;
}

function human(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw) / 1e18;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Human USDso limit. Buys price through the ask; sells price through the bid. */
export function bookLimitPrice(side: 'buy' | 'sell', quote: BookQuote, slippageBps = cfg.ENTRY_SLIPPAGE_BPS): string {
  const slip = slippageBps / 10_000;
  const mark = human(quote.markPrice) ?? 0;
  if (side === 'buy') {
    const ask = human(quote.bestAsk);
    return String((ask ?? mark) * (1 + slip));
  }
  const bid = human(quote.bestBid);
  return String((bid ?? mark) * (1 - slip));
}
