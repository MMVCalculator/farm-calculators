/**
 * Ticker stream - Websocket API for Bitkub
 */
export interface Ticker {
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
