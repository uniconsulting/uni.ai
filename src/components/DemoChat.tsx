"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { ChevronDown, Mic, SendHorizontal, Settings } from "lucide-react";

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
type Msg = { id: string; role: "user" | "bot"; text: string };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const MODE_LABEL: Record<Mode, string> = {
  sales: "Отдел продаж",
  support: "Тех-поддержка",
  kb: "Справочник",
};

const PRESETS: Record<Mode, Record<Niche, string[]>> = {
  sales: {
    "Автосервис": [
      "Здравствуйте, сколько стоит замена масла и фильт...",
      "Есть свободное окно на сегодня после 17:00?",
      "Даёте гарантию на работы и запчасти?",
    ],
    "Ремонт коммерческих помещений": [
      "Сколько стоит ремонт 100 м² под ключ?",
      "Какие сроки по объекту 200 м²?",
      "Можете выехать на замер на этой неделе?",
    ],
    "Обслуживание мобильных устройств": [
      "Сколько стоит замена дисплея iPhone 13?",
      "Сколько по времени занимает замена батареи?",
      "Даете гарантию на запчасти?",
    ],
    "Стоматологическая клиника": [
      "Сколько стоит чистка + консультация?",
      "Есть запись на вечер сегодня?",
      "Какие акции сейчас действуют?",
    ],
    "Груминг": [
      "Сколько стоит комплекс для шпица?",
      "Есть окно на выходных?",
      "Что входит в экспресс-уход?",
    ],
    "Производство (b2b)": [
      "Сделаете КП на партию 500 шт?",
      "Какие сроки производства?",
      "Есть образцы и сертификаты?",
    ],
    "Онлайн-школа": [
      "Какие тарифы и что входит?",
      "Можно ли начать с пробного урока?",
      "Какая программа и длительность курса?",
    ],
  },
  support: {
    "Автосервис": [
      "Как понять, что пора менять масло?",
      "Какие документы нужны для гарантии?",
      "Можно ли приехать без записи?",
    ],
    "Ремонт коммерческих помещений": [
      "Какие этапы работ и контроль качества?",
      "Как формируется смета?",
      "Какие условия по договору и оплате?",
    ],
    "Обслуживание мобильных устройств": [
      "Телефон не заряжается, что проверить?",
      "После падения не включается, что делать?",
      "Как проверить оригинальность дисплея?",
    ],
    "Стоматологическая клиника": [
      "Болит зуб, что можно сделать до приема?",
      "Как подготовиться к чистке?",
      "Есть ли противопоказания к отбеливанию?",
    ],
    "Груминг": [
      "Как часто стричь когти?",
      "Как подготовить питомца к грумингу?",
      "Что делать, если питомец боится?",
    ],
    "Производство (b2b)": [
      "Как оформить рекламацию?",
      "Какие требования к ТЗ/чертежам?",
      "Как происходит отгрузка и упаковка?",
    ],
    "Онлайн-школа": [
      "Не приходит письмо с доступом, что делать?",
      "Как сменить тариф/план?",
      "Где найти домашние задания?",
    ],
  },
  kb: {
    "Автосервис": [
      "Что такое ТО и что входит?",
      "Разница между диагностикой и осмотром",
      "Какие масла бывают и как выбрать?",
    ],
    "Ремонт коммерческих помещений": [
      "Черновые и чистовые работы: разница",
      "Как читается смета?",
      "Какие материалы лучше для офиса?",
    ],
    "Обслуживание мобильных устройств": [
      "Что такое TrueTone и зачем он?",
      "Разница оригинал/копия дисплея",
      "Как продлить жизнь батареи?",
    ],
    "Стоматологическая клиника": [
      "Кариес vs пульпит: отличие",
      "Профгигиена: что входит?",
      "Как выбрать щетку и пасту?",
    ],
    "Груминг": [
      "Типы шерсти и уход",
      "Колтуны: причины и профилактика",
      "Как выбрать шампунь для собаки?",
    ],
    "Производство (b2b)": [
      "MOQ: что это и как влияет на цену?",
      "Инкотермс простыми словами",
      "Сроки производства: из чего складываются?",
    ],
    "Онлайн-школа": [
      "Что такое модуль и как устроен курс?",
      "Как оценивать прогресс обучения?",
      "Зачем нужен куратор?",
    ],
  },
};

function stubAnswer(mode: Mode, niche: string, text: string) {
  const head =
    mode === "sales"
      ? "Ок, помогу как менеджер."
      : mode === "support"
        ? "Ок, помогу как тех-поддержка."
        : "Ок, отвечу как справочник.";
  return `${head}\n\nНиша: ${niche}.\nВопрос: ${text}\n\n(Демо-ответ. Позже тут будет ответ LLM по API.)`;
}

