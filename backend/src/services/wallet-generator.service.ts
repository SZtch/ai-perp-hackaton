// src/services/wallet-generator.service.ts
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4, TonClient, Address } from "@ton/ton";
import { prisma } from "../db";

/**
 * Wallet Generator Service
 * Generates unique TON wallet addresses for each user
 */

const TON_ENDPOINT = process.env.TON_API_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC";
const TON_API_KEY = process.env.TON_API_KEY || "";

export class WalletGeneratorService {
  private client: TonClient;

  constructor() {
    this.client = new TonClient({
      endpoint: TON_ENDPOINT,
      apiKey: TON_API_KEY,
    });
  }

  /**
   * Generate a new unique TON wallet address for a user
   * Returns the wallet address and encrypted mnemonic
   */
  async generateUniqueWallet(userId: string): Promise<{
    address: string;
    encryptedMnemonic: string;
  }> {
    try {
      console.log(`[WalletGen] Generating unique wallet for user: ${userId}`);

      // Generate new mnemonic (24 words)
      const mnemonics = await mnemonicNew(24);

      // Derive key pair from mnemonic
      const keyPair = await mnemonicToPrivateKey(mnemonics);

      // Create wallet contract (v4R2 is the latest stable version)
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
      });

      // Get wallet address
      const address = wallet.address.toString({
        urlSafe: true,
        bounceable: false,
        testOnly: true, // Set to false for mainnet
      });

      console.log(`[WalletGen] Generated address: ${address}`);

      // Encrypt mnemonic for storage (simple base64 for hackathon)
      // In production: use proper encryption with KMS or similar
      const encryptedMnemonic = this.encryptMnemonic(mnemonics.join(" "));

