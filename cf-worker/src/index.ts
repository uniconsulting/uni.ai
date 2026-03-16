import { getPrompt } from "./prompts.js";

export interface Env {
  OPENAI_API_KEY: string;
  ELEVENLABS_API_KEY: string;
  ELEVENLABS_VOICE_ID: string;
  INTERNAL_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

// ── CORS ─────────────────────────────────────────────────────────────────────

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Internal-Key",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResp(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleChat(req: Request, env: Env, origin: string): Promise<Response> {
  let body: { message?: unknown; niche?: unknown; mode?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResp({ error: "invalid_json" }, 400, origin);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 1000) {
    return jsonResp({ error: "validation_error" }, 400, origin);
  }

  const niche = typeof body.niche === "string" ? body.niche : undefined;
  const mode = typeof body.mode === "string" ? body.mode : undefined;

  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory
    .filter(
      (h): h is { role: string; content: string } =>
        h &&
        typeof h === "object" &&
        (h.role === "user" || h.role === "assistant") &&
        typeof h.content === "string",
    )
    .slice(-10);

  const systemPrompt = getPrompt(mode, niche);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.4",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    console.error("[chat] OpenAI error:", res.status, await res.text());
    return jsonResp({ error: "upstream_error" }, 500, origin);
  }

  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  const reply = data.choices[0]?.message?.content ?? "";
  return jsonResp({ reply }, 200, origin);
}

async function handleTranscribe(req: Request, env: Env, origin: string): Promise<Response> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonResp({ error: "invalid_form" }, 400, origin);
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File)) {
    return jsonResp({ error: "invalid_audio" }, 400, origin);
  }

  if (audio.size > 10 * 1024 * 1024) {
    return jsonResp({ error: "file_too_large" }, 400, origin);
  }

  const fd = new FormData();
  fd.append("file", audio, "audio.webm");
  fd.append("model", "whisper-1");
  fd.append("language", "ru");
  fd.append("response_format", "text");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: fd,
  });

  if (!res.ok) {
    console.error("[transcribe] OpenAI error:", res.status, await res.text());
    return jsonResp({ error: "upstream_error" }, 500, origin);
  }

  const text = await res.text();
  return jsonResp({ text }, 200, origin);
}

async function handleSpeak(req: Request, env: Env, origin: string): Promise<Response> {
  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResp({ error: "invalid_json" }, 400, origin);
  }

  const text = typeof body.text === "string" ? body.text.slice(0, 500) : "";
  if (!text) {
    return jsonResp({ error: "validation_error" }, 400, origin);
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    console.error("[speak] ElevenLabs error:", res.status, await res.text());
    return jsonResp({ error: "upstream_error" }, 500, origin);
  }

  return new Response(res.body, {
    headers: { "Content-Type": "audio/mpeg", ...corsHeaders(origin) },
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN ?? "https://uni.ai";

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Auth — пропускаем только /health без ключа
    if (url.pathname !== "/health") {
      const key = request.headers.get("X-Internal-Key");
      if (!key || key !== env.INTERNAL_API_KEY) {
        return jsonResp({ error: "unauthorized" }, 401, origin);
      }
    }

    const path = url.pathname;
    const method = request.method;

    if (method === "GET" && path === "/health") {
      return jsonResp({ status: "ok", ts: Date.now() }, 200, origin);
    }
    if (method === "POST" && path === "/api/chat") {
      return handleChat(request, env, origin);
    }
    if (method === "POST" && path === "/api/transcribe") {
      return handleTranscribe(request, env, origin);
    }
    if (method === "POST" && path === "/api/speak") {
      return handleSpeak(request, env, origin);
    }

    return jsonResp({ error: "not_found" }, 404, origin);
  },
};
