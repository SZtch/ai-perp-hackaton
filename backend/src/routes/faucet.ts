// src/routes/faucet.ts
import { Router, type Request, type Response } from "express";
import { prisma } from "../db";

const router = Router();

// Type for authenticated request
type AuthedRequest = Request & {
  user?: { userId: string; address: string };
};

// Faucet configuration
const FAUCET_AMOUNT = parseFloat(process.env.FAUCET_AMOUNT || "1000"); // Default $1000 USDT
const FAUCET_COOLDOWN = parseInt(process.env.FAUCET_COOLDOWN || "86400000"); // 24 hours in ms

// In-memory cooldown tracking (in production, use Redis)
const lastClaimTimes = new Map<string, number>();

/**
 * GET /api/faucet/info
 * Get faucet information and user's claim status
 */
router.get("/info", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.userId;
    const lastClaimTime = lastClaimTimes.get(userId) || 0;
    const now = Date.now();
    const timeSinceLastClaim = now - lastClaimTime;
    const canClaim = timeSinceLastClaim >= FAUCET_COOLDOWN;
    const nextClaimTime = canClaim ? now : lastClaimTime + FAUCET_COOLDOWN;
    const timeUntilNextClaim = canClaim ? 0 : nextClaimTime - now;

    res.json({
      faucetAmount: FAUCET_AMOUNT,
      cooldownMs: FAUCET_COOLDOWN,
      canClaim,
      lastClaimTime: lastClaimTime || null,
      nextClaimTime: canClaim ? null : nextClaimTime,
      timeUntilNextClaimMs: timeUntilNextClaim,
      note: "Testnet Faucet for Hackathon Demo",
    });
  } catch (error: any) {
    console.error("[Faucet] Error getting info:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/faucet/claim
 * Claim testnet USDT from faucet
 */
router.post("/claim", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.userId;
    const now = Date.now();

    // Check cooldown
    const lastClaimTime = lastClaimTimes.get(userId) || 0;
    const timeSinceLastClaim = now - lastClaimTime;

    if (timeSinceLastClaim < FAUCET_COOLDOWN) {
      const timeRemaining = FAUCET_COOLDOWN - timeSinceLastClaim;
      const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

      return res.status(429).json({
        error: "Faucet cooldown active",
        message: `Please wait ${hoursRemaining} hour(s) before claiming again`,
        timeRemainingMs: timeRemaining,
        nextClaimTime: lastClaimTime + FAUCET_COOLDOWN,
      });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
      });
    }

    // Credit faucet amount
    const newBalance = wallet.usdtBalance + FAUCET_AMOUNT;

    // Generate faucet transaction hash
    const faucetTxHash = `faucet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          usdtBalance: newBalance,
          totalDeposit: wallet.totalDeposit + FAUCET_AMOUNT,
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          amount: FAUCET_AMOUNT,
          balanceAfter: newBalance,
          txHash: faucetTxHash,
          fromAddress: "TESTNET_FAUCET",
          status: "confirmed",
          confirmedAt: new Date(),
          metadata: JSON.stringify({
            source: "faucet",
            claimedAt: new Date().toISOString(),
          }),
        },
      }),
    ]);

    // Update cooldown
    lastClaimTimes.set(userId, now);

    console.log(`[Faucet] User ${userId} claimed ${FAUCET_AMOUNT} USDT`);

    res.json({
      success: true,
      amount: FAUCET_AMOUNT,
      newBalance,
      txHash: faucetTxHash,
      message: `Successfully claimed ${FAUCET_AMOUNT} USDT from testnet faucet!`,
      nextClaimTime: now + FAUCET_COOLDOWN,
    });
  } catch (error: any) {
    console.error("[Faucet] Error claiming:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/faucet/history
 * Get faucet claim history for user
 */
router.get("/history", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const claims = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        fromAddress: "TESTNET_FAUCET",
        type: "DEPOSIT",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json({
      claims: claims.map((c) => ({
        amount: c.amount,
        txHash: c.txHash,
        claimedAt: c.confirmedAt || c.createdAt,
      })),
      total: claims.length,
    });
  } catch (error: any) {
    console.error("[Faucet] Error getting history:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
