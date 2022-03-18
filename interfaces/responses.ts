/**
 * Bitkub ticker stream - Websocket API for Bitkub
 */
export interface IBitkubTicker {
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
 * Latest fiat rates base from USD
 */
export interface ILatestRates {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: { [fiat: string]: number };
}

/**
 * Price history of USD/LUMI
 */
export interface IUsdLumiCurrentPrice {
  s: string;
  t: string[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: null[];
}

/**
 * Token ranking
 */
export interface ITokenRanking {
  token: string;
  symbol: string;
  decimal: number;
  type: TokenType;
  logoUri: string;
  price: number;
  first: number;
  last: number;
  changePercent: number;
}

export enum TokenType {
  Official = "Official",
  Registered = "Registered",
  Verified = "Verified",
}
