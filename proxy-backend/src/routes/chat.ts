import { Router } from "express";
import { z } from "zod";
import { openai } from "../lib/openai.js";
import { PROMPTS, FALLBACK_PROMPT, type Mode, type Niche } from "../lib/prompts.js";
import { authMiddleware } from "../middleware/auth.js";
import { chatLimiter } from "../middleware/rateLimit.js";

export const chatRouter = Router();

const ChatSchema = z.object({
  message: z.string().min(1).max(1000),
  niche: z.string(),
  mode: z.enum(["sales", "support", "kb"]),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(10)
    .default([]),
});

chatRouter.post("/chat", chatLimiter, authMiddleware, async (req, res) => {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", details: parsed.error.message });
    return;
  }

  const { message, niche, mode, history } = parsed.data;
  const modePrompts = PROMPTS[mode as Mode];
  const systemPrompt = modePrompts?.[niche as Niche] ?? FALLBACK_PROMPT;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-10),
        { role: "user", content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err) {
    console.error("[chat] upstream error:", err);
    res.status(500).json({ error: "upstream_error" });
  }
});
