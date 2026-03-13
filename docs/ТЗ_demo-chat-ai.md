# ТЗ: AI Demo-Chat — GPT-5.4 + Whisper + ElevenLabs

**Проект:** uni.ai — лендинг AI-сотрудника для малого бизнеса
**Компонент:** `DemoChat` — интерактивный чат с реальным LLM
**Статус:** Замена stub-ответов на боевой AI-стек
**Дата:** 2026-03-13
**Уровень:** Senior AI Dev / Team Lead

---

## 1. Контекст и цели

### 1.1 Текущее состояние
Компонент `src/components/DemoChat.tsx` содержит полностью реализованный UI:
- Выбор ниши (7 вариантов) и роли (sales / support / kb)
- FAQ-пресеты, история сообщений, анимации
- Кнопка микрофона — UI есть, логика не реализована (`onClick={() => inputRef.current?.focus()}`)
- Функция `stubAnswer()` — заглушка, возвращает шаблонный текст

### 1.2 Цель
Заменить `stubAnswer()` на реальный AI-стек:
- **LLM:** GPT-5.4 (качество вывода уровня senior-консультанта)
- **STT:** OpenAI Whisper / `gpt-4o-transcribe` (голос → текст)
- **TTS:** ElevenLabs (текст → голос, человекоподобное звучание)

### 1.3 Ключевые ограничения
- Сайт деплоится как **статический экспорт** на GitHub Pages — нет Next.js API Routes
- **Запрещено** делать запросы к OpenAI/ElevenLabs напрямую с RU-сервера (блокировка аккаунта организации)
- Все AI-запросы проходят исключительно через прокси-сервер на Contabo VPS (EU)

---

## 2. Архитектура системы

```
┌─────────────────────────────────────────────────────────────┐
│                     Пользователь (RU)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│         GitHub Pages — uni.ai (статический фронтенд)        │
│         Next.js 16 · React 19 · TypeScript · Tailwind v4    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  DemoChat.tsx                        │   │
│  │  • текстовый ввод  →  POST /api/chat                │   │
│  │  • микрофон (Web Audio API) → POST /api/transcribe  │   │
│  │  • ответ бота → POST /api/speak → <audio> autoplay  │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + X-Internal-Key
┌──────────────────────────▼──────────────────────────────────┐
│              Contabo VPS — EU (proxy-backend)               │
│              Node.js 22 · Express 5 · TypeScript            │
│                                                             │
│  POST /api/chat        →  rate-limit → validate → OpenAI   │
│  POST /api/transcribe  →  rate-limit → validate → OpenAI   │
│  POST /api/speak       →  rate-limit → validate → ElevenLabs│
│                                                             │
│  • CORS: разрешён только origin uni.ai                      │
│  • Helmet, express-rate-limit, zod-валидация               │
│  • OpenAI видит только IP Contabo (EU) — RU IP никогда     │
└──────┬───────────────────────────────────┬──────────────────┘
       │ HTTPS                             │ HTTPS
┌──────▼──────────┐             ┌──────────▼───────────┐
│   OpenAI API    │             │   ElevenLabs API      │
│   gpt-5.4       │             │   TTS streaming       │
│   gpt-4o-       │             │   (выбранный голос)   │
│   transcribe    │             └──────────────────────┘
└─────────────────┘
```

---

## 3. Компонент 1: Proxy Backend (Contabo VPS)

### 3.1 Стек и окружение

```
OS:         Ubuntu 24.04 LTS
Runtime:    Node.js 22 LTS
PM:         PM2 (автозапуск, логи, мониторинг)
Reverse proxy: Nginx (SSL termination, Let's Encrypt)
Domain:     proxy.uni.ai (или api.uni.ai)
Port:       3001 (внутренний), 443 (внешний через Nginx)
```

### 3.2 Зависимости

```json
{
  "dependencies": {
    "express": "^5.0.1",
    "openai": "^5.x",
    "cors": "^2.8.5",
    "helmet": "^8.x",
    "express-rate-limit": "^7.x",
    "multer": "^2.x",
    "zod": "^4.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/express": "^5.x",
    "@types/cors": "^2.x",
    "@types/multer": "^1.x",
    "tsx": "^4.x"
  }
}
```

### 3.3 Переменные окружения (.env)

