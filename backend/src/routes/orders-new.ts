// src/routes/orders-new.ts
import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { positionCalculator } from "../services/position-calculator";
import { z } from "zod";

const router = Router();

type AuthedRequest = Request & {
  user?: { userId: string; address: string };
};

// ============================================
// SCHEMAS
// ============================================

const placeOrderSchema = z.object({
  symbol: z.string().min(3), // "TONUSDT", "BTCUSDT", "ETHUSDT"
  side: z.enum(["BUY", "SELL"]),
  type: z.enum(["MARKET", "LIMIT"]),
  price: z.number().positive().optional(), // Required for LIMIT
  size: z.number().positive(), // Position size in USDT
  leverage: z.number().int().min(1).max(20).default(1),
});

// ============================================
// HELPERS
// ============================================

// Normalize symbol format
function normalizeSymbol(input: string): string {
  const u = input.trim().toUpperCase();
  const symbolMap: Record<string, string> = {
    "USDT/TON": "TONUSDT",
    "USDT/BTC": "BTCUSDT",
    "USDT/ETH": "ETHUSDT",
  };
  if (u.includes("/")) return symbolMap[u] ?? u.replace("/", "");
  return symbolMap[u] ?? u;
}

// Get latest price from oracle
async function getLatestPrice(symbol: string): Promise<number | null> {
  const tick = await prisma.oracleTick.findFirst({
    where: { symbol },
    orderBy: { timestamp: "desc" },
  });
  return tick?.price ?? null;
}

// Get trading pair config
async function getTradingPair(symbol: string) {
  let pair = await prisma.tradingPair.findUnique({ where: { symbol } });

  // Create default if not exists
  if (!pair) {
    pair = await prisma.tradingPair.create({
      data: {
        symbol,
        baseAsset: symbol.replace("USDT", ""),
        quoteAsset: "USDT",
      },
    });
  }

  return pair;
}

