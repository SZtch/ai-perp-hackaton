import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../lib/jwt";
import { prisma } from "../db";

// <<< add this block
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; address: string };
      token?: string; // Store token for logout
    }
  }
}
// >>>>

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });

  // Check if token is blacklisted
  const blacklisted = await prisma.tokenBlacklist.findUnique({
    where: { token }
  });
  if (blacklisted) {
    return res.status(401).json({ error: "token revoked" });
  }

  const parsed = verifyJwt<{ userId: string; address: string }>(token);
  if (!parsed) return res.status(401).json({ error: "invalid token" });

  req.user = parsed; // now typed
  req.token = token; // Store for logout
  next();
}
