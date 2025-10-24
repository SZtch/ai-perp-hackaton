import * as jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_secret";

export function signJwt(payload: { userId: string; address: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyJwt<T = any>(token: string): T | null {
  try { return jwt.verify(token, SECRET) as T; } catch { return null; }
}