```env
# Безопасность
INTERNAL_API_KEY=<uuid-v4-секрет>   # фронтенд передаёт в заголовке X-Internal-Key
ALLOWED_ORIGIN=https://uni.ai       # CORS whitelist

# OpenAI
OPENAI_API_KEY=<ключ>

# ElevenLabs
ELEVENLABS_API_KEY=<ключ>
ELEVENLABS_VOICE_ID=<id-голоса>     # выбранный голос из EL dashboard

# Лимиты
RATE_LIMIT_WINDOW_MS=60000          # 1 минута
RATE_LIMIT_MAX=20                   # макс запросов с одного IP за окно

PORT=3001
NODE_ENV=production
```

### 3.4 Структура файлов

```
proxy-backend/
├── src/
│   ├── index.ts          # точка входа, Express app
│   ├── middleware/
│   │   ├── auth.ts       # проверка X-Internal-Key
│   │   ├── rateLimit.ts  # express-rate-limit настройки
│   │   └── cors.ts       # CORS только для ALLOWED_ORIGIN
│   ├── routes/
│   │   ├── chat.ts       # POST /api/chat
│   │   ├── transcribe.ts # POST /api/transcribe
│   │   └── speak.ts      # POST /api/speak
│   └── lib/
│       ├── openai.ts     # инициализация OpenAI клиента
│       └── elevenlabs.ts # обёртка над ElevenLabs REST API
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── ecosystem.config.js   # PM2 конфиг
```

### 3.5 Endpoint: POST /api/chat

**Назначение:** Отправить текстовое сообщение, получить ответ GPT-5.4

**Request:**
```typescript
// Headers
X-Internal-Key: <INTERNAL_API_KEY>
Content-Type: application/json

// Body (zod schema)
{
  message: string,        // текст от пользователя (max 1000 символов)
  niche: string,          // выбранная ниша (одна из 7)
  mode: "sales" | "support" | "kb",
  history: Array<{        // последние N сообщений для контекста
    role: "user" | "assistant",
    content: string
  }>                      // max 10 элементов
}
```

**Response:**
```typescript
// 200 OK
{ reply: string }

// 400 Bad Request
{ error: "validation_error", details: string }

// 429 Too Many Requests
{ error: "rate_limit_exceeded" }

// 500 Internal Server Error
{ error: "upstream_error" }
```

**System prompt логика:**
```typescript
const SYSTEM_PROMPTS: Record<Mode, Record<Niche, string>> = {
  sales: {
    "Автосервис": `Ты AI-менеджер по продажам автосервиса. Твоя задача:
      вежливо и уверенно отвечать на вопросы клиентов, называть примерные
      цены, предлагать записаться. Отвечай как живой, опытный менеджер.
      Стиль: профессиональный, дружелюбный, конкретный. Макс. 3 абзаца.`,
    // ... аналогично для каждой ниши
  },
  support: { ... },
  kb: { ... }
}
```

**Реализация:**
```typescript
// routes/chat.ts
router.post("/chat", authMiddleware, async (req, res) => {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_error" });

  const { message, niche, mode, history } = parsed.data;
  const systemPrompt = SYSTEM_PROMPTS[mode][niche] ?? FALLBACK_PROMPT;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    messages: [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: message }
    ],
    max_tokens: 512,
    temperature: 0.7,
  });

  res.json({ reply: completion.choices[0].message.content });
});
```

---

### 3.6 Endpoint: POST /api/transcribe

**Назначение:** Конвертация аудио (WebM/Opus) в текст через Whisper

**Request:**
```
Content-Type: multipart/form-data
X-Internal-Key: <INTERNAL_API_KEY>

audio: <File>   // WebM/Opus, max 10MB, max 30 сек
```

**Response:**
```typescript
// 200 OK
{ text: string }

// 400 — файл не приложен или неверный формат
{ error: "invalid_audio" }
```

**Реализация:**
```typescript
// routes/transcribe.ts — multer memoryStorage (не сохраняем на диск)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    const allowed = ["audio/webm", "audio/ogg", "audio/mp4", "audio/wav"];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post("/transcribe", authMiddleware, upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "invalid_audio" });

  const file = toFile(req.file.buffer, "audio.webm", { type: req.file.mimetype });

  const transcription = await openai.audio.transcriptions.create({
    model: "gpt-4o-transcribe",
    file,
    language: "ru",
    response_format: "text"
  });

  res.json({ text: transcription });
});
```

---

### 3.7 Endpoint: POST /api/speak

**Назначение:** Синтез речи из текста через ElevenLabs

