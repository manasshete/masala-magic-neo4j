import { Router } from "express";
import { seedDemoData, DEMO_USER_ID } from "../services/demoSeed";

const router = Router();

router.post("/demo/load", async (req, res) => {
  try {
    const userId = (req.body?.userId as string) || DEMO_USER_ID;
    await seedDemoData(userId);
    res.json({ ok: true, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
