// src/routes/portfolio.ts
import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { positionCalculator } from "../services/position-calculator";

const router = Router();

type AuthedRequest = Request & {
  user?: { userId: string; address: string };
};

// ============================================
// GET /api/portfolio - Complete portfolio overview
// ============================================
router.get("/", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.user.userId;

    // 1. Get Wallet Info
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
      });
    }

    // 2. Get Open Positions with PnL
    const openPositions = await positionCalculator.getUserPositionsWithPnL(userId);

    // 3. Calculate total unrealized PnL
    const totalUnrealizedPnl = openPositions.reduce(
      (sum, pos) => sum + pos.unrealizedPnl,
      0
    );

    // 4. Calculate total equity
    const equity = wallet.usdtBalance + totalUnrealizedPnl;
    const available = wallet.usdtBalance - wallet.lockedMargin;

    // 5. Get transaction statistics
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: { in: ["REALIZED_PNL", "TRADE_FEE"] },
      },
    });

    const totalRealizedPnl = transactions
      .filter((t) => t.type === "REALIZED_PNL")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFees = transactions
      .filter((t) => t.type === "TRADE_FEE")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // 6. Get order statistics
    const allOrders = await prisma.order.findMany({
      where: { userId, status: "filled" },
    });

    const totalTrades = allOrders.length;

    // 7. Get today's transactions for today's PnL
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "REALIZED_PNL",
        createdAt: { gte: todayStart },
      },
    });

    const todayPnl =
      todayTransactions.reduce((sum, t) => sum + t.amount, 0) +
      (openPositions.length > 0 ? totalUnrealizedPnl : 0);

    // 8. Calculate win rate from closed positions
    const closedPositions = await prisma.position.findMany({
      where: {
        userId,
        status: { in: ["closed", "liquidated"] },
      },
    });

    const winningTrades = closedPositions.filter((p) => p.realizedPnl > 0).length;
    const winRate =
      closedPositions.length > 0 ? (winningTrades / closedPositions.length) * 100 : 0;

    // 9. Get recent activity
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 10. Construct response
    res.json({
      wallet: {
        balance: wallet.usdtBalance,
        locked: wallet.lockedMargin,
        available,
        equity,
        unrealizedPnl: totalUnrealizedPnl,
        totalDeposit: wallet.totalDeposit,
        totalWithdraw: wallet.totalWithdraw,
      },
      positions: openPositions.map((pos) => ({
        id: pos.id,
        symbol: pos.symbol,
        side: pos.side,
        size: pos.size,
        leverage: pos.leverage,
        entryPrice: pos.entryPrice,
        markPrice: pos.markPrice,
        margin: pos.margin,
        liquidationPrice: pos.liquidationPrice,
        unrealizedPnl: pos.unrealizedPnl,
        roe: pos.roe,
        marginRatio: pos.marginRatio,
        openedAt: pos.openedAt,
      })),
      stats: {
        totalPnl: totalRealizedPnl + totalUnrealizedPnl,
        realizedPnl: totalRealizedPnl,
        unrealizedPnl: totalUnrealizedPnl,
        todayPnl,
        totalTrades,
        winRate,
        totalFees,
        openPositions: openPositions.length,
      },
      recentActivity: recentTransactions,
    });
  } catch (error: any) {
    console.error("[Portfolio] Error getting portfolio:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/portfolio/stats - Quick stats only
// ============================================
router.get("/stats", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.user.userId;

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    const positions = await positionCalculator.getUserPositionsWithPnL(userId);

    const unrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    const equity = (wallet?.usdtBalance || 0) + unrealizedPnl;

    res.json({
      balance: wallet?.usdtBalance || 0,
      equity,
      unrealizedPnl,
      openPositions: positions.length,
      lockedMargin: wallet?.lockedMargin || 0,
    });
  } catch (error: any) {
    console.error("[Portfolio] Error getting stats:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;