      return {
        address,
        encryptedMnemonic,
      };
    } catch (error: any) {
      console.error("[WalletGen] Error generating wallet:", error);
      throw error;
    }
  }

  /**
   * Get or create deposit address for a user
   */
  async getOrCreateDepositAddress(userId: string): Promise<string> {
    try {
      // Check if user already has a deposit address
      let wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      // If wallet doesn't exist or doesn't have deposit address, create one
      if (!wallet || !wallet.depositAddress) {
        const { address, encryptedMnemonic } = await this.generateUniqueWallet(userId);

        if (!wallet) {
          // Create new wallet with deposit address
          wallet = await prisma.wallet.create({
            data: {
              userId,
              depositAddress: address,
              depositAddressMnemonic: encryptedMnemonic,
            },
          });
        } else {
          // Update existing wallet with deposit address
          wallet = await prisma.wallet.update({
            where: { userId },
            data: {
              depositAddress: address,
              depositAddressMnemonic: encryptedMnemonic,
            },
          });
        }

        console.log(`[WalletGen] Created deposit address for user ${userId}: ${address}`);
      }

      return wallet.depositAddress!;
    } catch (error: any) {
      console.error("[WalletGen] Error getting/creating deposit address:", error);
      throw error;
    }
  }

  /**
   * Check balance of a deposit address
   */
  async checkDepositBalance(address: string): Promise<{
    tonBalance: number;
    usdtBalance: number;
  }> {
    try {
      const addr = Address.parse(address);
      const balance = await this.client.getBalance(addr);

      // Convert from nanotons to TON
      const tonBalance = Number(balance) / 1e9;

      // For USDT Jetton balance, we'd need to query the Jetton wallet
      // This is more complex and requires Jetton wallet address calculation
      // For hackathon: simplified to 0
      const usdtBalance = 0;

      return { tonBalance, usdtBalance };
    } catch (error: any) {
      console.error("[WalletGen] Error checking balance:", error);
      return { tonBalance: 0, usdtBalance: 0 };
    }
  }

  /**
   * Monitor all user deposit addresses for new deposits
   */
  async monitorAllDeposits(): Promise<void> {
    try {
      console.log("[WalletGen] Monitoring all deposit addresses...");

      // Get all wallets with deposit addresses
      const wallets = await prisma.wallet.findMany({
        where: {
          depositAddress: { not: null },
        },
        select: {
          userId: true,
          depositAddress: true,
          lastDepositCheck: true,
        },
      });

      console.log(`[WalletGen] Found ${wallets.length} wallets to monitor`);

      // Check each wallet for new deposits
      for (const wallet of wallets) {
        if (!wallet.depositAddress) continue;

        try {
          await this.checkForNewDeposits(wallet.userId, wallet.depositAddress);
        } catch (error: any) {
          console.error(
            `[WalletGen] Error checking deposits for ${wallet.depositAddress}:`,
            error.message
          );
        }
      }

      console.log("[WalletGen] Deposit monitoring complete");
    } catch (error: any) {
      console.error("[WalletGen] Error in monitorAllDeposits:", error);
    }
  }

  /**
   * Check for new deposits to a specific address
   */
  private async checkForNewDeposits(userId: string, depositAddress: string): Promise<void> {
    try {
      const addr = Address.parse(depositAddress);

      // Get recent transactions
      const transactions = await this.client.getTransactions(addr, { limit: 10 });

      // Get last check time
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      const lastCheck = wallet?.lastDepositCheck || new Date(0);

      // Process each transaction
      for (const tx of transactions) {
        const txTime = new Date(tx.now * 1000);

        // Skip if we've already processed this transaction
        if (txTime <= lastCheck) continue;

        // Check if transaction has incoming value
        const inMsg = tx.inMessage;
        if (!inMsg) continue;

        const value = inMsg.info.type === "internal" ? inMsg.info.value.coins : 0n;
        if (value <= 0n) continue;

        // Convert to TON
        const tonAmount = Number(value) / 1e9;

        // For hackathon: assume 1 TON = 5 USDT (simplified)
        // In production: use oracle price
        const usdtAmount = tonAmount * 5;

        console.log(`[WalletGen] New deposit detected: ${tonAmount} TON (${usdtAmount} USDT) for user ${userId}`);

        // Get transaction hash
        const txHash = tx.hash().toString("hex");

        // Check if already processed
        const existing = await prisma.transaction.findFirst({
          where: { txHash },
        });

        if (existing) {
          console.log(`[WalletGen] Transaction already processed: ${txHash}`);
          continue;
        }

        // Credit user balance
        await this.creditDeposit(userId, usdtAmount, txHash, tonAmount);
      }

      // Update last check time
      await prisma.wallet.update({
        where: { userId },
        data: { lastDepositCheck: new Date() },
      });
    } catch (error: any) {
      console.error(`[WalletGen] Error checking deposits for ${depositAddress}:`, error);
    }
  }

  /**
   * Credit deposit to user balance
   */
  private async creditDeposit(
    userId: string,
    usdtAmount: number,
    txHash: string,
    tonAmount: number
  ): Promise<void> {
    try {
      // Get current wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        console.error(`[WalletGen] Wallet not found for user ${userId}`);
        return;
      }

      const newBalance = wallet.usdtBalance + usdtAmount;

      // Update wallet and create transaction record
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId },
          data: {
            usdtBalance: newBalance,
            totalDeposit: wallet.totalDeposit + usdtAmount,
          },
        }),
        prisma.transaction.create({
          data: {
            userId,
            type: "DEPOSIT",
            amount: usdtAmount,
            balanceAfter: newBalance,
            txHash,
            status: "confirmed",
            confirmedAt: new Date(),
            metadata: JSON.stringify({
              tonAmount,
              autoDetected: true,
              conversionRate: 5, // 1 TON = 5 USDT
            }),
          },
        }),
      ]);

      console.log(`[WalletGen] ✅ Credited ${usdtAmount} USDT to user ${userId}`);
    } catch (error: any) {
      console.error(`[WalletGen] Error crediting deposit:`, error);
    }
  }

  /**
   * Simple mnemonic encryption (for hackathon)
   * In production: use proper encryption with KMS
   */
  private encryptMnemonic(mnemonic: string): string {
    // For hackathon: base64 encoding
    // In production: use AES-256 or similar with proper key management
    return Buffer.from(mnemonic).toString("base64");
  }

  /**
   * Decrypt mnemonic
   */
  private decryptMnemonic(encrypted: string): string {
    return Buffer.from(encrypted, "base64").toString("utf-8");
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
export const walletGeneratorService = new WalletGeneratorService();

// Start automatic deposit monitoring if enabled
if (process.env.ENABLE_DEPOSIT_MONITORING === "true") {
  const monitorInterval = parseInt(process.env.DEPOSIT_MONITOR_INTERVAL || "30000"); // 30 seconds

  setInterval(() => {
    walletGeneratorService.monitorAllDeposits().catch(console.error);
  }, monitorInterval);

  console.log("[WalletGen] ✅ Automatic deposit monitoring enabled");
} else {
  console.log("[WalletGen] Deposit monitoring disabled - set ENABLE_DEPOSIT_MONITORING=true to enable");
}
