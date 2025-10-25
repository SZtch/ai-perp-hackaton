// src/services/ton-testnet-service.ts
import axios from "axios";
import { Address } from "@ton/core";
import { prisma } from "../db";

// TON Testnet Configuration
const TON_API = process.env.TON_API_ENDPOINT || "https://testnet.toncenter.com/api/v2";
const TON_API_KEY = process.env.TON_API_KEY || "";
const PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS || "";

interface TonTransaction {
  hash: string;
  lt: string;
  from: string;
  to: string;
  value: string;
  message?: string;
  timestamp: number;
}

interface JettonTransfer {
  from: string;
  to: string;
  amount: string;
  jettonWallet: string;
  timestamp: number;
}

/**
 * TON Testnet Service
 * Handles all interactions with TON blockchain testnet
 */
export class TonTestnetService {
  private apiKey: string;
  private baseUrl: string;
  private platformAddress: string;

  constructor() {
    this.apiKey = TON_API_KEY;
    this.baseUrl = TON_API;
    this.platformAddress = PLATFORM_WALLET_ADDRESS;
  }

  /**
   * Get TON balance for an address
   */
  async getTonBalance(address: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/getAddressBalance`, {
        params: { address },
        headers: this.apiKey ? { "X-API-Key": this.apiKey } : {},
      });

      if (response.data.ok && response.data.result) {
        // Convert nanoTON to TON
        return parseInt(response.data.result) / 1e9;
      }
      return 0;
    } catch (error: any) {
      console.error("[TON] Error getting balance:", error.message);
      return 0;
    }
  }

  /**
   * Get transaction details by hash
   */
  async getTransaction(txHash: string): Promise<TonTransaction | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/getTransactions`, {
        params: {
          address: this.platformAddress,
          limit: 100,
        },
        headers: this.apiKey ? { "X-API-Key": this.apiKey } : {},
      });

