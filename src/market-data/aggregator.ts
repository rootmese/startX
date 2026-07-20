import { CryptoSymbol, TickerInfo, OrderBook, OrderBookEntry } from "../types";
import { BinanceExchange } from "../exchanges/binance";
import { CoinbaseExchange } from "../exchanges/coinbase";
import { KrakenExchange } from "../exchanges/kraken";
import { OkxExchange } from "../exchanges/okx";
import { HuobiExchange } from "../exchanges/huobi";

export interface AggregatedPrice {
  symbol: CryptoSymbol;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  spreadPercent: number;
  sources: { exchange: string; price: number; bid: number; ask: number; volume: number }[];
  timestamp: number;
}

export class MarketDataAggregator {
  private exchanges = [
    new BinanceExchange(),
    new CoinbaseExchange(),
    new KrakenExchange(),
    new OkxExchange(),
    new HuobiExchange()
  ];

  public async getAggregatedPrice(symbol: CryptoSymbol): Promise<AggregatedPrice> {
    const promises = this.exchanges.map(ex =>
      ex.getTicker(symbol).catch(err => {
        console.error(`Error fetching ticker from ${ex.name}:`, err);
        return null;
      })
    );

    const tickers = (await Promise.all(promises)).filter((t): t is TickerInfo => t !== null);

    if (tickers.length === 0) {
      throw new Error(`Failed to fetch price for ${symbol} from all exchanges.`);
    }

    const prices = tickers.map(t => t.price);
    const sum = prices.reduce((acc, p) => acc + p, 0);
    const averagePrice = sum / tickers.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const spreadPercent = ((maxPrice - minPrice) / averagePrice) * 100;

    return {
      symbol,
      averagePrice,
      minPrice,
      maxPrice,
      spreadPercent,
      sources: tickers.map(t => ({
        exchange: t.exchange,
        price: t.price,
        bid: t.bid,
        ask: t.ask,
        volume: t.volume
      })),
      timestamp: Date.now()
    };
  }

  public async getConsolidatedOrderBook(symbol: CryptoSymbol): Promise<OrderBook> {
    const promises = this.exchanges.map(ex =>
      ex.getOrderBook(symbol).catch(() => null)
    );

    const books = (await Promise.all(promises)).filter((b): b is OrderBook => b !== null);

    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    books.forEach(b => {
      bids.push(...b.bids);
      asks.push(...b.asks);
    });

    // Sort bids descending, asks ascending
    const consolidatedBids = bids.sort((a, b) => b.price - a.price).slice(0, 10);
    const consolidatedAsks = asks.sort((a, b) => a.price - b.price).slice(0, 10);

    return {
      symbol,
      bids: consolidatedBids,
      asks: consolidatedAsks,
      timestamp: Date.now(),
      exchange: "Consolidated (All Sources)"
    };
  }
}
