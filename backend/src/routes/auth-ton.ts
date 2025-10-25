import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { prisma } from "../db";
import { signJwt, verifyJwt } from "../lib/jwt";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /auth/ton-proof/payload -> kasih nonce
router.get("/ton-proof/payload", async (_req: Request, res: Response) => {
  const payload = crypto.randomBytes(24).toString("base64url");
  await prisma.tonProofNonce.create({ data: { payload } });
  res.json({ payload, ttlSec: 300 });
});

// bentuk payload yang dikirim wallet balik ke server
const proofSchema = z.object({
  address: z.string().min(10),
  proof: z.object({
    domain: z.object({ value: z.string() }).optional(),
    payload: z.string(),
    timestamp: z.number().int(),
    signature: z.string(), // base64
  }),
});

// DEV-ONLY verifier (accept all, hanya cek nonce fresh)
async function verifyTonProofDev(address: string, payload: string): Promise<boolean> {
  const found = await prisma.tonProofNonce.findUnique({ where: { payload } });
  if (!found || found.usedAt) return false;
  const ageMs = Date.now() - found.createdAt.getTime();
  if (ageMs > 5 * 60 * 1000) return false; // >5 menit kadaluarsa
  await prisma.tonProofNonce.update({ where: { payload }, data: { usedAt: new Date() } });
  return true;
}

// POST /auth/ton-proof/verify -> buat user & JWT
router.post("/ton-proof/verify", async (req: Request, res: Response) => {
  try {
    const parsed = proofSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid body", issues: parsed.error.issues });

    const { address, proof } = parsed.data;

    // TODO: ganti ke verifikasi asli ed25519 sesuai spec TON
    const ok = await verifyTonProofDev(address, proof.payload);
    if (!ok) return res.status(401).json({ error: "proof failed" });

    const user = await prisma.user.upsert({
      where: { tonAddress: address },
      update: {},
      create: { tonAddress: address },
    });

    const token = signJwt({ userId: user.id, address });
    res.json({ ok: true, token, user: { id: user.id, address } });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /auth/logout -> revoke token (add to blacklist)
router.post("/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = req.token;
    if (!token) return res.status(400).json({ error: "no token found" });

    // Decode JWT to get expiry time
    const decoded = verifyJwt<{ userId: string; address: string; exp?: number }>(token);
    if (!decoded) return res.status(401).json({ error: "invalid token" });

    // Calculate expiry date (JWT exp is in seconds, Date needs milliseconds)
    const expiresAt = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours if no exp

    // Add token to blacklist
    await prisma.tokenBlacklist.create({
      data: {
        token,
        userId: decoded.userId,
        reason: "user_logout",
        expiresAt
      }
    });

    res.json({
      ok: true,
      message: "Successfully logged out"
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
