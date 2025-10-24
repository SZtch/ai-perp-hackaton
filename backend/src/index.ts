import "dotenv/config"; // <-- tambah ini di paling atas
import express from "express";
import cors from "cors";
import oracle from "./routes/oracle";
import authTon from "./routes/auth-ton";
import pairs from "./routes/pairs";
import orders from "./routes/orders";
import positions from "./routes/positions";

import { requireAuth } from "./middleware/auth";

// OPTIONAL: aktifkan kalau kamu sudah buat file ini
// (kalau belum ada, sementara comment 2 import di bawah)
import { authLimiter, orderLimiter } from "./middleware/limits";
import { startGlobalPriceFeed } from "./services/priceFeed";

const app = express();

// CORS: whitelist dari .env (comma-separated) atau allow all (dev)
const origins = process.env.ORIGIN?.split(",").map(s => s.trim()).filter(Boolean) ?? true;
app.use(cors({ origin: origins }));
app.use(express.json());

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// auth (rate limited)
app.use("/auth", authLimiter, authTon);

// public oracle (GETs), report boleh public atau bisa kamu protect nanti
app.use("/api/oracle", oracle);

// protected resources
app.use("/api/pairs", requireAuth, pairs);
app.use("/api/orders", orderLimiter, requireAuth, orders);
app.use("/api/positions", requireAuth, positions);

// whoami
app.get("/me", requireAuth, (req, res) => {
  res.json({ me: req.user });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log("api up on", port);

  // start price feed global (TONUSDT,BTCUSDT,ETHUSDT, dll sesuai FEED_SYMBOLS)
  // Set .env: PRICE_FEED=binance_ws  FEED_SYMBOLS=TONUSDT,BTCUSDT,ETHUSDT
  startGlobalPriceFeed();
});
