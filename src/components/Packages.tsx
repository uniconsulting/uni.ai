"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import {
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Billing = "monthly" | "yearly";
type PlanId = "test" | "small" | "mid" | "ent";

type Plan = {
  id: PlanId;
  title: string;
  tone: "neutral" | "blue" | "green" | "red";
  desc4: [string, string, string, string];
  monthly: number;
  integrations2: [string, string];
  params3: [string, string, string];
  cta: string;
  ctaStyle: "outline" | "fill";
};

type PlanDetails = {
  lead: string;
  tags: string;
  sections: Array<{ title: string; items: string[] }>;
};

const TONE: Record<Plan["tone"], { hex: string }> = {
  neutral: { hex: "#111827" },
  blue: { hex: "#5B86C6" },
  green: { hex: "#49C874" },
  red: { hex: "#C94444" },
};

const CTA_LINKS: Record<PlanId, string> = {
  test: "https://uni-ai.online/register",
  small: "https://t.me/uni_smb",
  mid: "https://t.me/uni_smb",
  ent: "https://t.me/uni_smb",
};

function formatRub(n: number) {
  return `${new Intl.NumberFormat("ru-RU").format(n)}₽`;
}

function useOnceInView<T extends HTMLElement>(
  threshold = 0.12,
  rootMargin = "0px 0px -12% 0px",
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold, rootMargin]);

  return { ref, inView };
}

function mobileLeadLinesByPlan(id: PlanId) {
  switch (id) {
    case "test":
      return [
        "Соберите первых ассистентов",
        "и оцените интерфейс, аналитику",
        "и логику работы.",
      ] as const;

    case "small":
      return [
        "Для небольших команд: быстрый запуск",
        "по инструкциям ЮНИ + лёгкая",
        "помощь эксперта.",
      ] as const;

    case "mid":
      return [
        "Для масштабирования",
        "действующих процессов.",
        "Полноценная интеграция командой ЮНИ.",
      ] as const;

    case "ent":
      return [
        "Для крупных компаний:",
        "макс. персонализации, SLA и",
        "постоянное вовлечение команды ЮНИ.",
      ] as const;
  }
}

function DetailsFrame({
  plan,
  details,
  borderClass,
  planHex,
  tabs,
  activeId,
  onSelectPlan,
  onPrev,
  onNext,
  canPrev,
  canNext,
  onClose,
  ctaHref,
}: {
  plan: Plan;
  details: PlanDetails;
  borderClass: string;
  planHex: string;
  tabs: Array<{ id: PlanId; title: string; hex: string }>;
  activeId: PlanId;
  onSelectPlan: (id: PlanId) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onClose: () => void;
  ctaHref: string;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const isNeutral = plan.tone === "neutral";

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [plan.id]);

  return (
    <div
      className={`h-full w-full overflow-hidden rounded-3xl bg-accent-3 border-2 ${borderClass}`}
      style={{ ["--plan" as any]: planHex }}
    >
      <div className="h-full px-10 py-8 flex flex-col">
        <div className="flex items-start gap-6">
          <div className="min-w-0">
            <div className="text-[40px] font-extrabold leading-none text-text">
              {plan.title}
            </div>

            <div className="mt-4 text-[18px] font-medium text-text/85">
              {details.lead}
            </div>

            <div className="mt-4 text-[14px] font-semibold text-text/55">
              {details.tags}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-start gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className={[
                "btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur",
                canPrev ? "opacity-100" : "opacity-35 cursor-not-allowed",
              ].join(" ")}
              aria-label="Предыдущий пакет"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className={[
                "btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur",
                canNext ? "opacity-100" : "opacity-35 cursor-not-allowed",
              ].join(" ")}
              aria-label="Следующий пакет"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Закрыть описание"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const isOn = t.id === activeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectPlan(t.id)}
                className={[
                  "btn-lift-outline inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold",
                  isOn
                    ? "bg-bg/65 border-2"
                    : "bg-bg/25 border border-text/10 text-text/65 hover:text-text",
                ].join(" ")}
                style={isOn ? { borderColor: t.hex } : undefined}
                aria-pressed={isOn}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: t.hex }}
                />
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        <div ref={bodyRef} className="mt-8 flex-1 overflow-auto pr-2">
          <div className="grid gap-8 md:grid-cols-2">
            {details.sections.map((s) => (
              <div key={s.title} className="min-w-0">
                <div className="text-[18px] font-extrabold text-text">
                  {s.title}
                </div>

                <ul className="mt-4 space-y-2 text-[16px] font-medium text-text/85">
                  {s.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-text/35" />
                      <span className="min-w-0">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "btn-lift-outline block w-full rounded-xl px-6 py-4 text-center font-extrabold",
              plan.ctaStyle === "fill"
                ? "bg-[color:var(--plan)] text-bg text-[18px]"
                : "border-2 border-[color:var(--plan)] text-[color:var(--plan)] text-[18px]",
            ].join(" ")}
            style={
              isNeutral && plan.ctaStyle === "outline"
                ? { borderColor: "var(--text)", color: "var(--text)" }
                : undefined
            }
            aria-label={`CTA: ${plan.cta}`}
          >
            {plan.cta}
          </a>
        </div>
      </div>
    </div>
  );
}

