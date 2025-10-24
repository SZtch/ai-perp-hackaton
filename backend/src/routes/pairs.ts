import { Router, type Request, type Response } from "express";

const router = Router();

// sementara statis; nanti ambil dari DB/config
const PAIRS = [
  { symbol: "USDT/TON", minQty: 1, priceDp: 4 },
  { symbol: "USDT/BTC", minQty: 0.0001, priceDp: 2 },
  { symbol: "USDT/ETH", minQty: 0.001, priceDp: 2 },
];

router.get("/", (_req: Request, res: Response) => {
  res.json({ data: PAIRS });
});

export default router;
