import axios from "axios";
import { BaseExchange } from "./base";
import { CryptoSymbol, TickerInfo, OrderBook, HistoricalPricePoint } from "../types";

export class OkxExchange extends BaseExchange {
  public readonly name = "OKX";

  public async getTicker(symbol: CryptoSymbol): Promise<TickerInfo> {
    const pair = symbol === "USDT" ? "USDC-USDT" : `${symbol}-USDT`;
    try {
      const response = await axios.get(`https://www.okx.com/api/v5/market/ticker?instId=${pair}`, {
        timeout: 3000
      });
      const data = response.data.data[0];
      const price = parseFloat(data.last);
      const bid = parseFloat(data.bidPx);
      const ask = parseFloat(data.askPx);
      const volume = parseFloat(data.vol24h);

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
      const mockPrice = this.getMockPrice(symbol) * (1 + (Math.random() - 0.5) * 0.0025);
      return {
        symbol,
        price: mockPrice,
        bid: mockPrice * 0.999,
        ask: mockPrice * 1.001,
        volume: 120000,
        timestamp: Date.now(),
        exchange: `${this.name} (Simulated)`
      };
    }
  }

  public async getOrderBook(symbol: CryptoSymbol): Promise<OrderBook> {
    const pair = symbol === "USDT" ? "USDC-USDT" : `${symbol}-USDT`;
    try {
      const response = await axios.get(`https://www.okx.com/api/v5/market/books?instId=${pair}&sz=5`, {
        timeout: 3000
      });
      const data = response.data.data[0];
      return {
        symbol,
        bids: data.bids.map((b: string[]) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) })),
        asks: data.asks.map((a: string[]) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })),
        timestamp: Date.now(),
        exchange: this.name
      };
    } catch (error) {
      const mockPrice = this.getMockPrice(symbol);
      return {
        symbol,
        bids: Array.from({ length: 5 }, (_, i) => ({ price: mockPrice * (1 - 0.0009 * (i + 1)), amount: Math.random() * 6 })),
        asks: Array.from({ length: 5 }, (_, i) => ({ price: mockPrice * (1 + 0.0009 * (i + 1)), amount: Math.random() * 6 })),
        timestamp: Date.now(),
        exchange: `${this.name} (Simulated)`
      };
    }
  }

  public async getHistoricalData(symbol: CryptoSymbol, limit = 10): Promise<HistoricalPricePoint[]> {
    const pair = symbol === "USDT" ? "USDC-USDT" : `${symbol}-USDT`;
    try {
      const response = await axios.get(`https://www.okx.com/api/v5/market/candles?instId=${pair}&limit=${limit}`, {
        timeout: 3000
      });
      return response.data.data.map((c: string[]) => ({
        timestamp: parseInt(c[0]),
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[5])
      })).reverse();
    } catch (error) {
      const mockPrice = this.getMockPrice(symbol);
      const points: HistoricalPricePoint[] = [];
      for (let i = limit; i > 0; i--) {
        const time = Date.now() - i * 24 * 60 * 60 * 1000;
        const change = (Math.random() - 0.5) * 0.018 * mockPrice;
        points.push({
          timestamp: time,
          open: mockPrice - change,
          high: mockPrice + Math.abs(change) * 1.15,
          low: mockPrice - Math.abs(change) * 1.15,
          close: mockPrice + change / 2,
          volume: Math.random() * 9000
        });
      }
      return points;
    }
  }
}
