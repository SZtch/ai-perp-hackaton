// src/routes/wallet.ts
import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { tonService } from "../services/ton-testnet-service";
import { z } from "zod";

const router = Router();

// Type for authenticated request
type AuthedRequest = Request & {
  user?: { userId: string; address: string };
};

// ============================================
// GET /api/wallet - Get wallet balance & info
// ============================================
router.get("/", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: req.user.userId },
      });
    }

    // Get open positions to calculate equity
    const positions = await prisma.position.findMany({
      where: {
        userId: req.user.userId,
        status: "open",
      },
    });

    // Calculate total unrealized PnL (simplified - should use position service)
    let totalUnrealizedPnl = 0;
    for (const pos of positions) {
      // Get mark price
      const tick = await prisma.oracleTick.findFirst({
        where: { symbol: pos.symbol },
        orderBy: { timestamp: "desc" },
      });

      if (tick) {
        const quantity = pos.size / pos.entryPrice;
        const pnl =
          pos.side === "LONG"
            ? (tick.price - pos.entryPrice) * quantity
            : (pos.entryPrice - tick.price) * quantity;
        totalUnrealizedPnl += pnl;
      }
    }

    const equity = wallet.usdtBalance + totalUnrealizedPnl;
    const available = wallet.usdtBalance - wallet.lockedMargin;

    res.json({
      usdtBalance: wallet.usdtBalance,
      lockedMargin: wallet.lockedMargin,
      balance: wallet.usdtBalance, // Alias for compatibility
      locked: wallet.lockedMargin, // Alias for compatibility
      available,
      equity,
      unrealizedPnl: totalUnrealizedPnl,
      totalDeposit: wallet.totalDeposit,
      totalWithdraw: wallet.totalWithdraw,
      depositAddress: tonService.getDepositAddress(),
    });
  } catch (error: any) {
    console.error("[Wallet] Error getting wallet:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/wallet/deposit - Get deposit info
// ============================================
const depositSchema = z.object({
  amount: z.number().positive().optional(),
});

router.post("/deposit", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const depositAddress = tonService.getDepositAddress();

    // Generate QR code data (user can scan to send)
    const qrData = `ton://transfer/${depositAddress}`;

    res.json({
      depositAddress,
      qrCode: qrData,
      amount: parsed.data.amount,
      memo: `DEPOSIT-${req.user.userId}`,
      instructions: [
        "1. Open your TON wallet (Tonkeeper, etc.)",
        "2. Send TEST USDT to the address above",
        "3. Wait for confirmation (usually 10-30 seconds)",
        "4. Your balance will update automatically",
      ],
      note: "This is TESTNET - use TEST USDT only!",
    });
  } catch (error: any) {
    console.error("[Wallet] Error generating deposit:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/wallet/deposit/confirm - Manual deposit confirmation
// ============================================
const confirmDepositSchema = z.object({
  txHash: z.string().min(1),
  amount: z.number().positive(),
});

router.post("/deposit/confirm", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const parsed = confirmDepositSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { txHash, amount } = parsed.data;

    // Check if transaction already processed
    const existing = await prisma.transaction.findFirst({
      where: { txHash },
    });

    if (existing) {
      return res.status(400).json({ error: "Transaction already processed" });
    }

    // Verify transaction on TON blockchain
    const verified = await tonService.verifyTransaction(txHash, amount);
    if (!verified) {
      return res.status(400).json({
        error: "Transaction verification failed. Please check tx hash and amount.",
      });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: req.user.userId },
      });
    }

    // Credit balance
    const newBalance = wallet.usdtBalance + amount;

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: req.user.userId },
        data: {
          usdtBalance: newBalance,
          totalDeposit: wallet.totalDeposit + amount,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: req.user.userId,
          type: "DEPOSIT",
          amount,
          balanceAfter: newBalance,
          txHash,
          fromAddress: req.user.address,
          status: "confirmed",
          confirmedAt: new Date(),
        },
      }),
    ]);

    res.json({
      success: true,
      newBalance,
      amount,
      txHash,
    });
  } catch (error: any) {
    console.error("[Wallet] Error confirming deposit:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/wallet/withdraw - Withdraw funds
// ============================================
const withdrawSchema = z.object({
  amount: z.number().positive(),
  toAddress: z.string().min(10),
});

router.post("/withdraw", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const parsed = withdrawSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { amount, toAddress } = parsed.data;

    // Validate TON address
    if (!tonService.isValidAddress(toAddress)) {
      return res.status(400).json({ error: "Invalid TON address" });
    }

    // Check minimum withdrawal
    const minWithdraw = parseFloat(process.env.MIN_WITHDRAW_AMOUNT || "1");
    if (amount < minWithdraw) {
      return res.status(400).json({
        error: `Minimum withdrawal amount is ${minWithdraw} USDT`,
      });
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Check if sufficient balance
    const withdrawFee = parseFloat(process.env.WITHDRAW_FEE || "0.5");
    const totalNeeded = amount + withdrawFee;
    const available = wallet.usdtBalance - wallet.lockedMargin;

    if (available < totalNeeded) {
      return res.status(400).json({
        error: "Insufficient balance",
        required: totalNeeded,
        available,
      });
    }

    // Process withdrawal via TON service
    const txHash = await tonService.sendWithdrawal(req.user.userId, toAddress, amount);

    if (!txHash) {
      return res.status(500).json({ error: "Withdrawal failed" });
    }

    res.json({
      success: true,
      txHash,
      amount,
      fee: withdrawFee,
      total: totalNeeded,
      toAddress,
      status: "confirmed", // In production: "pending"
    });
  } catch (error: any) {
    console.error("[Wallet] Error processing withdrawal:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/wallet/transactions - Get transaction history
// ============================================
router.get("/transactions", async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as string | undefined;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json(transactions);
  } catch (error: any) {
    console.error("[Wallet] Error getting transactions:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
