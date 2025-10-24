import { Router, type Request, type Response } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  // @ts-ignore  (atau pakai augmentation types – lihat langkah 6 opsional)
  if (!req.user) return res.status(401).json({ error: "unauthorized" });

  const rows = await prisma.position.findMany({
    // @ts-ignore
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(rows);
});

export default router;
