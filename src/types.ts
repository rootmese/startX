// Institutional Cryptocurrency MVP TypeScript Definitions

export const SUPPORTED_CRYPTOS = [
  "BTC", "ETH", "USDT", "USDC", "BNB", "SOL", "XRP", "ADA", "DOGE", "TRX",
  "TON", "SHIB", "AVAX", "DOT", "LINK", "BCH", "NEAR", "MATIC", "LTC", "UNI",
  "PEPE", "ICP", "ETC", "RNDR", "APT", "HBAR", "XLM", "ATOM", "GRT", "IMX",
  "KAS", "OP", "LDO", "FIL", "FTM", "STX", "RUNE", "WIF", "AR", "CRO",
  "MKR", "AAVE", "THETA", "INJ", "FTT", "ENA", "BONK", "SUI", "FET", "LDO"
] as const;

export type CryptoSymbol = typeof SUPPORTED_CRYPTOS[number];

export interface TickerInfo {
  symbol: CryptoSymbol;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: number;
  exchange: string;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface OrderBook {
  symbol: CryptoSymbol;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
  exchange: string;
}

export interface HistoricalPricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioAsset {
  symbol: CryptoSymbol;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
}

export interface PortfolioSummary {
  assets: PortfolioAsset[];
  totalValueUSD: number;
  totalCostBasisUSD: number;
  unrealizedPnLUSD: number;
  unrealizedPnLPercent: number;
}

export interface KYCUser {
  id: string;
  fullName: string;
  documentNumber: string; // CPF, CNPJ or Passport
  documentType: "CPF" | "CNPJ" | "PASSPORT";
  riskScore: number; // 0 to 100
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  amlCheckedAt?: Date;
  sanctionListMatch: boolean;
}

export interface MultiSigWallet {
  address: string;
  owners: string[];
  requiredSignatures: number;
  balanceUSD: number;
  assets: { symbol: CryptoSymbol; amount: number }[];
}

export interface TransactionProposal {
  id: string;
  walletAddress: string;
  toAddress: string;
  symbol: CryptoSymbol;
  amount: number;
  signatures: string[];
  executed: boolean;
  createdAt: Date;
}
