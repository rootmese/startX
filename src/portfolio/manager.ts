import { CryptoSymbol, PortfolioAsset, PortfolioSummary } from "../types";
import { MarketDataAggregator } from "../market-data/aggregator";

export class PortfolioManager {
  private aggregator = new MarketDataAggregator();
  private mockPortfolios: Record<string, PortfolioAsset[]> = {
    "institutional-alpha": [
      { symbol: "BTC", amount: 15.5, avgBuyPrice: 58000, currentPrice: 0 },
      { symbol: "ETH", amount: 250.0, avgBuyPrice: 3100, currentPrice: 0 },
      { symbol: "SOL", amount: 1200.0, avgBuyPrice: 130, currentPrice: 0 },
      { symbol: "USDT", amount: 150000.0, avgBuyPrice: 1.0, currentPrice: 1.0 },
      { symbol: "AAVE", amount: 500.0, avgBuyPrice: 85, currentPrice: 0 }
    ]
  };

  public async getPortfolioSummary(portfolioId: string): Promise<PortfolioSummary> {
    const assets = this.mockPortfolios[portfolioId] || [];
    if (assets.length === 0) {
      return {
        assets: [],
        totalValueUSD: 0,
        totalCostBasisUSD: 0,
        unrealizedPnLUSD: 0,
        unrealizedPnLPercent: 0
      };
    }

    let totalValueUSD = 0;
    let totalCostBasisUSD = 0;

    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        let currentPrice = asset.currentPrice;
        if (asset.symbol !== "USDT" && asset.symbol !== "USDC") {
          try {
            const data = await this.aggregator.getAggregatedPrice(asset.symbol);
            currentPrice = data.averagePrice;
          } catch {
            currentPrice = asset.avgBuyPrice * 1.05; // Fallback
          }
        }
        const assetValue = currentPrice * asset.amount;
        const costBasis = asset.avgBuyPrice * asset.amount;

        totalValueUSD += assetValue;
        totalCostBasisUSD += costBasis;

        return {
          ...asset,
          currentPrice
        };
      })
    );

    const unrealizedPnLUSD = totalValueUSD - totalCostBasisUSD;
    const unrealizedPnLPercent = totalCostBasisUSD > 0 ? (unrealizedPnLUSD / totalCostBasisUSD) * 100 : 0;

    return {
      assets: updatedAssets,
      totalValueUSD,
      totalCostBasisUSD,
      unrealizedPnLUSD,
      unrealizedPnLPercent
    };
  }

  public updateAsset(portfolioId: string, symbol: CryptoSymbol, amount: number, avgBuyPrice: number) {
    if (!this.mockPortfolios[portfolioId]) {
      this.mockPortfolios[portfolioId] = [];
    }
    const assets = this.mockPortfolios[portfolioId];
    const existing = assets.find(a => a.symbol === symbol);

    if (existing) {
      existing.amount = amount;
      existing.avgBuyPrice = avgBuyPrice;
    } else {
      assets.push({ symbol, amount, avgBuyPrice, currentPrice: 0 });
    }
  }
}