**Request:**
```typescript
// Headers
X-Internal-Key: <INTERNAL_API_KEY>
Content-Type: application/json

// Body
{ text: string }  // max 500 символов (EL лимит на бесплатном тарифе)
```

**Response:**
```
// 200 OK
Content-Type: audio/mpeg
// стриминг MP3-аудио напрямую клиенту (pipe)
```

**Реализация:**
```typescript
// lib/elevenlabs.ts
export async function streamSpeech(text: string): Promise<ReadableStream> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",  // поддерживает русский
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);
  return response.body!;
}

// routes/speak.ts
router.post("/speak", authMiddleware, async (req, res) => {
  const { text } = SpeakSchema.parse(req.body);
  res.setHeader("Content-Type", "audio/mpeg");
  const stream = await streamSpeech(text);
  Readable.fromWeb(stream).pipe(res);
});
```

---

### 3.8 Middleware: Auth

```typescript
// middleware/auth.ts
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers["x-internal-key"];
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
};
```

### 3.9 Nginx конфиг (схематично)

```nginx
server {
    listen 443 ssl http2;
    server_name proxy.uni.ai;

    ssl_certificate     /etc/letsencrypt/live/proxy.uni.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/proxy.uni.ai/privkey.pem;

    # Размер тела — для аудио-файлов
    client_max_body_size 12M;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Для стриминга TTS
        proxy_buffering off;
        proxy_read_timeout 60s;
    }
}
```

---

## 4. Компонент 2: Frontend (DemoChat.tsx)

### 4.1 Переменные окружения (GitHub Pages)

Добавить в `.env.local` и в GitHub Actions secrets:
```env
NEXT_PUBLIC_PROXY_URL=https://proxy.uni.ai
NEXT_PUBLIC_PROXY_KEY=<INTERNAL_API_KEY>  # публичный ключ — не секрет, но защищает от случайных запросов
```

> **Важно:** `NEXT_PUBLIC_PROXY_KEY` — это не OpenAI-ключ, а внутренний ключ прокси. Компрометация этого ключа не ведёт к утечке OpenAI-ключа (он хранится только на VPS).

### 4.2 Изменения в DemoChat.tsx

#### 4.2.1 Удалить `stubAnswer()`, добавить `sendToApi()`

```typescript
// Новый API-клиент (можно вынести в src/lib/chat-api.ts)
const PROXY = process.env.NEXT_PUBLIC_PROXY_URL!;
const KEY   = process.env.NEXT_PUBLIC_PROXY_KEY!;

async function fetchReply(
  message: string,
  niche: Niche,
  mode: Mode,
  history: Msg[]
): Promise<string> {
  const res = await fetch(`${PROXY}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Key": KEY,
    },
    body: JSON.stringify({
      message,
      niche,
      mode,
      history: history.slice(-10).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
    }),
    signal: AbortSignal.timeout(30_000), // 30 сек таймаут
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.reply as string;
}
```

#### 4.2.2 Обновить функцию `send()`

```typescript
const send = async (text: string) => {
  const t = text.trim();
  if (!t || typing) return;

  setMsgs((p) => [...p, { id: uid(), role: "user", text: t }]);
  setInput("");
  setTyping(true);
  setError(null);

  try {
    const reply = await fetchReply(t, niche, mode, msgs);
    setMsgs((p) => [...p, { id: uid(), role: "bot", text: reply }]);

    // TTS: озвучиваем ответ если включён голосовой режим
    if (voiceEnabled) {
      void playTTS(reply);
    }
  } catch (err) {
    setError("Не удалось получить ответ. Попробуйте ещё раз.");
  } finally {
    setTyping(false);
  }
};
```

#### 4.2.3 Новый state и refs

```typescript
// Добавить к существующим useState
const [error, setError] = useState<string | null>(null);
const [voiceEnabled, setVoiceEnabled] = useState(false);
const [isRecording, setIsRecording] = useState(false);

