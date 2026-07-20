import axios from "axios";
import { BaseExchange } from "./base";
import { CryptoSymbol, TickerInfo, OrderBook, HistoricalPricePoint } from "../types";

export class KrakenExchange extends BaseExchange {
  public readonly name = "Kraken";

  public async getTicker(symbol: CryptoSymbol): Promise<TickerInfo> {
    const pair = symbol === "USDT" ? "USDTUSD" : `${symbol}USD`;
    try {
      const response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${pair}`, {
        timeout: 3000
      });
      // Kraken returns dynamic keys like XXBTZUSD, so we pick the first key in response.result
      const result = response.data.result;
      const key = Object.keys(result)[0];
      const data = result[key];
      
      const price = parseFloat(data.c[0]);
      const bid = parseFloat(data.b[0]);
      const ask = parseFloat(data.a[0]);
      const volume = parseFloat(data.v[1]);

      return {
        symbol,
        price,
        bid,
        ask,
        volume,
        timestamp: Date.now(),
        exchange: this.name
      };
    } catch (error) {
      const mockPrice = this.getMockPrice(symbol) * (1 + (Math.random() - 0.5) * 0.003);
      return {
        symbol,
        price: mockPrice,
        bid: mockPrice * 0.998,
        ask: mockPrice * 1.002,
        volume: 80000,
        timestamp: Date.now(),
        exchange: `${this.name} (Simulated)`
      };
    }
  }

  public async getOrderBook(symbol: CryptoSymbol): Promise<OrderBook> {
    const pair = symbol === "USDT" ? "USDTUSD" : `${symbol}USD`;
    try {
      const response = await axios.get(`https://api.kraken.com/0/public/Depth?pair=${pair}&count=5`, {
        timeout: 3000
      });
      const result = response.data.result;
      const key = Object.keys(result)[0];
      const data = result[key];
      
      return {
        symbol,
        bids: data.bids.map((b: any[]) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) })),
        asks: data.asks.map((a: any[]) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })),
        timestamp: Date.now(),
        exchange: this.name
      };
    } catch (error) {
      const mockPrice = this.getMockPrice(symbol);
      return {
        symbol,
        bids: Array.from({ length: 5 }, (_, i) => ({ price: mockPrice * (1 - 0.0012 * (i + 1)), amount: Math.random() * 4 })),
        asks: Array.from({ length: 5 }, (_, i) => ({ price: mockPrice * (1 + 0.0012 * (i + 1)), amount: Math.random() * 4 })),
        timestamp: Date.now(),
        exchange: `${this.name} (Simulated)`
      };
    }
  }

  public async getHistoricalData(symbol: CryptoSymbol, limit = 10): Promise<HistoricalPricePoint[]> {
    const spot = await this.getTicker(symbol);
    const points: HistoricalPricePoint[] = [];
    for (let i = limit; i > 0; i--) {
      const time = Date.now() - i * 24 * 60 * 60 * 1000;
      const change = (Math.random() - 0.5) * 0.02 * spot.price;
      points.push({
        timestamp: time,
        open: spot.price - change,
        high: spot.price + Math.abs(change) * 1.3,
        low: spot.price - Math.abs(change) * 1.3,
        close: spot.price + change / 2,
        volume: Math.random() * 5000
      });
    }
    return points;
  }
}
