import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { positionCalculator } from "../services/position-calculator";

const router = Router();

type AuthedRequest = Request & {
  user?: { userId: string; address: string };
};

// GET /api/positions - Get user's open positions with PnL
router.get("/", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });

    // Get positions with calculated PnL
    const positions = await positionCalculator.getUserPositionsWithPnL(req.user.userId);

    res.json(positions);
  } catch (error: any) {
    console.error("[Positions] Error getting positions:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/positions/history - Get closed positions
router.get("/history", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });

    const limit = parseInt(req.query.limit as string) || 50;

    const positions = await prisma.position.findMany({
      where: {
        userId: req.user.userId,
        status: { in: ["closed", "liquidated"] },
      },
      orderBy: { closedAt: "desc" },
      take: limit,
    });

    res.json(positions);
  } catch (error: any) {
    console.error("[Positions] Error getting position history:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/positions/:id/close - Close a position
router.post("/:id/close", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });

    const positionId = req.params.id;

    // Get position with PnL calculation
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return res.status(404).json({ error: "Position not found" });
    }

    if (position.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to close this position" });
    }

    if (position.status !== "open") {
      return res.status(400).json({ error: "Position is not open" });
    }

    // Calculate final PnL at current price
    const positionWithPnL = await positionCalculator.calculatePositionPnL(position);
    const realizedPnl = positionWithPnL.unrealizedPnl;

    // Close position
    const closedPosition = await prisma.position.update({
      where: { id: positionId },
      data: {
        status: "closed",
        realizedPnl,
        closedAt: new Date(),
      },
    });

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wallet) {
      return res.status(500).json({ error: "Wallet not found" });
    }

    // Release margin back to balance and apply PnL
    const newBalance = wallet.usdtBalance + position.margin + realizedPnl;
    const newLockedMargin = wallet.lockedMargin - position.margin;

    await prisma.wallet.update({
      where: { userId: req.user.userId },
      data: {
        usdtBalance: newBalance,
        lockedMargin: newLockedMargin,
      },
    });

    // Create transaction record for realized PnL
    if (realizedPnl !== 0) {
      await prisma.transaction.create({
        data: {
          userId: req.user.userId,
          type: "REALIZED_PNL",
          amount: realizedPnl,
          balanceAfter: newBalance,
          relatedId: positionId,
          status: "confirmed",
          confirmedAt: new Date(),
        },
      });
    }

    console.log(`[Positions] Closed position ${positionId} with PnL: ${realizedPnl}`);

    res.json({
      success: true,
      position: closedPosition,
      realizedPnl,
      message: `Position closed with ${realizedPnl >= 0 ? 'profit' : 'loss'}: $${Math.abs(realizedPnl).toFixed(2)}`,
    });
  } catch (error: any) {
    console.error("[Positions] Error closing position:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
