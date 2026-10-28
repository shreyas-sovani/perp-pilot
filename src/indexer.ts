import { annualizedFundingRate } from '@somnia-chain/markets-sdk';
import { cfg } from './config.ts';

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(cfg.GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json() as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error('GraphQL error: ' + JSON.stringify(json.errors));
  if (!json.data) throw new Error('GraphQL empty response');
  return json.data;
}

// NOTE: filter column names below are Hasura-style and were chosen from introspected fields
// (Market has id/baseSymbol/…; FundingRateUpdate has market_id/timestamp/fundingRate).
// If a query errors with "column does not exist", capture the message — that is feedback
// finding material (probe P-09/P-13) — then adjust the column to the introspected name.
export async function getMarketRow(baseSymbol: string) {
  const d = await gql<{ Market: any[] }>(
    `query M($s: String!) { Market(where: {baseSymbol: {_ilike: $s}}, limit: 1) {
      id baseSymbol baseDecimals quoteDecimals tickSize lotSize minQuantity
      markPrice indexPrice lastPrice fundingRate fundingIntervalSec fundingWindowSec
      marginBank poolAddress marketAddress collateral clobStatus } }`,
    { s: baseSymbol },
  );
  return d.Market[0] ?? null;
}

export async function getLatestFundingUpdate(marketId: string) {
  const d = await gql<{ FundingRateUpdate: any[] }>(
    `query F($m: String!) { FundingRateUpdate(where: {market_id: {_eq: $m}}, order_by: {timestamp: desc}, limit: 1) {
      id timestamp fundingRate indexPrice markPrice fundingIntervalSec fundingWindowSec txHash } }`,
    { m: marketId },
  );
  return d.FundingRateUpdate[0] ?? null;
}

export async function getRecentFills(account: string, limit = 50) {
  const d = await gql<{ Fill: any[] }>(
    `query FF($a: String!, $l: Int!) { Fill(where: {taker: {_ilike: $a}}, order_by: {timestamp: desc}, limit: $l) {
      id market_id pool quantity quoteQuantity fillPrice takerIsBid takerSide txHash timestamp } }`,
    { a: account, l: limit },
  );
  return d.Fill;
}

export async function getFundingPayments(account: string, limit = 20) {
  const d = await gql<{ FundingPayment: any[] }>(
    `query FP($a: String!, $l: Int!) { FundingPayment(where: {account: {_ilike: $a}}, order_by: {timestamp: desc}, limit: $l) {
      id account amount pool txHash timestamp } }`,
    { a: account, l: limit },
  );
  return d.FundingPayment;
}

// Per-window rate is 1e18-scaled (FUNDING_PRECISION). APR is a fraction: 0.1095 = 10.95%.
export function fundingAprFromRate(rate: string | number, fundingWindowSec = 28800): number {
  const raw = BigInt(String(rate).split('.')[0] || '0');
  if (fundingWindowSec <= 0) return 0;
  return annualizedFundingRate(raw, fundingWindowSec);
}