function DemoChatWidget({ initialNiche }: { initialNiche?: Niche }) {
  const [niche, setNiche] = useState<Niche>(initialNiche ?? "Автосервис");
  const [mode, setMode] = useState<Mode>("sales");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const presets = useMemo(() => PRESETS[mode][niche] ?? [], [mode, niche]);
  const empty = msgs.length === 0;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs.length, typing]);

  // синхронизация при смене initialNiche извне (клик по пилюле сверху)
  useEffect(() => {
    if (initialNiche) setNiche(initialNiche);
  }, [initialNiche]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;

    setMsgs((p) => [...p, { id: uid(), role: "user", text: t }]);
    setInput("");
    setTyping(true);

    const delay = 650 + Math.floor(Math.random() * 350);
    window.setTimeout(() => {
      setMsgs((p) => [...p, { id: uid(), role: "bot", text: stubAnswer(mode, niche, t) }]);
      setTyping(false);
    }, delay);
  };

  const pickPreset = (t: string) => {
    setInput(t);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="w-full">
      <div className="rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 p-[1px]">
        <div className="overflow-hidden rounded-xl bg-accent-3">
          {/* header */}
          <div className="bg-bg px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative rounded-full bg-accent-3 px-4 py-2 pr-9">
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value as Niche)}
                  className="appearance-none bg-transparent text-[12px] font-semibold text-text outline-none"
                >
                  {PILLS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/60" />
              </div>

              <div className="flex-1 text-center leading-none">
                <div className="text-[13px] font-semibold text-text">ЮНИ.ai</div>
                <div className="mt-1 text-[11px] font-medium text-text/50">
                  {typing ? "...печатает" : "в сети"}
                </div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-3 ring-1 ring-text/10">
                <div className="h-4 w-4 rounded-sm bg-accent-1" />
              </div>
            </div>
          </div>

          {/* body */}
          <div className="flex min-h-[520px] flex-col md:min-h-[620px]">
            <div ref={listRef} className="flex-1 overflow-auto px-6 py-7">
              {empty ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="text-[14px] font-semibold text-text">
                    Выберите нишу и роль, затем задайте вопрос
                  </div>
                  <div className="mt-2 text-[12px] font-medium text-text/55">
                    Для быстрого старта используйте FAQ-кнопки над строкой ввода.
                  </div>

                  <div className="mt-6 inline-flex rounded-full bg-bg p-1">
                    {(["sales", "support", "kb"] as const).map((m) => {
                      const active = m === mode;
                      return (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={
                            active
                              ? "rounded-full bg-accent-1 px-5 py-2 text-[12px] font-semibold text-bg"
                              : "rounded-full px-5 py-2 text-[12px] font-semibold text-text/70"
                          }
                        >
                          {MODE_LABEL[m]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {msgs.map((m) => (
                    <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={
                          m.role === "user"
                            ? "max-w-[78%] whitespace-pre-wrap rounded-2xl bg-accent-1 px-4 py-3 text-[12px] font-medium text-bg"
                            : "max-w-[78%] whitespace-pre-wrap rounded-2xl bg-bg px-4 py-3 text-[12px] font-medium text-text"
                        }
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-bg px-4 py-3 text-[12px] font-medium text-text/60">
                        ...печатает
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* footer */}
            <div className="bg-bg px-6 pb-6 pt-4">
              <div className="mb-3 flex flex-wrap gap-3">
                {presets.slice(0, 3).map((t) => (
                  <button
                    key={t}
                    onClick={() => pickPreset(t)}
                    className="rounded-full bg-accent-3 px-5 py-3 text-[12px] font-semibold text-text"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-3 rounded-xl bg-accent-3 px-4 py-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Сообщение"
                  rows={1}
                  className="min-h-[22px] max-h-[96px] w-full resize-none bg-transparent text-[12px] font-semibold text-text placeholder:text-text/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-bg"
                    aria-label="Записать голосовое"
                    onClick={() => inputRef.current?.focus()}
                  >
                    <Mic className="h-4 w-4 text-text/60" />
                  </button>

                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-1"
                    aria-label="Отправить"
                    onClick={() => send(input)}
                  >
                    <SendHorizontal className="h-4 w-4 text-bg" />
                  </button>
                </div>
              </div>

              {!empty && (
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex rounded-full bg-accent-3 p-1">
                    {(["sales", "support", "kb"] as const).map((m) => {
                      const active = m === mode;
                      return (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={
                            active
                              ? "rounded-full bg-accent-1 px-4 py-2 text-[11px] font-semibold text-bg"
                              : "rounded-full px-4 py-2 text-[11px] font-semibold text-text/70"
                          }
                        >
                          {MODE_LABEL[m]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoChat() {
  const [selectedNiche, setSelectedNiche] = useState<Niche>("Автосервис");

  return (
    <section id="demo-chat" className="relative">
      {/* horizontal divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10"
      />

      {/* vertical divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[160px] md:h-[320px] lg:h-[340px] w-px -translate-x-1/2 bg-text/10"
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        {/* === Этап №1 (НЕ ТРОГАЕМ) === */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          {/* LEFT */}
          <div className="md:pr-12">
            <div className="flex items-start gap-5">
              <div className="shrink-0">
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-accent-1">
                  <Settings className="h-6 w-6 text-bg" strokeWidth={2.2} />
                </div>
              </div>

              <h2 className="font-extrabold leading-[0.95] tracking-tight text-[22px] md:text-[26px] lg:text-[28px]">
                <span className="block">Готовые настройки</span>
                <span className="block">для многих направлений</span>
              </h2>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {PILLS.map((t) => (
                <div
                  key={t}
                  className="btn-lift-outline rounded-sm bg-accent-3 px-7 py-4 text-[12px] font-semibold leading-snug text-text cursor-pointer select-none"
                  onClick={() => setSelectedNiche(t)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedNiche(t);
                  }}
                  aria-label={`Выбрать нишу: ${t}`}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:pl-12">
            <div className="flex items-start justify-end">
              <div className="hover-accent text-[18px] font-medium opacity-70">demo-чат</div>
            </div>

            {/* place for stage 2 (оставляем пустым, как было) */}
            <div className="mt-10 min-h-[260px]" />
          </div>
        </div>

        {/* === Этап №2 (чат под всей первой частью) === */}
        <div className="mt-12 md:mt-14">
          <DemoChatWidget initialNiche={selectedNiche} />
        </div>
      </Container>
    </section>
  );
}

