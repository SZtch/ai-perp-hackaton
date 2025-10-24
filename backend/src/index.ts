import express, { type Express, type Request, type Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { TonClient4 } from "@ton/ton"
import oracleRoutes from "./routes/oracle"
import aiRoutes from "./routes/ai"
import keeperRoutes from "./routes/keeper"
import tradingRoutes from "./routes/trading"
import { initializeDatabase } from "./db/init"

dotenv.config()

const app: Express = express()
const PORT = process.env.BACKEND_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize TON client
const tonClient = new TonClient4({
  endpoint: process.env.TON_RPC_URL || "https://testnet.toncenter.com/api/v2/jsonRPC",
})

// Store in app context
app.locals.tonClient = tonClient

// Initialize database
initializeDatabase().catch(console.error)

// Routes
app.use("/api/oracle", oracleRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/keeper", keeperRoutes)
app.use("/api/trading", tradingRoutes)

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`SuperAI Perp Backend running on port ${PORT}`)
})

export default app
