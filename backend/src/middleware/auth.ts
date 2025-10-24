import type { Request, Response, NextFunction } from "express"

export interface AuthRequest extends Request {
  userAddress?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const signature = req.headers["x-signature"] as string
  const address = req.headers["x-address"] as string

  if (!signature || !address) {
    return res.status(401).json({ error: "Missing authentication headers" })
  }

  // TODO: Verify signature
  req.userAddress = address
  next()
}
