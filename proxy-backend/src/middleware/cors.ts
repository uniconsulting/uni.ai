import cors from "cors";

export const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGIN ?? "https://uni.ai",
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Internal-Key"],
});
