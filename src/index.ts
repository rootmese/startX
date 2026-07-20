import express, { Request, Response, NextFunction } from "express";
import { CryptoSymbol } from "./types";
import { MarketDataAggregator } from "./market-data/aggregator";
import { UniswapService } from "./defi/uniswap";
import { AaveService } from "./defi/aave";
import { OneInchService } from "./defi/1inch";
import { PortfolioManager } from "./portfolio/manager";
import { KycAmlService } from "./kyc-aml/service";
import { MultiSigWalletManager } from "./wallet/multisig";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Services instances
const aggregator = new MarketDataAggregator();
const uniswap = new UniswapService();
const aave = new AaveService();
const oneInch = new OneInchService();
const portfolioManager = new PortfolioManager();
const kycAmlService = new KycAmlService();
const multiSig = new MultiSigWalletManager();

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: Date.now() });
});

// Tickers price aggregation
app.get("/api/market-data/price/:symbol", async (req: Request, res: Response, next: NextFunction) => {
  const symbol = String(req.params.symbol).toUpperCase() as CryptoSymbol;
  try {
    const data = await aggregator.getAggregatedPrice(symbol);
    res.json(data);
  } catch (error: any) {
    next(error);
  }
});

// Consolidated orderbook
app.get("/api/market-data/orderbook/:symbol", async (req: Request, res: Response, next: NextFunction) => {
  const symbol = String(req.params.symbol).toUpperCase() as CryptoSymbol;
  try {
    const data = await aggregator.getConsolidatedOrderBook(symbol);
    res.json(data);
  } catch (error: any) {
    next(error);
  }
});

// Uniswap Swaps
app.get("/api/defi/uniswap/quote", async (req: Request, res: Response, next: NextFunction) => {
  const tokenIn = String(req.query.tokenIn || "BTC").toUpperCase() as CryptoSymbol;
  const tokenOut = String(req.query.tokenOut || "USDT").toUpperCase() as CryptoSymbol;
  const amountIn = parseFloat(String(req.query.amountIn || "1.0"));

  try {
    const quote = await uniswap.quoteSwap(tokenIn, tokenOut, amountIn);
    res.json(quote);
  } catch (error) {
    next(error);
  }
});

// Aave Reserve Data
app.get("/api/defi/aave/reserve/:symbol", async (req: Request, res: Response, next: NextFunction) => {
  const symbol = String(req.params.symbol).toUpperCase() as CryptoSymbol;
  try {
    const reserve = await aave.getReserveData(symbol);
    res.json(reserve);
  } catch (error) {
    next(error);
  }
});

// 1inch routing API
app.get("/api/defi/1inch/quote", async (req: Request, res: Response, next: NextFunction) => {
  const fromToken = String(req.query.fromToken || "ETH").toUpperCase() as CryptoSymbol;
  const toToken = String(req.query.toToken || "USDT").toUpperCase() as CryptoSymbol;
  const amount = parseFloat(String(req.query.amount || "10.0"));

  try {
    const route = await oneInch.getRouteQuote(fromToken, toToken, amount);
    res.json(route);
  } catch (error) {
    next(error);
  }
});

// Portfolio Tracking
app.get("/api/portfolio/:id", async (req: Request, res: Response, next: NextFunction) => {
  const portfolioId = String(req.params.id);
  try {
    const summary = await portfolioManager.getPortfolioSummary(portfolioId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// KYC/AML Screenings
app.get("/api/kyc/status/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = String(req.params.id);
  try {
    const user = await kycAmlService.getKYCStatus(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.post("/api/kyc/register", async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, documentNumber, documentType } = req.body;
  try {
    const user = await kycAmlService.registerUser(fullName, documentNumber, documentType);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Multisig management
app.get("/api/multisig/wallet/:address", async (req: Request, res: Response, next: NextFunction) => {
  const address = String(req.params.address);
  try {
    const wallet = await multiSig.getWallet(address);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

app.post("/api/multisig/propose", (req: Request, res: Response, next: NextFunction) => {
  const { walletAddress, toAddress, symbol, amount, creatorAddress } = req.body;
  try {
    const proposal = multiSig.createProposal(walletAddress, toAddress, symbol, amount, creatorAddress);
    res.json(proposal);
  } catch (error) {
    next(error);
  }
});

app.post("/api/multisig/sign", (req: Request, res: Response, next: NextFunction) => {
  const { proposalId, signerAddress } = req.body;
  try {
    const proposal = multiSig.signProposal(proposalId, signerAddress);
    res.json(proposal);
  } catch (error) {
    next(error);
  }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandle Error:", err.stack || err.message || err);
  res.status(500).json({
    error: true,
    message: err.message || "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`Crypto Gateway Service listening on port ${port}`);
});