// Refs для Web Audio API
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef   = useRef<Blob[]>([]);
const audioRef         = useRef<HTMLAudioElement | null>(null);
```

#### 4.2.4 Реализация микрофона (STT)

```typescript
const startRecording = async () => {
  // Запрашиваем разрешение на микрофон
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Используем WebM/Opus — нативно поддерживается браузерами, принимается Whisper
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm";

  const recorder = new MediaRecorder(stream, { mimeType });
  audioChunksRef.current = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunksRef.current.push(e.data);
  };

  recorder.onstop = async () => {
    // Останавливаем треки микрофона
    stream.getTracks().forEach((t) => t.stop());

    const blob = new Blob(audioChunksRef.current, { type: mimeType });
    if (blob.size < 1000) return; // слишком короткая запись

    const formData = new FormData();
    formData.append("audio", blob, "voice.webm");

    try {
      setTyping(true);
      const res = await fetch(`${PROXY}/api/transcribe`, {
        method: "POST",
        headers: { "X-Internal-Key": KEY },
        body: formData,
        signal: AbortSignal.timeout(20_000),
      });

      const { text } = await res.json();
      if (text?.trim()) {
        // Автоматически отправляем распознанный текст
        send(text.trim());
      }
    } catch {
      setError("Не удалось распознать речь.");
      setTyping(false);
    }
  };

  mediaRecorderRef.current = recorder;
  recorder.start();
  setIsRecording(true);
};

const stopRecording = () => {
  mediaRecorderRef.current?.stop();
  setIsRecording(false);
};

