// src/services/position-calculator.ts
import { prisma } from "../db";

/**
 * Position Calculator Service
 * Handles all position-related calculations:
 * - Unrealized PnL
 * - Liquidation Price
 * - Margin Ratio
 * - ROE (Return on Equity)
 */

export interface PositionWithPnL {
  id: string;
  userId: string;
  symbol: string;
  side: string; // LONG | SHORT
  size: number;
  leverage: number;
  entryPrice: number;
  margin: number;
  liquidationPrice: number;
  markPrice: number; // Current market price
  unrealizedPnl: number;
  realizedPnl: number;
  roe: number; // Return on Equity (%)
  marginRatio: number; // Current margin ratio (%)
  status: string;
  openedAt: Date;
  closedAt: Date | null;
}

export class PositionCalculator {
  /**
   * Calculate unrealized PnL for a position
   * Formula:
   * - LONG: (markPrice - entryPrice) * (size / entryPrice)
   * - SHORT: (entryPrice - markPrice) * (size / entryPrice)
   */
  calculateUnrealizedPnl(
    side: string,
    entryPrice: number,
    markPrice: number,
    size: number
  ): number {
    const quantity = size / entryPrice; // How many tokens

    if (side === "LONG") {
      return (markPrice - entryPrice) * quantity;
    } else if (side === "SHORT") {
      return (entryPrice - markPrice) * quantity;
    }

    return 0;
  }

  /**
   * Calculate liquidation price
   * Formula:
   * - LONG: entryPrice * (1 - 1/leverage)
   * - SHORT: entryPrice * (1 + 1/leverage)
   *
   * Example with 20x leverage:
   * - LONG can drop 5% before liquidation
   * - SHORT can rise 5% before liquidation
   */
  calculateLiquidationPrice(
    side: string,
    entryPrice: number,
    leverage: number
  ): number {
    const leverageRatio = 1 / leverage;

    if (side === "LONG") {
      // For LONG: price can drop by (1/leverage)% before liquidation
      return entryPrice * (1 - leverageRatio);
    } else if (side === "SHORT") {
      // For SHORT: price can rise by (1/leverage)% before liquidation
      return entryPrice * (1 + leverageRatio);
    }

    return 0;
  }

  /**
   * Calculate Return on Equity (ROE)
   * Formula: (unrealizedPnl / margin) * 100
   */
  calculateROE(unrealizedPnl: number, margin: number): number {
    if (margin === 0) return 0;
    return (unrealizedPnl / margin) * 100;
  }

  /**
   * Calculate margin ratio
   * Formula: (margin + unrealizedPnl) / (size) * 100
   */
  calculateMarginRatio(margin: number, unrealizedPnl: number, size: number): number {
    if (size === 0) return 0;
    return ((margin + unrealizedPnl) / size) * 100;
  }

  /**
   * Check if position should be liquidated
   */
  shouldLiquidate(
    side: string,
    liquidationPrice: number,
    markPrice: number
  ): boolean {
    if (side === "LONG") {
      // LONG liquidates when price drops below liquidation price
      return markPrice <= liquidationPrice;
    } else if (side === "SHORT") {
      // SHORT liquidates when price rises above liquidation price
      return markPrice >= liquidationPrice;
    }

    return false;
  }

  /**
   * Get latest price for a symbol from oracle
   */
  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      const tick = await prisma.oracleTick.findFirst({
        where: { symbol },
        orderBy: { timestamp: "desc" },
      });