function MobileDetailsFrame({
  plan,
  details,
  planHex,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
  ctaHref,
}: {
  plan: Plan;
  details: PlanDetails;
  planHex: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  ctaHref: string;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const isNeutral = plan.tone === "neutral";
  const leadLines = mobileLeadLinesByPlan(plan.id);
  const mobileCta = plan.id === "mid" ? "Подключить" : plan.cta;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [plan.id]);

  return (
    <div
      className="h-full w-full overflow-hidden rounded-[24px] bg-accent-3 ring-2 ring-[color:var(--plan)]"
      style={{ ["--plan" as any]: planHex }}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-text/15 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 text-left">
              <div
                className={`text-[24px] font-extrabold leading-none ${
                  isNeutral ? "text-text" : "text-[color:var(--plan)]"
                }`}
              >
                {plan.title}
              </div>

              <div className="mt-3 w-full max-w-none space-y-1 text-left text-[13px] font-medium leading-[1.16] text-text/82">
                {leadLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-start gap-2">
              <button
                type="button"
                onClick={onPrev}
                disabled={!canPrev}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bg/45",
                  canPrev ? "opacity-100" : "opacity-35 cursor-not-allowed",
                ].join(" ")}
                aria-label="Предыдущий пакет"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bg/45",
                  canNext ? "opacity-100" : "opacity-35 cursor-not-allowed",
                ].join(" ")}
                aria-label="Следующий пакет"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bg/45"
                aria-label="Закрыть описание"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 text-left text-[11px] font-semibold text-text/50">
            {details.tags}
          </div>
        </div>

        <div ref={bodyRef} className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <div className="space-y-5 text-left">
            {details.sections.map((s) => (
              <div key={s.title} className="text-left">
                <div className="text-[14px] font-extrabold text-text">
                  {s.title}
                </div>

                <div className="mt-3 space-y-2 text-left text-[13px] font-medium leading-snug text-text/80">
                  {s.items.map((it) => (
                    <div key={it} className="text-left">
                      {it}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-text/15 px-5 py-4">
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "btn-lift-outline block w-full rounded-xl px-5 py-3 text-center text-[15px] font-extrabold",
              plan.ctaStyle === "fill"
                ? "bg-[color:var(--plan)] text-bg"
                : "border-2 border-[color:var(--plan)] text-[color:var(--plan)]",
            ].join(" ")}
            style={
              isNeutral && plan.ctaStyle === "outline"
                ? { borderColor: "var(--text)", color: "var(--text)" }
                : undefined
            }
          >
            {mobileCta}
          </a>
        </div>
      </div>
    </div>
  );
}

export function Packages() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [active, setActive] = useState<PlanId>("test");
  const [expanded, setExpanded] = useState<PlanId | null>(null);

  const { ref: sectionRef, inView } = useOnceInView<HTMLElement>();
  const reduceMotion = useReducedMotion();

  const touchStartXRef = useRef<number | null>(null);

  const openCta = (id: PlanId) => {
    const href = CTA_LINKS[id];
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "test",
        title: "Тестовый",
        tone: "neutral",
        desc4: ["Соберите первых", "ассистентов и оцените", "интерфейс, аналитику", "и логику работы."],
        monthly: 0,
        integrations2: ["нет интеграции от ЮНИ", ""],
        params3: ["2 кастомных агента", "2 готовых агента", "До 1 000 сообщений / мес"],
        cta: "Попробовать",
        ctaStyle: "outline",
      },
      {
        id: "small",
        title: "Малый",
        tone: "blue",
        desc4: ["Для небольших команд:", "быстрый запуск по", "инструкциям ЮНИ + лёгкая", "помощь эксперта."],
        monthly: 9900,
        integrations2: ["интеграции: от 179 900₽ / разово", ""],
        params3: ["5 кастомных агентов", "+ вся библиотека готовых", "До 5 000 сообщений / мес"],
        cta: "Попробовать",
        ctaStyle: "outline",
      },
      {
        id: "mid",
        title: "Средний",
        tone: "green",
        desc4: ["Для масштабирования", "действующих процессов.", "Полноценная интеграция", "под ключ командой ЮНИ."],
        monthly: 39900,
        integrations2: ["интеграции: от 179 900₽ / разово", ""],
        params3: ["10 кастомных агентов", "+ вся библиотека готовых", "До 30 000 сообщений / мес"],
        cta: "Подключить сейчас",
        ctaStyle: "fill",
      },
      {
        id: "ent",
        title: "Энтерпрайз",
        tone: "red",
        desc4: ["Для крупных компаний:", "макс. персонализации,", "SLA и постоянное", "вовлечение команды ЮНИ."],
        monthly: 99900,
        integrations2: ["интеграции: от 179 900₽ / разово", ""],
        params3: ["индивидуальные лимиты", "Максимум персонализации", "Без ограничений"],
        cta: "Заказать звонок",
        ctaStyle: "fill",
      },
    ],
    [],
  );

  const DETAILS: Record<PlanId, PlanDetails> = useMemo(
    () => ({
      test: {
        lead: "Чтобы без риска посмотреть интерфейс и поведение ассистентов.",
        tags: "Uni-6 Nano • 1 000 сообщений/мес • 2 кастомных + 2 шаблонных",
        sections: [
          {
            title: "Лимиты",
            items: [
              "0 ₽ / бессрочно",
              "Модель: Uni-6 Nano (только она)",
              "Сообщения: 1 000 / месяц (можно поднять до 2 000 при необходимости)",
              "Агенты: до 2 созданных с нуля + до 2 шаблонных",
            ],
          },
          {
            title: "Нет",
            items: [
              "Настройки параметров генерации",
              "Управление базой знаний и RAG",
              "Обучение на реакциях (Reaction RAG)",
              "Батчинг сообщений",
              "Выбор модели",
            ],
          },
          {
            title: "Поддержка",
            items: ["Только база знаний + e-mail/чат по остаточному принципу"],
          },
        ],
      },

      small: {
        lead: "Для собственника, который готов разбираться по инструкциям и периодически получать помощь ЮНИ.",
        tags: "Uni-6 Nano + Uni-6 Mini • Telegram + ещё 1 канал • 2–4 часа помощи/мес",
        sections: [
          {
            title: "Кому",
            items: [
              "Предприниматель / собственник",
              "Сам внедряет по инструкциям",
              "Иногда подключает эксперта ЮНИ для правок и консультаций",
            ],
          },
          {
            title: "Лимиты и каналы",
            items: [
              "Сообщения: до 5 000 / мес",
              "Агенты: 5 активных кастомных + вся библиотека готовых",
              "Каналы: Telegram + ещё 1 (VK / WhatsApp по мере готовности)",
              "Модели: Uni-6 Nano + Uni-6 Mini",
            ],
          },
          {
            title: "Функции и поддержка",
            items: [
              "Полная база знаний и RAG",
              "Reaction RAG (обучение на реакциях)",
              "Батчинг сообщений",
              "Настройка параметров генерации",
              "Поддержка: 2–4 часа консультаций/правок в месяц + стандартные SLA",
            ],
          },
          {
            title: "Примечание",
            items: ["Стоимость интеграций зависит от состава систем и глубины сценариев."],
          },
        ],
      },

      mid: {
        lead: "Для руководителей продаж/маркетинга и команд, которым нужно управляемое масштабирование процессов.",
        tags: "Uni-6 Pro • До 4 каналов • PM + 12 часов/мес",
        sections: [
          {
            title: "Кому",
            items: [
              "Директор по развитию",
              "Коммерческий директор",
              "Руководитель продаж",
              "Маркетолог",
            ],
          },
          {
            title: "Лимиты и каналы",
            items: [
              "Сообщения: до 30 000 / мес",
              "Агенты: 10 активных кастомных + вся библиотека готовых",
              "Каналы: до 4 (TG, VK, WhatsApp, сайт-виджет, позже Авито)",
              "Модель: Uni-6 Pro",
            ],
          },
          {
            title: "Фичи и сопровождение",
            items: [
              "Всё из малого пакета",
              "Расширенная аналитика и отчёты",
              "Гибкие настройки RAG: несколько баз знаний, top-K, порог и т.п.",
              "Закреплённый проектный менеджер",
              "До 12 часов команды в месяц: обновление базы знаний, доработка промптов, A/B тесты, разбор аналитики и рекомендации",
            ],
          },
          {
            title: "Примечание",
            items: ["Стоимость интеграций зависит от состава систем и глубины сценариев."],
          },
        ],
      },

      ent: {
        lead: "Когда нужен максимум качества, контроля, SLA и постоянное вовлечение команды ЮНИ.",
        tags: "White-glove • Uni-6 Pro / Pro+ • Безлимит агентов и каналов",
        sections: [
          {
            title: "Кому",
            items: [
              "Маркетолог крупной компании",
              "Head of Digital",
              "Руководитель AI-направления",
              "Контакт-центр и смежные функции",
            ],
          },
          {
            title: "Лимиты и каналы",
            items: [
              "Сообщения: индивидуально",
              "Агенты: безлимит",
              "Каналы: все + кастомные интеграции (включая несколько Telegram-ботов, группы, сайт)",
              "Модели: Uni-6 Pro и Uni-6 Pro+",
            ],
          },
          {
            title: "Функции и сопровождение",
            items: [
              "Приоритетный доступ к новым фичам",
              "Расширенная аналитика и кастомные отчёты",
              "Продвинутые функции Reaction RAG, сложный RAG, много баз знаний",
              "White-glove сервис: ведущий PM",
              "40 часов команды/месяц + регулярные стратегические созвоны и roadmap по AI в компании",
            ],
          },
        ],
      },
    }),
    [],
  );

  const priceFor = (p: Plan) => {
    if (p.monthly === 0) return 0;
    if (billing === "monthly") return p.monthly;
    return Math.round(p.monthly * 0.8);
  };

  const setExpandedTo = (id: PlanId) => {
    setActive(id);
    setExpanded(id);
  };

  const openDetails = (id: PlanId) => setExpandedTo(id);
  const closeDetails = () => setExpanded(null);

  const CARD_H = 740;
  const MOBILE_CARD_H = 470;
  const W_INACTIVE = "25%";
  const W_ACTIVE = "30%";
  const ACTIVE_SHIFT = "2.5%";

  const activeIdx = plans.findIndex((p) => p.id === active);
  const activePlan = plans[activeIdx] ?? plans[0];
  const mobileLeadLines = mobileLeadLinesByPlan(activePlan.id);

  const leftFor = (i: number) => {
    if (i !== activeIdx) return `${i * 25}%`;
    if (activeIdx === 0) return "0%";
    if (activeIdx === 3) return `calc(100% - ${W_ACTIVE})`;
    return `calc(${i * 25}% - ${ACTIVE_SHIFT})`;
  };

  const ROWS = "grid-rows-[220px_140px_180px_190px]";
  const INTERVAL = "28px";

  const radiusForInactive = (i: number) => {
    if (i === 0) return "rounded-l-[30px] rounded-r-none";
    if (i === plans.length - 1) return "rounded-r-[30px] rounded-l-none";
    return "rounded-none";
  };

  const titleAlignForInactive = (i: number) =>
    i < activeIdx ? "text-left" : "text-right";

  const CARD_MOTION =
    "will-change-[left,width,box-shadow,border-color,background-color] transition-[left,width,box-shadow,border-color,background-color] duration-[560ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";

  const CONTENT_MOTION =
    "will-change-[opacity,filter,transform] transition-[opacity,filter,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  const REVEAL_BASE =
    "transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

  const PANEL_MOTION =
    "will-change-[opacity,transform,filter] transition-[opacity,transform,filter] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  const expandedPlan = expanded ? plans.find((p) => p.id === expanded) : null;
  const expandedTone = expandedPlan ? TONE[expandedPlan.tone] : null;
  const expandedIsNeutral = expandedPlan?.tone === "neutral";

  const expandedBorderClass = expandedPlan
    ? expandedIsNeutral
      ? "border-text/60"
      : "border-[color:var(--plan)]"
    : "border-text/10";

  const planTabs = useMemo(
    () =>
      plans.map((p) => ({
        id: p.id,
        title: p.title,
        hex: TONE[p.tone].hex,
      })),
    [plans],
  );

  const expandedIdx = expanded ? plans.findIndex((p) => p.id === expanded) : -1;
  const canPrev = expandedIdx > 0;
  const canNext = expandedIdx >= 0 && expandedIdx < plans.length - 1;

  const setActiveByIndex = (idx: number) => {
    const next = plans[Math.max(0, Math.min(idx, plans.length - 1))];
    if (!next) return;
    setActive(next.id);
  };

  const goPrev = () => {
    if (expanded) {
      if (!canPrev) return;
      setExpandedTo(plans[expandedIdx - 1].id);
      return;
    }
    setActiveByIndex(activeIdx - 1);
  };

  const goNext = () => {
    if (expanded) {
      if (!canNext) return;
      setExpandedTo(plans[expandedIdx + 1].id);
      return;
    }
    setActiveByIndex(activeIdx + 1);
  };

  const onMobileTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onMobileTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartXRef.current;
    const end = e.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (start == null || end == null) return;

    const delta = end - start;
    if (Math.abs(delta) < 22) return;

    if (delta < 0) setActiveByIndex(activeIdx + 1);
    else setActiveByIndex(activeIdx - 1);
  };

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isTyping =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          (t as any).isContentEditable);

      if (isTyping) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeDetails();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded, expandedIdx, canPrev, canNext, plans, activeIdx]);

  const mobileCta = activePlan.id === "mid" ? "Подключить" : activePlan.cta;

  return (
    <section
      ref={sectionRef as any}
      id="pricing"
      className={`relative ${
        inView ? "opacity-100" : "opacity-0"
      } transition-opacity duration-700 ease-out`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10 transition-opacity duration-700 ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 hidden h-[200px] w-px -translate-x-1/2 bg-text/10 transition-opacity duration-700 md:block lg:h-[240px] ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        <div className="md:hidden">
          <div
            className={`${REVEAL_BASE} ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="hover-accent text-[18px] font-medium opacity-70">
              стоимость | пакеты
            </div>

            <div className="mt-4 text-[26px] font-extrabold leading-[0.98] tracking-tight text-accent-1">
              Сделай выбор
            </div>

            <div className="mt-3 text-[20px] font-semibold leading-[1.08] tracking-tight text-text">
              Прозрачные условия, никаких скрытых платежей
            </div>

            <div className="mt-6">
              <div className="inline-block rounded-xl bg-accent-1 p-[2px]">
                <div className="flex rounded-[10px] bg-accent-1 p-[3px]">
                  <button
                    type="button"
                    onClick={() => setBilling("monthly")}
                    className={
                      billing === "monthly"
                        ? "rounded-[7px] bg-accent-3 px-4 py-2 text-[12px] font-semibold text-text"
                        : "rounded-[7px] px-4 py-2 text-[12px] font-semibold text-bg/90"
                    }
                    aria-pressed={billing === "monthly"}
                  >
                    Ежемесячно
                  </button>

                  <button
                    type="button"
                    onClick={() => setBilling("yearly")}
                    className={
                      billing === "yearly"
                        ? "rounded-[7px] bg-accent-3 px-4 py-2 text-[12px] font-semibold text-text"
                        : "rounded-[7px] px-4 py-2 text-[12px] font-semibold text-bg/70"
                    }
                    aria-pressed={billing === "yearly"}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>Годовой</span>
                      <span className={billing === "yearly" ? "text-text/60" : "text-bg/70"}>
                        -20%
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:grid gap-10 md:grid-cols-2 md:gap-0">
          <div
            className={`${REVEAL_BASE} ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            } md:pr-12`}
          >
            <div className="text-[22px] md:text-[26px] lg:text-[34px] font-extrabold text-accent-1">
              Сделай выбор
            </div>

            <h2 className="mt-3 font-semibold leading-[1.05] tracking-tight text-[22px] md:text-[26px] lg:text-[28px]">
              <span className="block">Прозрачные условия,</span>
              <span className="block">никаких скрытых платежей.</span>
            </h2>
          </div>

          <div
            className={`${REVEAL_BASE} ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            } md:pl-12`}
            style={{ transitionDelay: "80ms" }}
          >
            <div className="flex flex-col items-start md:items-end">
              <div className="hover-accent text-[18px] font-medium opacity-70">
                стоимость | пакеты
              </div>

              <div className="mt-6">
                <div className="rounded-2xl bg-accent-1 p-[3px]">
                  <div className="flex rounded-2xl bg-accent-1 p-1">
                    <button
                      type="button"
                      onClick={() => setBilling("monthly")}
                      className={
                        billing === "monthly"
                          ? "rounded-xl bg-accent-3 px-8 py-4 text-[16px] font-semibold text-text"
                          : "rounded-xl px-8 py-4 text-[16px] font-semibold text-bg/90"
                      }
                      aria-pressed={billing === "monthly"}
                    >
                      Ежемесячно
                    </button>

                    <button
                      type="button"
                      onClick={() => setBilling("yearly")}
                      className={
                        billing === "yearly"
                          ? "rounded-xl bg-accent-3 px-8 py-4 text-[16px] font-semibold text-text"
                          : "rounded-xl px-8 py-4 text-[16px] font-semibold text-bg/70"
                      }
                      aria-pressed={billing === "yearly"}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span>Годовой</span>
                        <span
                          className={
                            billing === "yearly"
                              ? "text-text/60"
                              : "text-bg/70"
                          }
                        >
                          -20%
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 min-h-[40px] w-full" />
            </div>
          </div>
        </div>

        <div
          className={`${REVEAL_BASE} ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          } mt-10 md:mt-12 md:mt-14`}
          style={{ transitionDelay: "140ms" }}
        >
          <div className="md:hidden">
            <div
              className="relative"
              onTouchStart={onMobileTouchStart}
              onTouchEnd={onMobileTouchEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                {expandedPlan ? (
                  <motion.div
                    key={`mobile-details-${expandedPlan.id}`}
                    initial={reduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18, filter: "blur(4px)" }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: MOBILE_CARD_H }}
                  >
                    <MobileDetailsFrame
                      plan={expandedPlan}
                      details={DETAILS[expandedPlan.id]}
                      planHex={expandedTone?.hex ?? "#111827"}
                      onClose={closeDetails}
                      onPrev={goPrev}
                      onNext={goNext}
                      canPrev={canPrev}
                      canNext={canNext}
                      ctaHref={CTA_LINKS[expandedPlan.id]}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`mobile-card-${activePlan.id}`}
                    initial={reduceMotion ? false : { opacity: 0, x: 24, filter: "blur(4px)" }}
                    animate={
                      reduceMotion
                        ? { opacity: 1 }
                        : {
                            opacity: 1,
                            x: [0, -5, 5, -3, 3, 0],
                            filter: "blur(0px)",
                          }
                    }
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24, filter: "blur(4px)" }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            opacity: { duration: 0.22 },
                            filter: { duration: 0.22 },
                            x: {
                              duration: 0.7,
                              times: [0, 0.18, 0.36, 0.54, 0.72, 1],
                              ease: "easeInOut",
                            },
                          }
                    }
                    style={{ height: MOBILE_CARD_H }}
                    className="relative"
                  >
                    <div className="pointer-events-none absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg/65 text-text/55 backdrop-blur">
                      <MoveHorizontal className="h-4 w-4" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setActive(activePlan.id)}
                      aria-pressed
                      className="h-full w-full text-left"
                    >
                      <div
                        className="h-full overflow-hidden rounded-[24px] bg-accent-3 ring-2 ring-[color:var(--plan)]"
                        style={{ ["--plan" as any]: TONE[activePlan.tone].hex }}
                      >
                        <div className="grid h-full grid-rows-[124px_74px_102px_170px]">
                          <div className="border-b border-text/20 px-6 pt-5 pb-2">
                            <div className="flex h-full flex-col justify-between">
                              <div
                                className={`text-[26px] font-extrabold leading-none ${
                                  activePlan.tone === "neutral"
                                    ? "text-text"
                                    : "text-[color:var(--plan)]"
                                }`}
                              >
                                {activePlan.title}
                              </div>

                              <div className="w-full space-y-[2px] text-[13px] font-medium leading-[1.12] text-text/90">
                                {mobileLeadLines.map((line) => (
                                  <div key={line}>{line}</div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="border-b border-text/20 px-6 py-2">
                            <div className="flex h-full flex-col justify-between">
                              <div className="flex items-baseline gap-2">
                                <div
                                  className={`text-[26px] font-extrabold leading-none ${
                                    activePlan.tone === "neutral"
                                      ? "text-text"
                                      : "text-[color:var(--plan)]"
                                  }`}
                                >
                                  {formatRub(priceFor(activePlan))}
                                </div>
                                <div className="text-[18px] font-semibold leading-none text-text/35">
                                  / мес
                                </div>
                              </div>

                              <div className="text-[11px] font-semibold leading-none text-text/45">
                                {activePlan.integrations2[0]}
                              </div>
                            </div>
                          </div>

                          <div className="border-b border-text/20 px-6 py-2">
                            <div className="flex h-full flex-col justify-between">
                              <div className="text-[14px] font-extrabold text-text">
                                Ключевые параметры
                              </div>

                              <div className="space-y-[2px] text-[13px] font-medium leading-[1.12] text-text/90">
                                {activePlan.params3.map((l) => (
                                  <div key={l}>{l}</div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="px-6 py-2">
                            <div className="flex h-full flex-col justify-between">
                              <div
                                className="flex items-center gap-3 text-[14px] font-extrabold text-text cursor-pointer select-none hover:opacity-80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDetails(activePlan.id);
                                }}
                              >
                                <span>Изучить возможности</span>
                                <Eye className="h-5 w-5" />
                              </div>

                              <div className="mt-1 flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    goPrev();
                                  }}
                                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg/55"
                                  aria-label="Предыдущий пакет"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`CTA: ${mobileCta}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openCta(activePlan.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openCta(activePlan.id);
                                    }
                                  }}
                                  className={[
                                    "btn-lift-outline cursor-pointer flex-1",
                                    activePlan.ctaStyle === "fill"
                                      ? "rounded-xl bg-[color:var(--plan)] px-5 py-3 text-center text-[15px] font-extrabold text-bg"
                                      : "rounded-xl border-2 border-[color:var(--plan)] px-5 py-3 text-center text-[15px] font-extrabold text-[color:var(--plan)]",
                                  ].join(" ")}
                                  style={
                                    activePlan.tone === "neutral" &&
                                    activePlan.ctaStyle === "outline"
                                      ? { borderColor: "var(--text)", color: "var(--text)" }
                                      : undefined
                                  }
                                >
                                  {mobileCta}
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    goNext();
                                  }}
                                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg/55"
                                  aria-label="Следующий пакет"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative" style={{ height: CARD_H }}>
              <div
                className={`absolute inset-0 transition-[opacity,filter] duration-400 ease-out ${
                  expanded
                    ? "opacity-0 blur-[1px] pointer-events-none"
                    : "opacity-100 blur-0"
                }`}
              >
                {plans.map((p, i) => {
                  const isActive = p.id === active;
                  const tone = TONE[p.tone];
                  const price = priceFor(p);
                  const isNeutral = p.tone === "neutral";

                  const ringClass = isActive
                    ? isNeutral
                      ? "ring-2 ring-text/60"
                      : "ring-2 ring-[color:var(--plan)]"
                    : "ring-1 ring-text/15";

                  const bgClass = isActive ? "bg-accent-3" : "bg-bg";
                  const radiusClass = isActive
                    ? "rounded-[30px]"
                    : radiusForInactive(i);
                  const inactiveTitleAlign = titleAlignForInactive(i);

                  const shadow = isActive
                    ? "shadow-[0_22px_70px_rgba(0,0,0,0.10)]"
                    : "shadow-[0_16px_46px_rgba(0,0,0,0.06)]";

                  const contentState = isActive
                    ? "opacity-100 translate-y-0 blur-0"
                    : "opacity-0 translate-y-1 blur-[2px]";
                  const contentDelay = isActive ? "140ms" : "0ms";

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActive(p.id)}
                      aria-pressed={isActive}
                      className={`absolute top-0 h-full text-left ${CARD_MOTION}`}
                      style={{
                        left: leftFor(i),
                        width: isActive ? W_ACTIVE : W_INACTIVE,
                        zIndex: isActive ? 50 : 10 + i,
                        ["--plan" as any]: tone.hex,
                        ["--i" as any]: INTERVAL,
                      }}
                    >
                      <div
                        className={`h-full overflow-hidden ${radiusClass} ${bgClass} ${ringClass} ${shadow}`}
                      >
                        <div
                          className={`grid h-full ${ROWS} ${
                            isActive
                              ? "divide-y divide-text/25"
                              : "divide-y divide-text/10"
                          }`}
                        >
                          <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                            <div className="flex h-full flex-col justify-between">
                              <div
                                className={
                                  isActive
                                    ? `text-[44px] font-extrabold leading-none ${
                                        isNeutral
                                          ? "text-text"
                                          : "text-[color:var(--plan)]"
                                      }`
                                    : `w-full text-[28px] font-extrabold leading-none text-text/15 ${inactiveTitleAlign}`
                                }
                              >
                                {p.title}
                              </div>

                              <div
                                className={`${CONTENT_MOTION} ${contentState}`}
                                style={{ transitionDelay: contentDelay }}
                              >
                                <div className="space-y-1 text-[20px] font-medium leading-[1.15] text-text/90">
                                  {p.desc4.map((l) => (
                                    <div key={l} className="whitespace-nowrap">
                                      {l}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                            <div
                              className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`}
                              style={{ transitionDelay: contentDelay }}
                            >
                              <div className="flex items-baseline gap-4">
                                <div
                                  className={
                                    isNeutral
                                      ? "text-[44px] font-extrabold leading-none text-text"
                                      : "text-[44px] font-extrabold leading-none text-[color:var(--plan)]"
                                  }
                                >
                                  {formatRub(price)}
                                </div>
                                <div className="text-[34px] font-semibold leading-none text-text/35">
                                  / мес
                                </div>
                              </div>

                              <div className="text-[14px] font-semibold text-text/45">
                                {p.integrations2[0]}
                              </div>
                            </div>
                          </div>

                          <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                            <div
                              className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`}
                              style={{ transitionDelay: contentDelay }}
                            >
                              <div className="text-[20px] font-extrabold text-text">
                                Ключевые параметры
                              </div>

                              <div className="space-y-1 text-[20px] font-medium leading-[1.15] text-text/90">
                                {p.params3.map((l) => (
                                  <div key={l} className="whitespace-nowrap">
                                    {l}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                            <div
                              className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`}
                              style={{ transitionDelay: contentDelay }}
                            >
                              <div
                                className="flex items-center gap-4 text-[20px] font-extrabold text-text cursor-pointer select-none hover:opacity-80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDetails(p.id);
                                }}
                              >
                                <span>Изучить возможности</span>
                                <Eye className="h-7 w-7" />
                              </div>

                              <div
                                role="button"
                                tabIndex={isActive ? 0 : -1}
                                aria-label={`CTA: ${p.cta}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openCta(p.id);
                                }}
                                onKeyDown={(e) => {
                                  if (!isActive) return;
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openCta(p.id);
                                  }
                                }}
                                className={[
                                  isActive ? "btn-lift-outline cursor-pointer" : "pointer-events-none",
                                  p.ctaStyle === "fill"
                                    ? "w-full rounded-xl bg-[color:var(--plan)] px-6 py-4 text-center text-[18px] font-extrabold text-bg"
                                    : "w-full rounded-xl border-2 border-[color:var(--plan)] px-6 py-4 text-center text-[18px] font-extrabold text-[color:var(--plan)]",
                                ].join(" ")}
                                style={
                                  isNeutral && p.ctaStyle === "outline"
                                    ? { borderColor: "var(--text)", color: "var(--text)" }
                                    : undefined
                                }
                              >
                                {p.cta}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                className={`absolute inset-0 ${PANEL_MOTION} ${
                  expandedPlan
                    ? "opacity-100 translate-y-0 blur-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 blur-[2px] pointer-events-none"
                }`}
              >
                {expandedPlan ? (
                  <DetailsFrame
                    plan={expandedPlan}
                    details={DETAILS[expandedPlan.id]}
                    borderClass={expandedBorderClass}
                    planHex={expandedTone?.hex ?? "#111827"}
                    tabs={planTabs}
                    activeId={expandedPlan.id}
                    onSelectPlan={setExpandedTo}
                    onPrev={goPrev}
                    onNext={goNext}
                    canPrev={canPrev}
                    canNext={canNext}
                    onClose={closeDetails}
                    ctaHref={CTA_LINKS[expandedPlan.id]}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
