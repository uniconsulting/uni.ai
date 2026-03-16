import { Router } from "express";
import { Readable } from "stream";
import { z } from "zod";
import { streamSpeech } from "../lib/elevenlabs.js";
import { authMiddleware } from "../middleware/auth.js";
import { speakLimiter } from "../middleware/rateLimit.js";

export const speakRouter = Router();

const SpeakSchema = z.object({
  text: z.string().min(1).max(500),
});

speakRouter.post("/speak", speakLimiter, authMiddleware, async (req, res) => {
  const parsed = SpeakSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", details: parsed.error.message });
    return;
  }

  try {
    const audioStream = await streamSpeech(parsed.data.text);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    Readable.fromWeb(audioStream as import("stream/web").ReadableStream).pipe(res);
  } catch (err) {
    console.error("[speak] upstream error:", err);
    res.status(500).json({ error: "upstream_error" });
  }
});