      return tick?.price ?? null;
    } catch (error) {
      console.error(`[Position] Error getting price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get position with calculated PnL
   */
  async getPositionWithPnL(positionId: string): Promise<PositionWithPnL | null> {
    try {
      const position = await prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position) return null;

      // Get current mark price
      const markPrice = await this.getLatestPrice(position.symbol);
      if (markPrice === null) {
        throw new Error(`No price available for ${position.symbol}`);
      }

      // Calculate unrealized PnL
      const unrealizedPnl = this.calculateUnrealizedPnl(
        position.side,
        position.entryPrice,
        markPrice,
        position.size
      );

      // Calculate ROE
      const roe = this.calculateROE(unrealizedPnl, position.margin);

      // Calculate margin ratio
      const marginRatio = this.calculateMarginRatio(
        position.margin,
        unrealizedPnl,
        position.size
      );

      return {
        ...position,
        markPrice,
        unrealizedPnl,
        roe,
        marginRatio,
      };
    } catch (error) {
      console.error("[Position] Error getting position with PnL:", error);
      return null;
    }
  }

  /**
   * Get all open positions for a user with PnL
   */
  async getUserPositionsWithPnL(userId: string): Promise<PositionWithPnL[]> {
    try {
      const positions = await prisma.position.findMany({
        where: { userId, status: "open" },
        orderBy: { openedAt: "desc" },
      });

      const positionsWithPnL: PositionWithPnL[] = [];

      for (const position of positions) {
        const markPrice = await this.getLatestPrice(position.symbol);
        if (markPrice === null) continue;

        const unrealizedPnl = this.calculateUnrealizedPnl(
          position.side,
          position.entryPrice,
          markPrice,
          position.size
        );

        const roe = this.calculateROE(unrealizedPnl, position.margin);
        const marginRatio = this.calculateMarginRatio(
          position.margin,
          unrealizedPnl,
          position.size
        );

        positionsWithPnL.push({
          ...position,
          markPrice,
          unrealizedPnl,
          roe,
          marginRatio,
        });
      }

      return positionsWithPnL;
    } catch (error) {
      console.error("[Position] Error getting user positions:", error);
      return [];
    }
  }

  /**
   * Calculate required margin for a new position
   */
  calculateRequiredMargin(size: number, leverage: number): number {
    return size / leverage;
  }

  /**
   * Check if user has sufficient balance for trade
   */
  async canOpenPosition(
    userId: string,
    size: number,
    leverage: number,
    fee: number
  ): Promise<{ ok: boolean; reason?: string }> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        return { ok: false, reason: "Wallet not found" };
      }

      const requiredMargin = this.calculateRequiredMargin(size, leverage);
      const totalRequired = requiredMargin + fee;
      const available = wallet.usdtBalance - wallet.lockedMargin;

      if (available < totalRequired) {
        return {
          ok: false,
          reason: `Insufficient balance. Required: ${totalRequired.toFixed(2)} USDT, Available: ${available.toFixed(2)} USDT`,
        };
      }

      return { ok: true };
    } catch (error) {
      console.error("[Position] Error checking balance:", error);
      return { ok: false, reason: "Error checking balance" };
    }
  }

  /**
   * Check all open positions for liquidation
   * Returns positions that should be liquidated
   */
  async checkLiquidations(): Promise<PositionWithPnL[]> {
    try {
      const openPositions = await prisma.position.findMany({
        where: { status: "open" },
      });

      const toLiquidate: PositionWithPnL[] = [];

      for (const position of openPositions) {
        const markPrice = await this.getLatestPrice(position.symbol);
        if (markPrice === null) continue;

        if (this.shouldLiquidate(position.side, position.liquidationPrice, markPrice)) {
          const unrealizedPnl = this.calculateUnrealizedPnl(
            position.side,
            position.entryPrice,
            markPrice,
            position.size
          );

          toLiquidate.push({
            ...position,
            markPrice,
            unrealizedPnl,
            roe: this.calculateROE(unrealizedPnl, position.margin),
            marginRatio: this.calculateMarginRatio(
              position.margin,
              unrealizedPnl,
              position.size
            ),
          });
        }
      }

      return toLiquidate;
    } catch (error) {
      console.error("[Position] Error checking liquidations:", error);
      return [];
    }
  }
}

// Export singleton instance
export const positionCalculator = new PositionCalculator();
