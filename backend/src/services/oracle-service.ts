import { pool } from "../db/init"

export class OracleService {
  async submitPrice(price: number, volatility: number, confidence: number) {
    try {
      const result = await pool.query(
        `INSERT INTO oracle_data (price, volatility, confidence, timestamp, source)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [price, volatility, confidence, Date.now(), "pingo-depin"],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Error submitting price:", error)
      throw error
    }
  }

  async getLatestPrice() {
    try {
      const result = await pool.query(`SELECT * FROM oracle_data ORDER BY timestamp DESC LIMIT 1`)
      return result.rows[0] || null
    } catch (error) {
      console.error("Error getting latest price:", error)
      throw error
    }
  }

  async getPriceHistory(limit = 100, offset = 0) {
    try {
      const result = await pool.query(`SELECT * FROM oracle_data ORDER BY timestamp DESC LIMIT $1 OFFSET $2`, [
        limit,
        offset,
      ])
      return result.rows
    } catch (error) {
      console.error("Error getting price history:", error)
      throw error
    }
  }

  async getAverageVolatility(hours = 24): Promise<number> {
    try {
      const result = await pool.query(
        `SELECT AVG(volatility) as avg_volatility FROM oracle_data
         WHERE timestamp > $1`,
        [Date.now() - hours * 3600 * 1000],
      )
      return result.rows[0]?.avg_volatility || 0
    } catch (error) {
      console.error("Error getting average volatility:", error)
      throw error
    }
  }
}
