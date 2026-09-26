import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat";
import memoryRouter from "./routes/memory";
import graphRouter from "./routes/graph";
import decisionsRouter from "./routes/decisions";
import outcomesRouter from "./routes/outcomes";
import conflictsRouter from "./routes/conflicts";
import demoRouter from "./routes/demo";
import { ensureConstraints, verifyConnection } from "./services/neo4j";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const connected = await verifyConnection();
    res.json({ ok: true, neo4j: connected });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

app.use("/api/chat", chatRouter);
app.use("/api", memoryRouter);
app.use("/api", graphRouter);
app.use("/api", decisionsRouter);
app.use("/api", outcomesRouter);
app.use("/api", conflictsRouter);
app.use("/api", demoRouter);

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await ensureConstraints();
    console.log("Neo4j constraints ensured.");
  } catch (err) {
    console.warn("Could not ensure Neo4j constraints yet:", (err as Error).message);
  }
  app.listen(PORT, () => {
    console.log(`Memora server listening on port ${PORT}`);
  });
}

start();
