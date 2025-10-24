import pg from "pg"

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oracle_data (
        id SERIAL PRIMARY KEY,
        price BIGINT NOT NULL,
        volatility INT NOT NULL,
        confidence INT NOT NULL,
        timestamp BIGINT NOT NULL,
        source VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        entry_price BIGINT NOT NULL,
        leverage INT NOT NULL,
        collateral BIGINT NOT NULL,
        is_long BOOLEAN NOT NULL,
        opened_at BIGINT NOT NULL,
        closed_at BIGINT,
        pnl BIGINT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS funding_history (
        id SERIAL PRIMARY KEY,
        funding_rate BIGINT NOT NULL,
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS user_balances (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(255) NOT NULL UNIQUE,
        balance BIGINT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

export { pool }
