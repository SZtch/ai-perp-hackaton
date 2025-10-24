import { Router, type Request, type Response } from "express"
import axios from "axios"

const router = Router()

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001"

// Get AI predictions
router.get("/predict", async (req: Request, res: Response) => {
  try {
    const { lookback = 24 } = req.query

    const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
      lookback: Number.parseInt(lookback as string),
    })

    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// Get risk assessment
router.post("/risk-assessment", async (req: Request, res: Response) => {
  try {
    const { positionSize, leverage, collateral, isLong } = req.body

    const response = await axios.post(`${AI_SERVICE_URL}/risk-assessment`, {
      position_size: positionSize,
      leverage,
      collateral,
      is_long: isLong,
    })

    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// Get funding rate recommendation
router.get("/funding-rate", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/funding-rate`)
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// Publish AI model update
router.post("/publish", async (req: Request, res: Response) => {
  try {
    const { modelVersion, parameters } = req.body

    // TODO: Store model update in IPFS
    console.log("[AI] Publishing model update:", { modelVersion, parameters })

    res.json({ success: true, modelVersion })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router
