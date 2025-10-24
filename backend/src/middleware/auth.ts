import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../lib/jwt";

// <<< add this block
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; address: string };
    }
  }
}
// >>>>

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });

  const parsed = verifyJwt<{ userId: string; address: string }>(token);
  if (!parsed) return res.status(401).json({ error: "invalid token" });

  req.user = parsed; // now typed
  next();
}
