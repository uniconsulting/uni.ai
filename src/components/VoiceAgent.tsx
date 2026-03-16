"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mic, Square } from "lucide-react";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";
import { fetchReply, transcribeAudio, fetchSpeechBlob, type HistoryItem } from "@/lib/chat-api";

// ── Константы ────────────────────────────────────────────────────────────────

const PILLS = [
  "Ремонт коммерческих помещений",
  "Автосервис",
  "Обслуживание мобильных устройств",
  "Стоматологическая клиника",
  "Груминг",
  "Производство (b2b)",
  "Онлайн-школа",
] as const;

type Niche = (typeof PILLS)[number];
type Mode = "sales" | "support" | "kb";

const MODE_LABEL: Record<Mode, string> = {
  sales: "Отдел продаж",
  support: "Тех-поддержка",
  kb: "Справочник",
};

// VAD
const SPEECH_THRESH = 0.018;  // RMS выше → речь
const SILENCE_THRESH = 0.010; // RMS ниже → тишина
const SILENCE_DELAY = 1300;   // мс тишины → стоп запись
const MIN_BLOB_SIZE = 800;    // байт: меньше → игнор
const VAD_INTERVAL = 80;      // мс между замерами

// ── Типы ─────────────────────────────────────────────────────────────────────

type Status = "idle" | "listening" | "recording" | "processing" | "playing";
type Turn = { role: "user" | "ai"; text: string };

const STATUS_LABEL: Record<Status, string> = {
  idle: "Нажмите, чтобы начать",
  listening: "Слушаю...",
  recording: "Записываю вашу речь",
  processing: "Думаю...",
  playing: "ЮНИ отвечает",
};

// ── Dropdown ──────────────────────────────────────────────────────────────────

