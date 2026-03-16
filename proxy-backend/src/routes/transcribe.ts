import { Router } from "express";
import multer from "multer";
import { toFile } from "openai";
import { openai } from "../lib/openai.js";
import { authMiddleware } from "../middleware/auth.js";
import { transcribeLimiter } from "../middleware/rateLimit.js";

export const transcribeRouter = Router();

const ALLOWED_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("invalid_audio_type"));
    }
  },
});

transcribeRouter.post(
  "/transcribe",
  transcribeLimiter,
  authMiddleware,
  upload.single("audio"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "invalid_audio" });
      return;
    }

    try {
      const file = await toFile(req.file.buffer, "audio.webm", { type: req.file.mimetype });

      const transcription = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file,
        language: "ru",
        response_format: "text",
      });

      res.json({ text: transcription });
    } catch (err) {
      console.error("[transcribe] upstream error:", err);
      res.status(500).json({ error: "upstream_error" });
    }
  },
);
