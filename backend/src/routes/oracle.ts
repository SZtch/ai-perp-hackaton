import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { z } from "zod";

const router = Router();

const reportSchema = z.object({
  symbol: z.string().min(3).default("TONUSDT"),
  price: z.number().positive(),
  volatility: z.number().min(0),
  confidence: z.number().int().min(0).max(100),
  timestamp: z.number().int().optional(),
});

router.post("/report", async (req: Request, res: Response) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", issues: parsed.error.issues });

  const { symbol, price, volatility, confidence, timestamp } = parsed.data;
  const tick = await prisma.oracleTick.create({
    data: { symbol, price, volatility, confidence, timestamp: timestamp ? new Date(timestamp) : new Date() },
  });

  res.json({
    success: true,
    data: {
      symbol: tick.symbol,
      price: tick.price,
      volatility: tick.volatility,
      confidence: tick.confidence,
      timestamp: tick.timestamp.getTime(),
    },
  });
});

// Get single price by symbol
router.get("/price", async (req: Request, res: Response) => {
  const symbol = String(req.query.symbol || "TONUSDT").toUpperCase();
  const latest = await prisma.oracleTick.findFirst({ where: { symbol }, orderBy: { timestamp: "desc" } });
  if (!latest) return res.json({ symbol, price: 0, volatility: 0, confidence: 0, timestamp: Date.now() });
  res.json({
    symbol,
    price: latest.price,
    volatility: latest.volatility,
    confidence: latest.confidence,
    timestamp: latest.timestamp.getTime(),
  });
});

// Get all prices (for all symbols)
router.get("/prices", async (req: Request, res: Response) => {
  const symbols = ["TONUSDT", "BTCUSDT", "ETHUSDT"];

  const prices: Record<string, any> = {};

  for (const symbol of symbols) {
    const latest = await prisma.oracleTick.findFirst({
      where: { symbol },
      orderBy: { timestamp: "desc" }
    });

    if (latest) {
      prices[symbol] = {
        symbol: latest.symbol,
        price: latest.price,
        volatility: latest.volatility,
        confidence: latest.confidence,
        timestamp: latest.timestamp.getTime(),
      };
    } else {
      prices[symbol] = {
        symbol,
        price: 0,
        volatility: 0,
        confidence: 0,
        timestamp: Date.now(),
      };
    }
  }

  res.json(prices);
});

router.get("/history", async (req: Request, res: Response) => {
  const symbol = String(req.query.symbol || "TONUSDT").toUpperCase();
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  const offset = Number(req.query.offset ?? 0);

  const [rows, total] = await Promise.all([
    prisma.oracleTick.findMany({ where: { symbol }, orderBy: { timestamp: "desc" }, skip: offset, take: limit }),
    prisma.oracleTick.count({ where: { symbol } }),
  ]);

  res.json({
    symbol,
    data: rows.map((r: any) => ({
      symbol: r.symbol,
      price: r.price,
      volatility: r.volatility,
      confidence: r.confidence,
      timestamp: r.timestamp.getTime(),
    })),
    total,
  });
});

export default router;