// ============================================
// POST /api/orders - Place order
// ============================================
router.post("/", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const parsed = placeOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const symbol = normalizeSymbol(parsed.data.symbol);
    const { side, type, price, size, leverage } = parsed.data;
    const userId = req.user.userId;

    // Validate
    if (type === "LIMIT" && !price) {
      return res.status(400).json({ error: "LIMIT order requires price" });
    }

    // Get trading pair config
    const pair = await getTradingPair(symbol);

    if (!pair.isActive) {
      return res.status(400).json({ error: `Trading pair ${symbol} is not active` });
    }

    if (leverage > pair.maxLeverage) {
      return res.status(400).json({
        error: `Max leverage for ${symbol} is ${pair.maxLeverage}x`,
      });
    }

    if (size < pair.minOrderSize || size > pair.maxOrderSize) {
      return res.status(400).json({
        error: `Order size must be between ${pair.minOrderSize} and ${pair.maxOrderSize} USDT`,
      });
    }

    // Calculate required margin
    const requiredMargin = positionCalculator.calculateRequiredMargin(size, leverage);
    const fee = size * pair.takerFee; // Trading fee

    // Check if user has sufficient balance
    const canOpen = await positionCalculator.canOpenPosition(
      userId,
      size,
      leverage,
      fee
    );

    if (!canOpen.ok) {
      return res.status(400).json({ error: canOpen.reason });
    }

    // Get current price for MARKET orders
    let fillPrice: number | null = null;
    if (type === "MARKET") {
      fillPrice = await getLatestPrice(symbol);
      if (!fillPrice) {
        return res.status(409).json({ error: `No price available for ${symbol}` });
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        symbol,
        side,
        type,
        price: type === "LIMIT" ? price! : null,
        qty: size,
        leverage,
        status: type === "MARKET" ? "filled" : "open",
        fillPrice: type === "MARKET" ? fillPrice! : null,
        fee: type === "MARKET" ? fee : 0,
        filledAt: type === "MARKET" ? new Date() : null,
      },
    });

    // If MARKET order, execute immediately
    if (type === "MARKET" && fillPrice) {
      await executeOrder(userId, symbol, side, size, leverage, fillPrice, fee, order.id);
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error("[Orders] Error placing order:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Execute Order - Open/Close Position
// ============================================
async function executeOrder(
  userId: string,
  symbol: string,
  side: "BUY" | "SELL",
  size: number,
  leverage: number,
  fillPrice: number,
  fee: number,
  orderId: string
) {
  try {
    // Determine position side
    const positionSide = side === "BUY" ? "LONG" : "SHORT";

    // Check if user already has open position for this symbol
    const existing = await prisma.position.findFirst({
      where: { userId, symbol, status: "open" },
    });

    if (existing) {
      // Close or reduce existing position if opposite side
      if (existing.side !== positionSide) {
        return await closeOrReducePosition(
          existing,
          size,
          fillPrice,
          fee,
          userId,
          orderId
        );
      }

      // Otherwise, increase position (add to existing)
      return await increasePosition(existing, size, fillPrice, leverage, fee, userId);
    }

    // Open new position
    return await openNewPosition(
      userId,
      symbol,
      positionSide,
      size,
      leverage,
      fillPrice,
      fee,
      orderId
    );
  } catch (error) {
    console.error("[Orders] Error executing order:", error);
    throw error;
  }
}

// Open new position
async function openNewPosition(
  userId: string,
  symbol: string,
  side: string,
  size: number,
  leverage: number,
  entryPrice: number,
  fee: number,
  orderId: string
) {
  const margin = positionCalculator.calculateRequiredMargin(size, leverage);
  const liquidationPrice = positionCalculator.calculateLiquidationPrice(
    side,
    entryPrice,
    leverage
  );

  await prisma.$transaction([
    // Create position
    prisma.position.create({
      data: {
        userId,
        symbol,
        side,
        size,
        leverage,
        entryPrice,
        margin,
        liquidationPrice,
        status: "open",
      },
    }),

    // Lock margin in wallet
    prisma.wallet.update({
      where: { userId },
      data: {
        lockedMargin: { increment: margin },
      },
    }),

    // Deduct fee
    prisma.wallet.update({
      where: { userId },
      data: {
        usdtBalance: { decrement: fee },
      },
    }),

    // Record fee transaction
    prisma.transaction.create({
      data: {
        userId,
        type: "TRADE_FEE",
        amount: -fee,
        balanceAfter: 0, // Will be calculated
        relatedId: orderId,
        status: "confirmed",
        confirmedAt: new Date(),
      },
    }),
  ]);

  console.log(`[Orders] Opened ${side} position: ${size} ${symbol} @ ${entryPrice}`);
}

// Increase existing position (same side)
async function increasePosition(
  existing: any,
  addSize: number,
  fillPrice: number,
  leverage: number,
  fee: number,
  userId: string
) {
  // Calculate new average entry price
  const totalNotional = existing.size * existing.entryPrice + addSize * fillPrice;
  const totalSize = existing.size + addSize;
  const newEntryPrice = totalNotional / totalSize;

  const additionalMargin = positionCalculator.calculateRequiredMargin(addSize, leverage);
  const newTotalMargin = existing.margin + additionalMargin;
  const newLiquidationPrice = positionCalculator.calculateLiquidationPrice(
    existing.side,
    newEntryPrice,
    leverage
  );

  await prisma.$transaction([
    // Update position
    prisma.position.update({
      where: { id: existing.id },
      data: {
        size: totalSize,
        entryPrice: newEntryPrice,
        margin: newTotalMargin,
        liquidationPrice: newLiquidationPrice,
      },
    }),

    // Lock additional margin
    prisma.wallet.update({
      where: { userId },
      data: {
        lockedMargin: { increment: additionalMargin },
        usdtBalance: { decrement: fee },
      },
    }),
  ]);

  console.log(`[Orders] Increased position to ${totalSize} @ ${newEntryPrice}`);
}

// Close or reduce position (opposite side)
async function closeOrReducePosition(
  existing: any,
  closeSize: number,
  exitPrice: number,
  fee: number,
  userId: string,
  orderId: string
) {
  const quantity = existing.size / existing.entryPrice;
  const closingQuantity = (closeSize / exitPrice);

  // Calculate PnL
  const pnl =
    existing.side === "LONG"
      ? (exitPrice - existing.entryPrice) * closingQuantity
      : (existing.entryPrice - exitPrice) * closingQuantity;

  if (closeSize >= existing.size) {
    // Fully close position
    const releasedMargin = existing.margin;

    await prisma.$transaction([
      // Close position
      prisma.position.update({
        where: { id: existing.id },
        data: {
          status: "closed",
          realizedPnl: pnl,
          closedAt: new Date(),
        },
      }),

      // Release margin + PnL
      prisma.wallet.update({
        where: { userId },
        data: {
          usdtBalance: { increment: releasedMargin + pnl - fee },
          lockedMargin: { decrement: releasedMargin },
        },
      }),

      // Record PnL transaction
      prisma.transaction.create({
        data: {
          userId,
          type: "REALIZED_PNL",
          amount: pnl,
          balanceAfter: 0,
          relatedId: orderId,
          status: "confirmed",
          confirmedAt: new Date(),
          metadata: JSON.stringify({
            symbol: existing.symbol,
            entryPrice: existing.entryPrice,
            exitPrice,
            size: existing.size,
          }),
        },
      }),
    ]);

    console.log(`[Orders] Closed position with PnL: ${pnl.toFixed(2)} USDT`);
  } else {
    // Partially close position
    const remainingSize = existing.size - closeSize;
    const releasedMargin = (closeSize / existing.size) * existing.margin;
    const remainingMargin = existing.margin - releasedMargin;

    await prisma.$transaction([
      // Reduce position
      prisma.position.update({
        where: { id: existing.id },
        data: {
          size: remainingSize,
          margin: remainingMargin,
          realizedPnl: existing.realizedPnl + pnl,
        },
      }),

      // Release partial margin + PnL
      prisma.wallet.update({
        where: { userId },
        data: {
          usdtBalance: { increment: releasedMargin + pnl - fee },
          lockedMargin: { decrement: releasedMargin },
        },
      }),
    ]);

    console.log(`[Orders] Reduced position to ${remainingSize}, PnL: ${pnl.toFixed(2)}`);
  }
}

// ============================================
// GET /api/orders - Get user orders
// ============================================
router.get("/", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.userId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json(orders);
  } catch (error: any) {
    console.error("[Orders] Error getting orders:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE /api/orders/:id - Cancel order
// ============================================
router.delete("/:id", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.userId !== req.user.userId) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "open") {
      return res.status(400).json({ error: "Can only cancel open orders" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error("[Orders] Error canceling order:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
