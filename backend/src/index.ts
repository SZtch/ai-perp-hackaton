import "dotenv/config";
import express from "express";
import cors from "cors";
import oracle from "./routes/oracle";
import authTon from "./routes/auth-ton";
import pairs from "./routes/pairs";
import orders from "./routes/orders"; // Orders with leverage & margin
import positions from "./routes/positions";
import wallet from "./routes/wallet"; // Wallet management
import portfolio from "./routes/portfolio"; // Portfolio overview

import { requireAuth } from "./middleware/auth";
import { authLimiter, orderLimiter } from "./middleware/limits";
import { startGlobalPriceFeed } from "./services/priceFeed";

const app = express();

// CORS: whitelist dari .env (comma-separated) atau allow all (dev)
const origins = process.env.ORIGIN?.split(",").map(s => s.trim()).filter(Boolean) ?? true;
app.use(cors({ origin: origins }));
app.use(express.json());

// ============================================
// PUBLIC ROUTES
// ============================================

// health check
app.get("/health", (_req, res) => res.json({
  ok: true,
  timestamp: new Date().toISOString(),
  network: process.env.TON_NETWORK || "testnet"
}));

// auth (rate limited)
app.use("/auth", authLimiter, authTon);

// public oracle endpoints
app.use("/api/oracle", oracle);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

// wallet management
app.use("/api/wallet", requireAuth, wallet);

// portfolio overview
app.use("/api/portfolio", requireAuth, portfolio);

// trading pairs info
app.use("/api/pairs", requireAuth, pairs);

// orders (with leverage & margin)
app.use("/api/orders", orderLimiter, requireAuth, orders);

// positions
app.use("/api/positions", requireAuth, positions);

// whoami - get current user info
app.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.user,
    network: process.env.TON_NETWORK || "testnet"
  });
});

// ============================================
// START SERVER
// ============================================

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log("===========================================");
  console.log(`🚀 SuperAI Perp Backend`);
  console.log(`📡 Server running on port ${port}`);
  console.log(`🌐 Network: ${process.env.TON_NETWORK || "testnet"}`);
  console.log(`💰 Symbols: ${process.env.FEED_SYMBOLS || "TONUSDT,BTCUSDT,ETHUSDT"}`);
  console.log("===========================================");

  // Start price feed monitoring
  startGlobalPriceFeed();
});
