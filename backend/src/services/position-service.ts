import { pool } from "../db/init"

export class PositionService {
  async createPosition(
    userAddress: string,
    size: number,
    entryPrice: number,
    leverage: number,
    collateral: number,
    isLong: boolean,
  ) {
    try {
      const result = await pool.query(
        `INSERT INTO positions (user_address, size, entry_price, leverage, collateral, is_long, opened_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userAddress, size, entryPrice, leverage, collateral, isLong, Date.now(), "open"],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Error creating position:", error)
      throw error
    }
  }

  async getPositions(userAddress: string) {
    try {
      const result = await pool.query(`SELECT * FROM positions WHERE user_address = $1 AND status = 'open'`, [
        userAddress,
      ])
      return result.rows
    } catch (error) {
      console.error("Error getting positions:", error)
      throw error
    }
  }

  async closePosition(positionId: number, exitPrice: number) {
    try {
      const result = await pool.query(
        `UPDATE positions SET status = 'closed', closed_at = $1 WHERE id = $2 RETURNING *`,
        [Date.now(), positionId],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Error closing position:", error)
      throw error
    }
  }

  async calculatePnL(position: any, currentPrice: number): Promise<number> {
    const priceDiff = currentPrice - position.entry_price
    const pnl = position.is_long ? priceDiff : -priceDiff
    return (pnl * position.size) / position.entry_price
  }

  async getUserPnL(userAddress: string) {
    try {
      const positions = await this.getPositions(userAddress)
      let totalPnL = 0

      for (const position of positions) {
        // TODO: Get current price from oracle
        const currentPrice = 50000
        const pnl = await this.calculatePnL(position, currentPrice)
        totalPnL += pnl
      }

      return {
        realized: 0,
        unrealized: totalPnL,
        total: totalPnL,
      }
    } catch (error) {
      console.error("Error calculating user PnL:", error)
      throw error
    }
  }
}
