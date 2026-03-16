import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./middleware/cors.js";
import { chatRouter } from "./routes/chat.js";
import { transcribeRouter } from "./routes/transcribe.js";
import { speakRouter } from "./routes/speak.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set("trust proxy", 1);

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.use("/api", chatRouter);
app.use("/api", transcribeRouter);
app.use("/api", speakRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

app.listen(PORT, () => {
  console.log(`uni-proxy listening on port ${PORT}`);
});