      if (response.data.ok && response.data.result) {
        const txs = response.data.result;
        // Find transaction by hash (simplified - in production use proper indexing)
        const tx = txs.find((t: any) => t.transaction_id?.hash === txHash);

        if (tx) {
          return {
            hash: tx.transaction_id?.hash || "",
            lt: tx.transaction_id?.lt || "",
            from: tx.in_msg?.source || "",
            to: tx.in_msg?.destination || "",
            value: tx.in_msg?.value || "0",
            message: tx.in_msg?.message || "",
            timestamp: tx.utime || 0,
          };
        }
      }
      return null;
    } catch (error: any) {
      console.error("[TON] Error getting transaction:", error.message);
      return null;
    }
  }

  /**
   * Verify if a transaction exists and is confirmed
   */
  async verifyTransaction(txHash: string, expectedAmount: number): Promise<boolean> {
    try {
      const tx = await this.getTransaction(txHash);
      if (!tx) return false;

      // Verify transaction is to platform address
      if (tx.to.toLowerCase() !== this.platformAddress.toLowerCase()) {
        console.log("[TON] Transaction not to platform address");
        return false;
      }

      // Verify amount (convert from nanoTON)
      const txAmount = parseInt(tx.value) / 1e9;
      const tolerance = 0.001; // 0.001 TON tolerance

      if (Math.abs(txAmount - expectedAmount) > tolerance) {
        console.log("[TON] Amount mismatch:", { expected: expectedAmount, actual: txAmount });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("[TON] Error verifying transaction:", error.message);
      return false;
    }
  }

  /**
   * Monitor deposits to platform wallet
   * This should run as a background job
   */
  async monitorDeposits(): Promise<void> {
    try {
      console.log("[TON] Monitoring deposits...");

      // Get recent transactions to platform wallet
      const response = await axios.get(`${this.baseUrl}/getTransactions`, {
        params: {
          address: this.platformAddress,
          limit: 10,
        },
        headers: this.apiKey ? { "X-API-Key": this.apiKey } : {},
      });

      if (!response.data.ok || !response.data.result) {
        return;
      }

      const transactions = response.data.result;

      // Process each incoming transaction
      for (const tx of transactions) {
        const txHash = tx.transaction_id?.hash;
        const inMsg = tx.in_msg;

        if (!txHash || !inMsg || !inMsg.source) continue;

        // Check if transaction already processed
        const existing = await prisma.transaction.findFirst({
          where: { txHash },
        });

        if (existing) continue;

        // Get user by TON address
        const user = await prisma.user.findUnique({
          where: { tonAddress: inMsg.source },
        });

        if (!user) {
          console.log("[TON] Deposit from unknown address:", inMsg.source);
          continue;
        }

        // Calculate amount (from nanoTON)
        const amount = parseInt(inMsg.value || "0") / 1e9;

        if (amount < parseFloat(process.env.MIN_DEPOSIT_AMOUNT || "1")) {
          console.log("[TON] Deposit amount too small:", amount);
          continue;
        }

        // Credit user balance
        await this.processDeposit(user.id, amount, txHash, inMsg.source);

        console.log(`[TON] Processed deposit: ${amount} TON from ${user.tonAddress}`);
      }
    } catch (error: any) {
      console.error("[TON] Error monitoring deposits:", error.message);
    }
  }

  /**
   * Process a deposit - credit user balance
   */
  private async processDeposit(
    userId: string,
    amount: number,
    txHash: string,
    fromAddress: string
  ): Promise<void> {
    try {
      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { userId },
        });
      }

      // Calculate new balance
      const newBalance = wallet.usdtBalance + amount;

      // Update wallet and create transaction in a transaction
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId },
          data: {
            usdtBalance: newBalance,
            totalDeposit: wallet.totalDeposit + amount,
          },
        }),
        prisma.transaction.create({
          data: {
            userId,
            type: "DEPOSIT",
            amount,
            balanceAfter: newBalance,
            txHash,
            fromAddress,
            status: "confirmed",
            confirmedAt: new Date(),
          },
        }),
      ]);

      console.log(`[TON] Credited ${amount} USDT to user ${userId}`);
    } catch (error: any) {
      console.error("[TON] Error processing deposit:", error.message);
      throw error;
    }
  }

  /**
   * Send USDT withdrawal
   * Note: This is simplified - in production, use proper jetton transfer
   */
  async sendWithdrawal(
    userId: string,
    toAddress: string,
    amount: number
  ): Promise<string | null> {
    try {
      console.log(`[TON] Processing withdrawal: ${amount} USDT to ${toAddress}`);

      // Validate address
      try {
        Address.parse(toAddress);
      } catch {
        throw new Error("Invalid TON address");
      }

      // Get wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Check if sufficient balance
      const withdrawFee = parseFloat(process.env.WITHDRAW_FEE || "0.5");
      const totalNeeded = amount + withdrawFee;

      if (wallet.usdtBalance < totalNeeded) {
        throw new Error("Insufficient balance");
      }

      // In production, send actual jetton transfer here
      // For now, we'll simulate with a fake tx hash
      const fakeTxHash = `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update balance and create transaction
      const newBalance = wallet.usdtBalance - totalNeeded;

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId },
          data: {
            usdtBalance: newBalance,
            totalWithdraw: wallet.totalWithdraw + amount,
          },
        }),
        prisma.transaction.create({
          data: {
            userId,
            type: "WITHDRAW",
            amount: -amount,
            balanceAfter: newBalance,
            txHash: fakeTxHash,
            toAddress,
            status: "confirmed", // In production: "pending"
            confirmedAt: new Date(),
            metadata: JSON.stringify({ fee: withdrawFee }),
          },
        }),
      ]);

      console.log(`[TON] Withdrawal processed: ${fakeTxHash}`);
      return fakeTxHash;
    } catch (error: any) {
      console.error("[TON] Error sending withdrawal:", error.message);
      throw error;
    }
  }

  /**
   * Get deposit address for user
   * For now, returns platform address (user sends to platform with memo/message)
   * In production, might generate unique addresses per user
   */
  getDepositAddress(): string {
    return this.platformAddress || "PLATFORM_WALLET_NOT_CONFIGURED";
  }

  /**
   * Validate TON address format
   */
  isValidAddress(address: string): boolean {
    try {
      Address.parse(address);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const tonService = new TonTestnetService();

// Start deposit monitoring (if platform address configured)
if (PLATFORM_WALLET_ADDRESS) {
  // Monitor every 10 seconds
  const monitorInterval = parseInt(process.env.TX_CONFIRMATION_INTERVAL || "10000");
  setInterval(() => {
    tonService.monitorDeposits().catch(console.error);
  }, monitorInterval);

  console.log("[TON] Deposit monitoring started");
} else {
  console.warn("[TON] Platform wallet not configured - deposit monitoring disabled");
}
