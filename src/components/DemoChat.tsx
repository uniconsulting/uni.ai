"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/Container";
import { ChevronDown, Menu, Mic, SendHorizontal, X } from "lucide-react";
import { withBasePath } from "@/lib/basePath";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const presets = useMemo(() => PRESETS[mode][niche] ?? [], [mode, niche]);
  const empty = msgs.length === 0;

  useEffect(() => {
    if (initialNiche) setNiche(initialNiche);
  }, [initialNiche]);

  useEffect(() => {
    if (empty) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs.length, typing, empty]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

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

  function NicheDropdown() {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const longest = useMemo(() => PILLS.reduce((a, b) => (a.length >= b.length ? a : b)), []);
    const measureRef = useRef<HTMLSpanElement | null>(null);
    const [w, setW] = useState<number | undefined>(undefined);

    useLayoutEffect(() => {
      const el = measureRef.current;
      if (!el) return;

      const textW = el.getBoundingClientRect().width;
      const extra = 16 + 16 + 8 + 16;
      setW(Math.ceil(textW + extra));
    }, [longest]);

    useEffect(() => {
      const onDown = (e: PointerEvent) => {
        const root = rootRef.current;
        if (!root) return;
        if (!root.contains(e.target as Node)) setOpen(false);
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };

      window.addEventListener("pointerdown", onDown);
      window.addEventListener("keydown", onKey);

      return () => {
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("keydown", onKey);
      };
    }, []);

    return (
      <div ref={rootRef} className="relative">
        <span
          ref={measureRef}
          aria-hidden
          className="pointer-events-none absolute -z-10 opacity-0 whitespace-nowrap text-[12px] font-semibold"
        >
          {longest}
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={w ? { width: w } : undefined}
          className="flex items-center justify-between rounded-2xl bg-accent-3 px-4 py-2 text-[12px] font-semibold text-text ring-1 ring-text/10"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="whitespace-nowrap">{niche}</span>
          <ChevronDown className={`h-4 w-4 text-text/60 transition ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            role="listbox"
            style={w ? { width: w } : undefined}
            className="absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-accent-3 ring-1 ring-text/10"
          >
            {PILLS.map((item) => {
              const active = item === niche;
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setNiche(item);
                    setOpen(false);
                  }}
                  className={
                    active
                      ? "flex w-full items-center justify-between bg-bg px-4 py-2 text-left text-[12px] font-semibold text-text"
                      : "flex w-full items-center justify-between px-4 py-2 text-left text-[12px] font-semibold text-text hover:bg-bg/60"
                  }
                >
                  <span className="whitespace-nowrap">{item}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function MobileSelectMenu() {
    return (
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            className="absolute inset-x-0 top-0 z-30 md:hidden"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-hidden rounded-b-[28px] border-b border-text/10 bg-bg shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
              <div className="max-h-[360px] overflow-y-auto px-5 py-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text/45">
                    Настройки
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-3 text-text"
                    aria-label="Закрыть меню"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text/45">
                  Направление
                </div>

                <div className="mt-3 grid gap-2">
                  {PILLS.map((item) => {
                    const active = item === niche;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setNiche(item)}
                        className={
                          active
                            ? "rounded-2xl bg-accent-3 px-4 py-3 text-left text-[13px] font-semibold text-text"
                            : "rounded-2xl bg-bg px-4 py-3 text-left text-[13px] font-semibold text-text/65 ring-1 ring-text/10"
                        }
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-text/45">
                  Роль
                </div>

                <div className="mt-3 grid gap-2 pb-1">
                  {(["sales", "support", "kb"] as const).map((m) => {
                    const active = m === mode;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={
                          active
                            ? "rounded-2xl bg-accent-1 px-4 py-3 text-left text-[13px] font-semibold text-bg"
                            : "rounded-2xl bg-bg px-4 py-3 text-left text-[13px] font-semibold text-text/65 ring-1 ring-text/10"
                        }
                      >
                        {MODE_LABEL[m]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-[33px] bg-gradient-to-r from-accent-1 to-accent-2 p-[1px]">
        <div className="overflow-hidden rounded-3xl bg-accent-3">
          <div className="relative">
            <MobileSelectMenu />

            {/* header desktop */}
            <div className="hidden bg-bg px-4 py-3 md:block">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="justify-self-start">
                  <NicheDropdown />
                </div>

                <div className="justify-self-center text-center leading-none">
                  <div className="text-[13px] font-semibold text-text">ЮНИ.ai</div>
                  <div className="mt-1 text-[11px] font-medium text-text/50">
                    {typing ? "...печатает" : "в сети"}
                  </div>
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

            {/* header mobile */}
            <div className="bg-bg px-4 py-3 md:hidden">
              <div className="grid grid-cols-[40px_1fr_40px] items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-3 text-text"
                  aria-label={mobileMenuOpen ? "Закрыть выбор" : "Открыть выбор"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>

                <div className="text-center leading-none">
                  <div className="text-[13px] font-semibold text-text">ЮНИ.ai</div>
                  <div className="mt-1 text-[11px] font-medium text-text/50">
                    {typing ? "...печатает" : "в сети"}
                  </div>
                </div>

                <div className="justify-self-end">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-accent-3 ring-1 ring-text/10">
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
          </div>

          {/* body */}
          <div className="flex min-h-[520px] flex-col md:min-h-[620px]">
            <div className="relative flex-1">
              {empty ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <div>
                    <div className="text-[14px] font-semibold text-text">
                      Выберите направление и роль,
                      <br className="md:hidden" /> затем задайте вопрос
                    </div>

                    <div className="mt-2 text-[12px] font-medium text-text/55">
                      <span className="md:hidden">
                        Для быстрого старта используйте
                        <br />
                        FAQ-кнопки над строкой ввода.
                      </span>
                      <span className="hidden md:inline">
                        Для быстрого старта используйте FAQ-кнопки над строкой ввода.
                      </span>
                    </div>

                    <div className="mt-6 hidden md:inline-flex rounded-2xl bg-bg p-1">
                      {(["sales", "support", "kb"] as const).map((m) => {
                        const active = m === mode;
                        return (
                          <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={
                              active
                                ? "rounded-2xl bg-accent-1 px-5 py-2 text-[12px] font-semibold text-bg"
                                : "rounded-2xl px-5 py-2 text-[12px] font-semibold text-text/70"
                            }
                          >
                            {MODE_LABEL[m]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div ref={listRef} className="h-full overflow-auto px-6 py-7">
                  <div className="space-y-3">
                    {msgs.map((m) => (
                      <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                        <div
                          className={
                            m.role === "user"
                              ? "max-w-[82%] whitespace-pre-wrap rounded-3xl bg-accent-1 px-4 py-3 text-[12px] font-medium text-bg"
                              : "max-w-[82%] whitespace-pre-wrap rounded-3xl bg-bg px-4 py-3 text-[12px] font-medium text-text"
                          }
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}

                    {typing && (
                      <div className="flex justify-start">
                        <div className="rounded-3xl bg-bg px-4 py-3 text-[12px] font-medium text-text/60">
                          ...печатает
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="bg-bg px-4 pb-4 pt-4 md:px-6 md:pb-6">
              {/* mobile: one line carousel */}
              <div className="mb-3 md:hidden overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-3 pr-1">
                  {presets.map((t) => (
                    <button
                      key={t}
                      onClick={() => pickPreset(t)}
                      className="whitespace-nowrap rounded-2xl bg-accent-3 px-4 py-3.5 text-[12px] font-semibold text-text"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* desktop presets */}
              <div className="mb-3 hidden flex-wrap gap-3 md:flex">
                {presets.slice(0, 3).map((t) => (
                  <button
                    key={t}
                    onClick={() => pickPreset(t)}
                    className="rounded-2xl bg-accent-3 px-5 py-3 text-[12px] font-semibold text-text"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex h-14 items-center gap-3 rounded-xl bg-accent-3 p-2 pl-4">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Сообщение"
                  className="h-10 min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-text placeholder:text-text/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-sm bg-bg"
                    aria-label="Записать голосовое"
                    onClick={() => inputRef.current?.focus()}
                  >
                    <Mic className="h-4 w-4 text-text/60" />
                  </button>

                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent-1"
                    aria-label="Отправить"
                    onClick={() => send(input)}
                  >
                    <SendHorizontal className="h-4 w-4 text-bg" />
                  </button>
                </div>
              </div>

              {!empty && (
                <div className="mt-4 hidden justify-center md:flex">
                  <div className="inline-flex rounded-2xl bg-accent-3 p-1">
                    {(["sales", "support", "kb"] as const).map((m) => {
                      const active = m === mode;
                      return (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={
                            active
                              ? "rounded-2xl bg-accent-1 px-4 py-2 text-[11px] font-semibold text-bg"
                              : "rounded-2xl px-4 py-2 text-[11px] font-semibold text-text/70"
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
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10"
      />

      {/* desktop divider only */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 hidden h-[320px] w-px -translate-x-1/2 bg-text/10 md:block lg:h-[340px]"
      />

      <Container className="relative z-10 px-6 py-12 md:px-10 md:py-14 lg:px-12">
        {/* mobile */}
        <div className="md:hidden">
          <div className="text-[18px] font-medium opacity-70 hover-accent">demo-чат</div>

          <div className="mt-4">
            <h2 className="font-extrabold leading-[0.95] tracking-tight text-[26px]">
              <span className="block">Готовые настройки</span>
              <span className="block">для многих направлений</span>
            </h2>
          </div>

          <div className="mt-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid w-max grid-flow-col grid-rows-2 gap-x-3 gap-y-3 pr-1">
              {PILLS.map((t) => (
                <div
                  key={t}
                  className="btn-lift-outline inline-flex w-fit cursor-pointer select-none rounded-sm bg-accent-3 px-4 py-3 text-[12px] font-semibold leading-snug text-text"
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

          <div className="mt-8">
            <DemoChatWidget initialNiche={selectedNiche} />
          </div>
        </div>

        {/* desktop */}
        <div className="hidden md:block">
          <div className="grid gap-10 md:grid-cols-2 md:gap-0">
            <div className="md:pr-12">
              <div className="flex items-start gap-5">
                <h2 className="font-extrabold leading-[0.95] tracking-tight text-[22px] md:text-[26px] lg:text-[28px]">
                  <span className="block">Готовые настройки</span>
                  <span className="block">для многих направлений</span>
                </h2>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                {PILLS.map((t) => (
                  <div
                    key={t}
                    className="btn-lift-outline cursor-pointer select-none rounded-sm bg-accent-3 px-7 py-4 text-[12px] font-semibold leading-snug text-text"
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

            <div className="md:pl-12">
              <div className="flex items-start justify-end">
                <div className="hover-accent text-[18px] font-medium opacity-70">demo-чат</div>
              </div>

              <div className="mt-10 min-h-[260px]" />
            </div>
          </div>

          <div className="mt-12 md:mt-14">
            <DemoChatWidget initialNiche={selectedNiche} />
          </div>
        </div>
      </Container>
    </section>
  );
}