const toggleRecording = () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording().catch(() => setError("Нет доступа к микрофону."));
  }
};
```

#### 4.2.5 Реализация TTS (ElevenLabs)

```typescript
const playTTS = async (text: string) => {
  // Обрезаем до 500 символов — лимит ElevenLabs
  const truncated = text.slice(0, 500);

  try {
    const res = await fetch(`${PROXY}/api/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": KEY,
      },
      body: JSON.stringify({ text: truncated }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) return;

    const audioBlob = await res.blob();
    const url = URL.createObjectURL(audioBlob);

    // Останавливаем предыдущее воспроизведение
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    await audio.play();

    audio.onended = () => URL.revokeObjectURL(url);
  } catch {
    // TTS — некритичная фича, ошибку не показываем пользователю
    console.warn("TTS error, continuing without audio");
  }
};
```

#### 4.2.6 UI изменения

**Кнопка микрофона** — заменить `onClick={() => inputRef.current?.focus()}` на:
```tsx
<button
  type="button"
  className={`flex h-10 w-10 items-center justify-center rounded-sm ${
    isRecording ? "bg-accent-1 animate-pulse" : "bg-bg"
  }`}
  aria-label={isRecording ? "Остановить запись" : "Записать голосовое"}
  onClick={toggleRecording}
>
  <Mic className={`h-4 w-4 ${isRecording ? "text-bg" : "text-text/60"}`} />
</button>
```

**Кнопка голоса** — тогл TTS (иконка Volume2 из lucide-react):
```tsx
<button
  type="button"
  onClick={() => setVoiceEnabled((v) => !v)}
  className={`flex h-10 w-10 items-center justify-center rounded-sm ${
    voiceEnabled ? "bg-accent-2" : "bg-bg"
  }`}
  aria-label={voiceEnabled ? "Выключить голос бота" : "Включить голос бота"}
>
  <Volume2 className={`h-4 w-4 ${voiceEnabled ? "text-bg" : "text-text/60"}`} />
</button>
```

**Сообщение об ошибке** (под строкой ввода, если `error !== null`):
```tsx
{error && (
  <p className="mt-2 text-[11px] font-medium text-accent-1">{error}</p>
)}
```

---

## 5. Системные промпты

### Структура промпта (для каждой ниши × роли = 21 промпт)

```typescript
// src/lib/prompts.ts (на proxy-backend)
export const PROMPTS: Record<Mode, Record<Niche, string>> = {
  sales: {
    "Автосервис": `
Ты — AI-менеджер по продажам автосервиса. Ты общаешься с потенциальным клиентом.
Твои задачи:
- Отвечать на вопросы о ценах, услугах, записи
- Называть конкретные цифры (примерные диапазоны цен)
- Мягко подводить к записи или оставлению контактов
- Упоминать гарантии и преимущества сервиса

Стиль: живой, профессиональный, без канцелярита. Короткие абзацы.
Длина ответа: 2–4 предложения, максимум 2 абзаца.
Отвечай только на русском языке.
    `.trim(),

    "Стоматологическая клиника": `
Ты — AI-администратор стоматологической клиники. Помогаешь клиентам.
Твои задачи:
- Рассказывать об услугах и примерных ценах
- Помогать с записью на приём
- Отвечать на вопросы о подготовке к процедурам

Стиль: доброжелательный, успокаивающий (пациенты часто боятся).
Длина ответа: 2–4 предложения, максимум 2 абзаца.
    `.trim(),

    // ... остальные ниши
  },

  support: {
    "Автосервис": `
Ты — AI-специалист технической поддержки автосервиса.
Твои задачи:
- Отвечать на вопросы о гарантии, документах, процессах
- Объяснять, как работают услуги сервиса
- Решать типичные проблемы и вопросы клиентов

Стиль: чёткий, информативный, конкретный. Используй нумерованные списки где уместно.
    `.trim(),
    // ...
  },

  kb: {
    "Автосервис": `
Ты — AI-справочник по автомобильному обслуживанию.
Твои задачи:
- Объяснять технические термины простым языком
- Рассказывать о видах услуг, их назначении
- Давать практические советы по уходу за авто

Стиль: образовательный, понятный для неспециалиста. Используй аналогии.
    `.trim(),
    // ...
  }
}
```

---

## 6. Безопасность

### 6.1 Слои защиты

| Угроза | Мера |
|--------|------|
| RU IP попадает в OpenAI | Proxy на EU VPS, прямых запросов нет |
| Злоупотребление proxy (DDoS, спам) | Rate limit 20 req/мин/IP, X-Internal-Key |
| Утечка OpenAI ключа | Ключ только в .env на VPS, никогда в коде |
| Prompt injection от пользователя | Сообщение пользователя — только `user` роль, system prompt неизменен |
| Высокий счёт OpenAI | `max_tokens: 512`, rate limit, мониторинг billing alerts |
| CORS атаки | `cors({ origin: "https://uni.ai" })` на прокси |

### 6.2 OpenAI — изоляция аккаунтов

```
❌ НЕ ДЕЛАТЬ: один OpenAI аккаунт для демо и прода
✅ ДЕЛАТЬ: отдельный аккаунт/Organization для демо-чата
```

- Создать отдельную Organization в OpenAI для демо-чата
- Billing limit: $50/месяц (жёсткий лимит через OpenAI dashboard)
- Email alerts при $25 и $45

### 6.3 Rate Limiting конфиг

```typescript
// middleware/rateLimit.ts
import rateLimit from "express-rate-limit";

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 минута
  max: 10,              // 10 сообщений/мин с одного IP
  message: { error: "rate_limit_exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const transcribeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,               // голосовых сообщений реже
  message: { error: "rate_limit_exceeded" },
});

export const speakLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "rate_limit_exceeded" },
});
```

---

## 7. Деплой

### 7.1 Proxy Backend (Contabo VPS)

```bash
# 1. Клонируем/копируем proxy-backend на VPS
scp -r ./proxy-backend user@contabo-vps:~/

# 2. Устанавливаем зависимости
cd proxy-backend && npm install

# 3. .env с реальными ключами
cp .env.example .env && nano .env

# 4. Сборка TypeScript
npm run build

# 5. PM2 запуск
pm2 start ecosystem.config.js
pm2 save && pm2 startup

# 6. Nginx + Let's Encrypt
certbot --nginx -d proxy.uni.ai

# 7. Проверка
curl -X POST https://proxy.uni.ai/api/chat \
  -H "X-Internal-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"тест","niche":"Автосервис","mode":"sales","history":[]}'
```

### 7.2 Frontend (GitHub Actions)

Добавить секреты в GitHub repo settings:
```
NEXT_PUBLIC_PROXY_URL   = https://proxy.uni.ai
NEXT_PUBLIC_PROXY_KEY   = <internal-key>
```

Обновить `.github/workflows/deploy.yml` — секреты уже будут доступны как `env` при сборке Next.js.

### 7.3 PM2 ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: "uni-proxy",
    script: "dist/index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "256M",
    env: { NODE_ENV: "production" }
  }]
}
```

---

## 8. UX-сценарии

### Сценарий A: Текстовый чат (основной)
1. Пользователь выбирает нишу и роль
2. Нажимает FAQ-пресет или вводит свой вопрос
3. Нажимает Enter или кнопку отправки
4. UI показывает `...печатает` (indeterminate)
5. Приходит ответ GPT-5.4, отображается с анимацией
6. *(опционально)* Если TTS включён — ответ озвучивается ElevenLabs

### Сценарий B: Голосовой ввод (STT)
1. Пользователь нажимает кнопку микрофона
2. Кнопка пульсирует красным, идёт запись
3. Повторное нажатие — запись останавливается
4. Whisper распознаёт речь → текст подставляется
5. Автоматически отправляется в чат
6. Далее — как Сценарий A

### Сценарий C: Голосовой вывод (TTS)
1. Пользователь включает тогл «голос бота» (Volume2 иконка)
2. После каждого ответа бота воспроизводится ElevenLabs аудио
3. Новый ответ прерывает предыдущее воспроизведение

### Сценарий D: Ошибка сети/API
1. Запрос завис на 30 сек — `AbortSignal.timeout(30_000)` бросает исключение
2. Под строкой ввода появляется: *«Не удалось получить ответ. Попробуйте ещё раз.»*
3. `typing = false`, кнопка отправки снова активна

---

## 9. Оценка стоимости

### OpenAI (GPT-5.4 + Whisper)
| Операция | Модель | Ориентировочная стоимость |
|----------|--------|--------------------------|
| Текстовый чат | gpt-5.4 | ~$0.01–0.03 за диалог |
| STT | gpt-4o-transcribe | ~$0.002–0.006 за сообщение |

### ElevenLabs
| Тариф | Символов/мес | Стоимость |
|-------|-------------|-----------|
| Free | 10,000 | $0 |
| Starter | 30,000 | $5/мес |
| Creator | 100,000 | $22/мес |

> Для демо-лендинга Starter ($5/мес) хватит с запасом.

### Contabo VPS
| Тариф | RAM | Стоимость |
|-------|-----|-----------|
| Cloud VPS 1 | 4 GB | ~€5.99/мес |

**Итого для демо:** ~€15–30/мес при умеренной нагрузке

---

## 10. Этапы реализации

### Этап 1 — Proxy Backend (2–3 ч)
- [ ] Создать репо `uni-proxy`, инициализировать TypeScript/Express
- [ ] Реализовать middleware: auth, CORS, rate-limit
- [ ] Endpoint `/api/chat` с системными промптами (21 комбинация)
- [ ] Endpoint `/api/transcribe` (multer + OpenAI Whisper)
- [ ] Endpoint `/api/speak` (ElevenLabs streaming)
- [ ] Деплой на Contabo, настройка Nginx + Let's Encrypt

### Этап 2 — Frontend интеграция (2–3 ч)
- [ ] Добавить `src/lib/chat-api.ts` с функциями fetchReply, transcribeAudio, playTTS
- [ ] Заменить `stubAnswer()` + обновить `send()` в DemoChat.tsx
- [ ] Реализовать toggleRecording (Web Audio API)
- [ ] Добавить кнопку тогл TTS + логику playTTS
- [ ] Добавить state error, isRecording, voiceEnabled
- [ ] Обновить UI кнопки микрофона и добавить Volume2 тогл
- [ ] Добавить отображение ошибок

### Этап 3 — Промпты и QA (2–3 ч)
- [ ] Написать системные промпты для всех 21 комбинации (7 ниш × 3 режима)
- [ ] Протестировать каждую нишу и режим
- [ ] Выбрать и настроить голос ElevenLabs (voice cloning или готовый RU голос)
- [ ] Проверить UX мобильного (iOS Safari — ограничения autoplay audio)
- [ ] Нагрузочное тестирование rate-limit

### Этап 4 — GitHub Actions + деплой (30 мин)
- [ ] Добавить secrets в GitHub repo
- [ ] Обновить deploy.yml (передача env vars при build)
- [ ] Деплой и smoke-test на проде

---

## 11. Известные ограничения и edge cases

| Ситуация | Решение |
|----------|---------|
| iOS Safari блокирует autoplay audio | TTS только по явному действию пользователя (тогл) — соответствует требованиям |
| MediaRecorder не поддерживается в старых браузерах | Graceful degradation: кнопка микрофона скрыта при `!navigator.mediaDevices` |
| ElevenLabs лимит символов | Обрезаем TTS-текст до 500 символов, полный текст остаётся в чате |
| GPT-5.4 rate limit upstream | Retry с экспоненциальным backoff (1 попытка, не DDoS) |
| Пользователь отправляет prompt injection | System prompt изолирован, user message — только `user` role, не `system` |
| Смена ниши/режима в середине диалога | История сбрасывается при смене (чистый контекст для нового режима) |

---

*Документ подготовлен для команды разработки. При возникновении вопросов — уточнять у архитектора до начала реализации.*
