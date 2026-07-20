import { CryptoSymbol, TickerInfo, OrderBook, HistoricalPricePoint } from "../types";

export abstract class BaseExchange {
  public abstract readonly name: string;

  /**
   * Fetch real-time ticker information.
   */
  public abstract getTicker(symbol: CryptoSymbol): Promise<TickerInfo>;

  /**
   * Fetch real-time order book.
   */
  public abstract getOrderBook(symbol: CryptoSymbol): Promise<OrderBook>;

  /**
   * Fetch historical price points (e.g. 24h candlesticks).
   */
  public abstract getHistoricalData(symbol: CryptoSymbol, limit?: number): Promise<HistoricalPricePoint[]>;

  /**
   * Generate realistic simulated values in case API calls fail or keys are missing.
   * This ensures the MVP works reliably under any network constraint.
   */
  protected getMockPrice(symbol: CryptoSymbol): number {
    const basePrices: Record<string, number> = {
      BTC: 65000,
      ETH: 3500,
      BNB: 580,
      SOL: 145,
      XRP: 0.55,
      ADA: 0.42,
      USDT: 1.0,
      USDC: 1.0,
      LINK: 15,
      AAVE: 95,
      UNI: 7.5,
    };
    return basePrices[symbol] || 10.0; // Default mock price
  }
}
