import { CryptoSymbol } from "../types";

export interface RouteProtocolSplit {
  name: string;
  part: number; // e.g. 60 = 60%
}

export interface RouteQuote {
  fromToken: CryptoSymbol;
  toToken: CryptoSymbol;
  fromAmount: number;
  toAmount: number;
  protocols: RouteProtocolSplit[][];
  gasEstimatedUSD: number;
}

export class OneInchService {
  public async getRouteQuote(
    fromToken: CryptoSymbol,
    toToken: CryptoSymbol,
    amount: number
  ): Promise<RouteQuote> {
    const mockPrices: Record<string, number> = { BTC: 65000, ETH: 3500, SOL: 145, USDT: 1, USDC: 1 };
    const priceFrom = mockPrices[fromToken] || 10;
    const priceTo = mockPrices[toToken] || 10;
    const targetAmount = (amount * priceFrom) / priceTo;

    // Simulate multi-route split
    const protocols = [
      [
        { name: "Uniswap_V3", part: 60 },
        { name: "Curve", part: 40 }
      ],
      [
        { name: "SushiSwap", part: 80 },
        { name: "Balancer", part: 20 }
      ]
    ];

    return {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: targetAmount * 0.9995, // 0.05% aggregator efficiency loss
      protocols,
      gasEstimatedUSD: 12.5 + Math.random() * 5
    };
  }
}