function NicheDropdown({
  niche,
  onChange,
  disabled,
}: {
  niche: Niche;
  onChange: (n: Niche) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-2xl bg-accent-3 px-4 py-2 text-[12px] font-semibold text-text ring-1 ring-text/10 disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="max-w-[130px] truncate">{niche}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text/60 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 min-w-max overflow-hidden rounded-2xl bg-accent-3 ring-1 ring-text/10"
        >
          {PILLS.map((item) => (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={item === niche}
              onClick={() => { onChange(item); setOpen(false); }}
              className={
                item === niche
                  ? "flex w-full px-4 py-2 text-left text-[12px] font-semibold text-text bg-bg"
                  : "flex w-full px-4 py-2 text-left text-[12px] font-semibold text-text hover:bg-bg/60"
              }
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── VoiceWidget ───────────────────────────────────────────────────────────────

function VoiceWidget() {
  const [niche, setNiche] = useState<Niche>("Автосервис");
  const [mode, setMode] = useState<Mode>("sales");
  const [status, setStatus] = useState<Status>("idle");
  const [volume, setVolume] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ── Refs (живут весь цикл сессии) ────────────────────────────────────────
  const activeRef      = useRef(false);
  const statusRef      = useRef<Status>("idle");
  const nicheRef       = useRef<Niche>(niche);
  const modeRef        = useRef<Mode>(mode);
  const historyRef     = useRef<HistoryItem[]>([]);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const vadTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef= useRef<ReturnType<typeof setTimeout> | null>(null);

  const recorderRef    = useRef<MediaRecorder | null>(null);
  const chunksRef      = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const speechStartRef = useRef(0);

  const audioElRef     = useRef<HTMLAudioElement | null>(null);
  const turnsEndRef    = useRef<HTMLDivElement | null>(null);

  // Синхронизируем niche/mode в refs (чтобы читать актуальные из замыканий)
  useEffect(() => { nicheRef.current = niche; }, [niche]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const setStatusSync = (s: Status) => {
    statusRef.current = s;
    setStatus(s);
  };

  // ── Scroll транскрипта ────────────────────────────────────────────────────
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  // ── Сброс при смене ниши/режима ───────────────────────────────────────────
  useEffect(() => {
    historyRef.current = [];
    setTurns([]);
    setError(null);
  }, [niche, mode]);

  // ── Запись речи ───────────────────────────────────────────────────────────

  const beginRecording = () => {
    if (isRecordingRef.current || !streamRef.current) return;
    clearSilence();

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => { handleRecordingDone(mimeType); };

    recorderRef.current = recorder;
    recorder.start();
    isRecordingRef.current = true;
    speechStartRef.current = Date.now();
    setStatusSync("recording");
  };

  const endRecording = () => {
    clearSilence();
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  const clearSilence = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // ── Обработка записи ──────────────────────────────────────────────────────

  const handleRecordingDone = async (mimeType: string) => {
    isRecordingRef.current = false;
    if (!activeRef.current) return;

    const blob = new Blob(chunksRef.current, { type: mimeType });
    if (blob.size < MIN_BLOB_SIZE) {
      if (activeRef.current) setStatusSync("listening");
      return;
    }

    setStatusSync("processing");

    try {
      const text = await transcribeAudio(blob);
      if (!text.trim() || !activeRef.current) {
        if (activeRef.current) setStatusSync("listening");
        return;
      }

      setTurns((t) => [...t.slice(-9), { role: "user", text: text.trim() }]);

      const reply = await fetchReply(
        text.trim(),
        nicheRef.current,
        modeRef.current,
        historyRef.current.slice(-10),
      );

      if (!activeRef.current) return;

      historyRef.current = [
        ...historyRef.current,
        { role: "user" as const, content: text.trim() },
        { role: "assistant" as const, content: reply },
      ].slice(-20);

      setTurns((t) => [...t.slice(-9), { role: "ai", text: reply }]);
      setError(null);

      // TTS
      setStatusSync("playing");
      const audioBlob = await fetchSpeechBlob(reply);
      if (!activeRef.current) return;

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioElRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioElRef.current = null;
        if (activeRef.current) setStatusSync("listening");
      };

      await audio.play();
    } catch (err) {
      console.error("[voice]", err);
      if (activeRef.current) {
        setError("Ошибка соединения. Говорите снова.");
        setStatusSync("listening");
      }
    }
  };

  // ── VAD loop (setInterval) ────────────────────────────────────────────────

  const startVad = () => {
    const analyser = analyserRef.current!;
    const data = new Uint8Array(analyser.fftSize);

    vadTimerRef.current = setInterval(() => {
      if (!activeRef.current) return;

      const st = statusRef.current;
      if (st === "processing" || st === "playing") {
        // Пока обрабатываем или воспроизводим — не слушаем
        return;
      }

      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      setVolume(rms);

      if (rms > SPEECH_THRESH) {
        // Речь
        clearSilence();
        if (!isRecordingRef.current) beginRecording();
      } else if (rms < SILENCE_THRESH && isRecordingRef.current && !silenceTimerRef.current) {
        // Тишина — ждём SILENCE_DELAY мс, потом стопаем
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          endRecording();
        }, SILENCE_DELAY);
      }
    }, VAD_INTERVAL);
  };

  // ── Управление сессией ────────────────────────────────────────────────────

  const startSession = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      activeRef.current = true;

      setStatusSync("listening");
      startVad();
    } catch {
      setError("Нет доступа к микрофону.");
    }
  };

  const stopSession = () => {
    activeRef.current = false;

    // VAD
    if (vadTimerRef.current) { clearInterval(vadTimerRef.current); vadTimerRef.current = null; }
    clearSilence();

    // Запись
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    isRecordingRef.current = false;

    // Аудио
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }

    // AudioContext
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;

    // Микрофон
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setVolume(0);
    setStatusSync("idle");
  };

  // Cleanup при unmount
  useEffect(() => () => { stopSession(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Анимация ──────────────────────────────────────────────────────────────

  const isActive = status !== "idle";
  // Нормализуем volume (0→1) для анимации колец
  const volNorm = Math.min(volume / SPEECH_THRESH, 1);

  // Цвет кнопки
  const btnColor =
    status === "idle" ? "bg-accent-1 hover:scale-105 shadow-lg"
    : status === "playing" || status === "processing" ? "bg-accent-2"
    : "bg-accent-1";

  return (
    <div className="w-full">
      <div className="rounded-[33px] bg-gradient-to-r from-accent-1 to-accent-2 p-[1px]">
        <div className="relative overflow-hidden rounded-3xl bg-accent-3">
          <div className="flex h-[520px] flex-col md:h-[620px]">

            {/* Шапка desktop */}
            <div className="hidden bg-bg px-4 py-3 md:block">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="justify-self-start">
                  <NicheDropdown niche={niche} onChange={setNiche} disabled={isActive} />
                </div>
                <div className="justify-self-center text-center leading-none">
                  <div className="text-[13px] font-semibold text-text">ЮНИ.ai</div>
                  <div className="mt-1 text-[11px] font-medium text-text/50">голосовой агент</div>
                </div>
                <div className="justify-self-end">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-accent-3 ring-1 ring-text/10">
                    <img
                      src={withBasePath("/brand/uni-logo.svg")}
                      alt="ЮНИ"
                      className="h-[120%] w-[120%] object-contain"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Шапка mobile */}
            <div className="bg-bg px-4 py-3 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <NicheDropdown niche={niche} onChange={setNiche} disabled={isActive} />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-3 ring-1 ring-text/10">
                  <img
                    src={withBasePath("/brand/uni-logo.svg")}
                    alt="ЮНИ"
                    className="h-[120%] w-[120%] object-contain"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Центральная зона */}
            <div className="flex flex-1 flex-col items-center justify-around px-6 py-6">

              {/* Переключатель режима */}
              <div className="inline-flex rounded-2xl bg-bg p-1">
                {(["sales", "support", "kb"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={isActive}
                    onClick={() => setMode(m)}
                    className={
                      m === mode
                        ? "rounded-2xl bg-accent-1 px-4 py-2 text-[11px] font-semibold text-bg"
                        : "rounded-2xl px-4 py-2 text-[11px] font-semibold text-text/70 disabled:opacity-40"
                    }
                  >
                    {MODE_LABEL[m]}
                  </button>
                ))}
              </div>

              {/* Орб + кнопка */}
              <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

                {/* Внешнее свечение — большой blur, дышит в idle */}
                <div
                  className={`absolute rounded-full ${!isActive ? "animate-pulse" : ""}`}
                  style={{
                    width: 200 + volNorm * 50,
                    height: 200 + volNorm * 50,
                    background: "radial-gradient(circle, var(--color-accent-1) 0%, transparent 65%)",
                    opacity: isActive ? 0.18 + volNorm * 0.14 : 0.10,
                    filter: "blur(32px)",
                    transition: `width ${VAD_INTERVAL}ms linear, height ${VAD_INTERVAL}ms linear, opacity 400ms`,
                  }}
                />

                {/* Среднее свечение */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 138 + volNorm * 30,
                    height: 138 + volNorm * 30,
                    background: "radial-gradient(circle, var(--color-accent-2) 0%, var(--color-accent-1) 40%, transparent 70%)",
                    opacity: isActive ? 0.28 + volNorm * 0.18 : 0.10,
                    filter: "blur(16px)",
                    transition: `width ${VAD_INTERVAL}ms linear, height ${VAD_INTERVAL}ms linear, opacity 400ms`,
                  }}
                />

                {/* Чёткое внутреннее кольцо (только активно) */}
                {isActive && (
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 108 + volNorm * 18,
                      height: 108 + volNorm * 18,
                      border: "1px solid var(--color-accent-1)",
                      opacity: 0.25 + volNorm * 0.45,
                      transition: `width ${VAD_INTERVAL}ms linear, height ${VAD_INTERVAL}ms linear, opacity 80ms`,
                    }}
                  />
                )}

                {/* Кнопка-ядро */}
                <button
                  type="button"
                  onClick={isActive ? stopSession : startSession}
                  className="relative z-10 flex h-[84px] w-[84px] items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, var(--color-accent-1) 0%, var(--color-accent-2) 100%)",
                    boxShadow: isActive
                      ? `0 0 ${16 + volNorm * 24}px color-mix(in srgb, var(--color-accent-1) 70%, transparent), 0 0 ${32 + volNorm * 48}px color-mix(in srgb, var(--color-accent-1) 30%, transparent)`
                      : "0 0 16px color-mix(in srgb, var(--color-accent-1) 40%, transparent)",
                    transition: `box-shadow ${VAD_INTERVAL}ms linear`,
                  }}
                  aria-label={isActive ? "Завершить разговор" : "Начать разговор"}
                >
                  {isActive ? (
                    <Square className="h-6 w-6 fill-white text-white" />
                  ) : (
                    <Mic className="h-7 w-7 text-white" />
                  )}
                </button>
              </div>

              {/* Статус-текст */}
              <div className="text-center">
                <div className={`text-[13px] font-semibold tracking-wide ${isActive ? "text-text" : "text-text/40"}`}>
                  {STATUS_LABEL[status]}
                </div>
                {error && (
                  <div className="mt-2 text-[11px] font-medium text-accent-1">{error}</div>
                )}
              </div>
            </div>

            {/* Транскрипт */}
            {turns.length > 0 && (
              <div className="bg-bg px-4 pb-5 pt-3">
                <div className="max-h-[150px] space-y-2 overflow-y-auto">
                  {turns.slice(-5).map((t, i) => (
                    <div
                      key={i}
                      className={t.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={
                          t.role === "user"
                            ? "max-w-[82%] rounded-2xl bg-accent-1 px-3 py-2 text-[11px] font-medium text-bg"
                            : "max-w-[82%] rounded-2xl bg-accent-3 px-3 py-2 text-[11px] font-medium text-text"
                        }
                      >
                        {t.text}
                      </div>
                    </div>
                  ))}
                  <div ref={turnsEndRef} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Экспорт ───────────────────────────────────────────────────────────────────

export function VoiceAgent() {
  return (
    <section id="voice-agent" className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 hidden h-[320px] w-px -translate-x-1/2 bg-text/10 md:block lg:h-[340px]"
      />

      <Container className="relative z-10 px-6 py-12 md:px-10 md:py-14 lg:px-12">

        {/* Mobile header */}
        <div className="md:hidden">
          <div className="text-[18px] font-medium opacity-70 hover-accent">голос</div>
          <div className="mt-4">
            <h2 className="font-extrabold leading-[0.95] tracking-tight text-[26px]">
              <span className="block">Говорите —</span>
              <span className="block">бот отвечает голосом</span>
            </h2>
          </div>
          <div className="mt-8">
            <VoiceWidget />
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:block">
          <div className="grid gap-10 md:grid-cols-2 md:gap-0">
            <div className="md:pr-12">
              <h2 className="font-extrabold leading-[0.95] tracking-tight text-[22px] md:text-[26px] lg:text-[28px]">
                <span className="block">Говорите —</span>
                <span className="block">бот отвечает голосом</span>
              </h2>
              <p className="mt-6 max-w-xs text-[14px] font-medium leading-relaxed text-text/55">
                Голосовой AI-агент с авто-детектом речи. Сказали — он услышал, ответил, продолжает слушать.
              </p>
            </div>
            <div className="md:pl-12">
              <div className="flex items-start justify-end">
                <div className="hover-accent text-[18px] font-medium opacity-70">demo-голос</div>
              </div>
              <div className="mt-10 min-h-[260px]" />
            </div>
          </div>
          <div className="mt-12 md:mt-14">
            <VoiceWidget />
          </div>
        </div>

      </Container>
    </section>
  );
}
