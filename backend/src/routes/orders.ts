// src/routes/orders.ts
import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { z } from "zod";

const router = Router();

/** Request yang sudah di-inject user oleh middleware auth */
type AuthedRequest = Request & {
  user?: { userId: string; address: string };
};

const placeSchema = z.object({
  // FE boleh kirim "USDT/TON" atau "TONUSDT" — kita normalisasi ke UPPERCASE tanpa slash
  symbol: z.string().min(3),
  side: z.enum(["BUY", "SELL"]),
  type: z.enum(["MARKET", "LIMIT"]),
  price: z.number().positive().optional(),
  qty: z.number().positive(),
});

// mapping opsional jika FE masih pakai format "USDT/TON"
const symbolMap: Record<string, string> = {
  "USDT/TON": "TONUSDT",
  "USDT/BTC": "BTCUSDT",
  "USDT/ETH": "ETHUSDT",
};

function normalizeSymbol(input: string): string {
  const u = input.trim().toUpperCase();
  // jika format "AAA/BBB" gabungkan jadi "BBBAAA" sesuai konvensi exchange USDT base
  if (u.includes("/")) return symbolMap[u] ?? u.replace("/", "");
  return symbolMap[u] ?? u;
}

// ------- helpers -------

// latest oracle price per-symbol
async function getLatestPrice(symbol: string): Promise<number | null> {
  const tick = await prisma.oracleTick.findFirst({
    where: { symbol },
    orderBy: { timestamp: "desc" },
  });
  return tick?.price ?? null;
}

// apply fill ke posisi user (avg price & flip logic)
async function applyFill(
  userId: string,
  symbol: string,
  side: "BUY" | "SELL",
  qty: number,
  fillPx: number
) {
  const sign = side === "BUY" ? 1 : -1;

  const existing = await prisma.position.findUnique({
    where: { userId_symbol: { userId, symbol } },
  });

  if (!existing) {
    await prisma.position.create({
      data: { userId, symbol, size: sign * qty, entryPx: fillPx },
    });
    return;
  }

  const newSize = existing.size + sign * qty;

  // jika searah → average price
  if (existing.size === 0 || Math.sign(existing.size) === sign) {
    const notionalOld = Math.abs(existing.size) * existing.entryPx;
    const notionalNew = qty * fillPx;
    const avgPx =
      (notionalOld + notionalNew) / (Math.abs(existing.size) + qty);
    await prisma.position.update({
      where: { id: existing.id },
      data: { size: newSize, entryPx: avgPx },
    });
    return;
  }

  // berlawanan arah → reduce/flat/flip
  if (Math.abs(qty) < Math.abs(existing.size)) {
    await prisma.position.update({
      where: { id: existing.id },
      data: { size: newSize }, // entryPx tetap
    });
  } else if (Math.abs(qty) === Math.abs(existing.size)) {
    await prisma.position.update({
      where: { id: existing.id },
      data: { size: 0 },
    });
  } else {
    const remainder = Math.abs(qty) - Math.abs(existing.size);
    await prisma.position.update({
      where: { id: existing.id },
      data: { size: sign * remainder, entryPx: fillPx },
    });
  }
}

// ------- routes -------

// POST /api/orders -> place order
router.post("/", async (req: AuthedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });

  const parsed = placeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const symbol = normalizeSymbol(parsed.data.symbol);
  const { side, type, price, qty } = parsed.data;

  if (type === "LIMIT" && typeof price !== "number") {
    return res.status(400).json({ error: "LIMIT order requires price" });
  }

  // buat order open
  let order = await prisma.order.create({
    data: {
      userId: req.user.userId,
      symbol,
      side,
      type,
      price: type === "LIMIT" ? price! : null,
      qty,
      status: "open",
    },
  });

  // auto-fill MARKET dengan last price per-symbol
  if (type === "MARKET") {
    const fillPx = await getLatestPrice(symbol);
    if (fillPx == null) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "cancelled" },
      });
      return res.status(409).json({ error: `no price available for ${symbol}` });
    }

    await applyFill(req.user.userId, symbol, side, qty, fillPx);
    order = await prisma.order.update({
      where: { id: order.id },
      data: { status: "filled", price: fillPx },
    });
  }

  res.status(201).json(order);
});

// GET /api/orders?status=open
router.get("/", async (req: AuthedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });

  const status = (req.query.status as string | undefined) ?? undefined;

  const orders = await prisma.order.findMany({
    where: { userId: req.user.userId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
});

// DELETE /api/orders/:id -> cancel open order
router.delete("/:id", async (req: AuthedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });

  const id = req.params.id;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== req.user.userId)
    return res.status(404).json({ error: "not found" });
  if (order.status !== "open")
    return res.status(400).json({ error: "cannot cancel non-open order" });

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "cancelled" },
  });

  res.json(updated);
});

export default router;
