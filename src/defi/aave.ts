import { CryptoSymbol } from "../types";

export interface AaveReserveData {
  symbol: CryptoSymbol;
  liquidityRate: number; // Supply APY in percentage
  variableBorrowRate: number; // Borrow APY in percentage
  stableBorrowRate: number;
  availableLiquidityUSD: number;
  totalDebtUSD: number;
  ltv: number; // Loan-to-value ratio (e.g. 0.80 = 80%)
  liquidationThreshold: number;
}

export class AaveService {
  private getMockReserve(symbol: CryptoSymbol): AaveReserveData {
    const apys: Record<string, { supply: number; borrow: number; ltv: number }> = {
      BTC: { supply: 0.05, borrow: 1.8, ltv: 0.70 },
      ETH: { supply: 1.2, borrow: 2.5, ltv: 0.80 },
      USDT: { supply: 4.5, borrow: 5.8, ltv: 0.75 },
      USDC: { supply: 4.8, borrow: 6.0, ltv: 0.80 },
      SOL: { supply: 0.8, borrow: 3.2, ltv: 0.65 }
    };

    const reserve = apys[symbol] || { supply: 0.5, borrow: 2.0, ltv: 0.50 };

    return {
      symbol,
      liquidityRate: reserve.supply,
      variableBorrowRate: reserve.borrow,
      stableBorrowRate: reserve.borrow + 1.5,
      availableLiquidityUSD: Math.random() * 50000000 + 10000000,
      totalDebtUSD: Math.random() * 20000000 + 5000000,
      ltv: reserve.ltv,
      liquidationThreshold: reserve.ltv + 0.05
    };
  }

  public async getReserveData(symbol: CryptoSymbol): Promise<AaveReserveData> {
    return this.getMockReserve(symbol);
  }

  public calculateHealthFactor(
    collateralUSD: number,
    borrowUSD: number,
    liquidationThreshold: number
  ): number {
    if (borrowUSD === 0) return Infinity;
    return (collateralUSD * liquidationThreshold) / borrowUSD;
  }
}
