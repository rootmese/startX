import axios from "axios";
import { BaseExchange } from "./base";
import { CryptoSymbol, TickerInfo, OrderBook, HistoricalPricePoint } from "../types";

export class HuobiExchange extends BaseExchange {
  public readonly name = "Huobi";

  public async getTicker(symbol: CryptoSymbol): Promise<TickerInfo> {
    const pair = symbol === "USDT" ? "usdcusdt" : `${symbol.toLowerCase()}usdt`;
    try {
      const response = await axios.get(`https://api.huobi.pro/market/detail/merged?symbol=${pair}`, {
        timeout: 3000
      });
      const tick = response.data.tick;
      const price = (tick.bid[0] + tick.ask[0]) / 2;
      return {
        symbol,
        price,
        bid: tick.bid[0],
        ask: tick.ask[0],
        volume: tick.vol,
        timestamp: Date.now(),
        exchange: this.name
      };
    } catch (error) {
      const mockPrice = this.getMockPrice(symbol) * (1 + (Math.random() - 0.5) * 0.0035);
      return {
        symbol,
        price: mockPrice,
        bid: mockPrice * 0.9985,
        ask: mockPrice * 1.0015,
        volume: 95000,
        timestamp: Date.now(),
        exchange: `${this.name} (Simulated)`
      };
    }
  }

  public async getOrderBook(symbol: CryptoSymbol): Promise<OrderBook> {
    const pair = symbol === "USDT" ? "usdcusdt" : `${symbol.toLowerCase()}usdt`;
    try {
      const response = await axios.get(`https://api.huobi.pro/market/depth?symbol=${pair}&type=step0`, {
        timeout: 3000
      });
      const tick = response.data.tick;
      return {
        symbol,
        bids: tick.bids.slice(0, 5).map((b: number[]) => ({ price: b[0], amount: b[1] })),
        asks: tick.asks.slice(0, 5).map((a: number[]) => ({ price: a[0], amount: a[1] })),
        timestamp: Date.now(),
        exchange: this.name
      };
    } catch (error) {
      const mockPrice = this.getMockPrice(symbol);
      return {
        symbol,
        bids: Array.from({ length: 5 }, (_, i) => ({ price: mockPrice * (1 - 0.0011 * (i + 1)), amount: Math.random() * 7 })),
        asks: Array.from({ length: 5 }, (_, i) => ({ price: mockPrice * (1 + 0.0011 * (i + 1)), amount: Math.random() * 7 })),
        timestamp: Date.now(),
        exchange: `${this.name} (Simulated)`
      };
    }
  }

  public async getHistoricalData(symbol: CryptoSymbol, limit = 10): Promise<HistoricalPricePoint[]> {
    const pair = symbol === "USDT" ? "usdcusdt" : `${symbol.toLowerCase()}usdt`;
    try {
      const response = await axios.get(`https://api.huobi.pro/market/history/kline?symbol=${pair}&period=1day&size=${limit}`, {
        timeout: 3000
      });
      return response.data.data.map((k: any) => ({
        timestamp: k.id * 1000,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.vol
      })).reverse();
    } catch (error) {
      const mockPrice = this.getMockPrice(symbol);
      const points: HistoricalPricePoint[] = [];
      for (let i = limit; i > 0; i--) {
        const time = Date.now() - i * 24 * 60 * 60 * 1000;
        const change = (Math.random() - 0.5) * 0.02 * mockPrice;
        points.push({
          timestamp: time,
          open: mockPrice - change,
          high: mockPrice + Math.abs(change) * 1.25,
          low: mockPrice - Math.abs(change) * 1.25,
          close: mockPrice + change / 2,
          volume: Math.random() * 7500
        });
      }
      return points;
    }
  }
}
