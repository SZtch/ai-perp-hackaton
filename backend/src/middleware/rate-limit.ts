import type { Request, Response, NextFunction } from "express"

const requestCounts = new Map<string, number[]>()
const WINDOW_MS = 60000 // 1 minute
const MAX_REQUESTS = 100

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown"
  const now = Date.now()

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, [])
  }

  const timestamps = requestCounts.get(ip)!
  const recentRequests = timestamps.filter((t) => now - t < WINDOW_MS)

  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests" })
  }

  recentRequests.push(now)
  requestCounts.set(ip, recentRequests)
  next()
}
