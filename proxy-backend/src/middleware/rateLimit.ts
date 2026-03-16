import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;

export const chatLimiter = rateLimit({
  windowMs,
  max: 10,
  message: { error: "rate_limit_exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const transcribeLimiter = rateLimit({
  windowMs,
  max: 5,
  message: { error: "rate_limit_exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const speakLimiter = rateLimit({
  windowMs,
  max: 10,
  message: { error: "rate_limit_exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});
