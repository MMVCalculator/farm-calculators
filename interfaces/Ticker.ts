/**
 * Bitkub ticker stream - Websocket API for Bitkub
 */
export interface BitkubTicker {
  stream: string;
  id: number;
  last: number;
  lowestAsk: number;
  lowestAskSize: number;
  highestBid: number;
  highestBidSize: number;
  change: number;
  percentChange: number;
  baseVolume: number;
  quoteVolume: number;
  isFrozen: number;
  high24hr: number;
  low24hr: number;
  open: number;
  close: number;
}

/**
 * CoinEx ticker stream - Websocket API for CoinEx
 */
export interface CoinExTicker {
  method: string;
  params: Param[];
  id: number;
}

export interface Param {
  [x: string]: Market;
}

export interface Market {
  last: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  sell_total: number;
  buy_total: number;
  period: number;
  deal: number;
}
