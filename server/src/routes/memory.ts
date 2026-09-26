import { Router } from "express";
import { extractMemories } from "../services/extraction";
import { storeExtraction, getAllMemories, getMemoryById } from "../services/memoryStore";

const router = Router();

router.post("/memory", async (req, res) => {
  try {
    const { userId, message } = req.body as { userId?: string; message?: string };
    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }
    const extraction = await extractMemories(message);
    const created = await storeExtraction(userId, extraction);
    res.json({ stored: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/memories", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId query param is required" });
    const memories = await getAllMemories(userId);
    res.json({ memories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/memories/:id", async (req, res) => {
  try {
    const { node, related } = await getMemoryById(req.params.id);
    if (!node) return res.status(404).json({ error: "Memory not found" });
    res.json({ memory: node, related });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
