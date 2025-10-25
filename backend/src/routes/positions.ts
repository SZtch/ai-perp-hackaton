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

export default router;
