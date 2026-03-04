"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { Eye, X, ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";

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
      <div className="h-full px-5 py-5 md:px-10 md:py-8 flex flex-col">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="min-w-0 w-full">
            <div className="text-[28px] md:text-[40px] font-extrabold leading-none text-text text-left">
              {plan.title}
            </div>

            <div className="mt-3 md:mt-4 w-full text-[15px] md:text-[18px] font-medium leading-[1.25] text-text/85 text-left">
              {details.lead}
            </div>

            <div className="mt-3 md:mt-4 text-[12px] md:text-[14px] font-semibold text-text/55 text-left">
              {details.tags}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-start gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className={[
                "btn-lift-outline inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur",
                canPrev ? "opacity-100" : "opacity-35 cursor-not-allowed",
              ].join(" ")}
              aria-label="Предыдущий пакет"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className={[
                "btn-lift-outline inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur",
                canNext ? "opacity-100" : "opacity-35 cursor-not-allowed",
              ].join(" ")}
              aria-label="Следующий пакет"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Закрыть описание"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        <div className="mt-5 md:mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const isOn = t.id === activeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectPlan(t.id)}
                className={[
                  "btn-lift-outline inline-flex items-center gap-2 rounded-xl px-3 py-2 md:px-4 md:py-2 text-[12px] md:text-[13px] font-semibold",
                  isOn
                    ? "bg-bg/65 border-2"
                    : "bg-bg/25 border border-text/10 text-text/65 hover:text-text",
                ].join(" ")}
                style={isOn ? { borderColor: t.hex } : undefined}
                aria-pressed={isOn}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.hex }} />
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        <div ref={bodyRef} className="mt-5 md:mt-8 flex-1 overflow-auto pr-1 md:pr-2">
          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {details.sections.map((s) => (
              <div key={s.title} className="min-w-0 text-left">
                <div className="text-[16px] md:text-[18px] font-extrabold text-text text-left">
                  {s.title}
                </div>

                <ul className="mt-3 md:mt-4 space-y-2 text-[14px] md:text-[16px] font-medium text-text/85 text-left">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-text/35" />
                      <span className="min-w-0 text-left">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 md:mt-8">
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "btn-lift-outline block w-full rounded-xl px-5 py-3 md:px-6 md:py-4 text-center font-extrabold",
              plan.ctaStyle === "fill"
                ? "bg-[color:var(--plan)] text-bg text-[16px] md:text-[18px]"
                : "border-2 border-[color:var(--plan)] text-[color:var(--plan)] text-[16px] md:text-[18px]",
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

function mobileLead(planId: PlanId) {
  switch (planId) {
    case "test":
      return [
        "Соберите первых ассистентов",
        "и оцените интерфейс, аналитику",
        "и логику работы.",
      ];
    case "small":
      return [
        "Для небольших команд: быстрый запуск",
        "по инструкциям ЮНИ + лёгкая",
        "помощь эксперта.",
      ];
    case "mid":
      return [
        "Для масштабирования",
        "действующих процессов.",
        "Полноценная интеграция командой ЮНИ.",
      ];
    case "ent":
      return [
        "Для крупных компаний:",
        "макс. персонализации, SLA и",
        "постоянное вовлечение команды ЮНИ.",
      ];
  }
}

function MobilePlanCard({
  plan,
  billing,
  isActive,
  onOpenDetails,
  onOpenCta,
  onPrev,
  onNext,
}: {
  plan: Plan;
  billing: Billing;
  isActive: boolean;
  onOpenDetails: () => void;
  onOpenCta: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const tone = TONE[plan.tone];
  const isNeutral = plan.tone === "neutral";

  const price = useMemo(() => {
    if (plan.monthly === 0) return 0;
    if (billing === "monthly") return plan.monthly;
    return Math.round(plan.monthly * 0.8);
  }, [plan, billing]);

  const ctaLabel = plan.id === "mid" ? "Подключить" : plan.cta;

  return (
    <div
      className="relative w-full"
      style={{ ["--plan" as any]: tone.hex }}
    >
      <div
        className={[
          "rounded-[28px] bg-accent-3",
          isNeutral ? "ring-2 ring-text/90" : "ring-2 ring-[color:var(--plan)]",
        ].join(" ")}
      >
        <div className="px-[5%] pt-[5%] pb-[5%]">
          <div className="flex items-start justify-between gap-4">
            <div className="text-[7.6vw] max-w-[70%] font-extrabold leading-none text-text sm:text-[42px]">
              {plan.title}
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg/40">
              <MoveHorizontal className="h-5 w-5 text-text/45" />
            </div>
          </div>

          <div className="mt-[9px] w-full text-left text-[4.3vw] sm:text-[24px] font-medium leading-[1.2] text-text/90">
            {mobileLead(plan.id).map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>

          <div className="mt-[30px] h-px w-full bg-text/12" />

          <div className="pt-[9px]">
            <div className="flex items-baseline gap-2 sm:gap-3">
              <div
                className={[
                  "text-[8vw] sm:text-[46px] font-extrabold leading-none",
                  isNeutral ? "text-text" : "text-[color:var(--plan)]",
                ].join(" ")}
              >
                {formatRub(price)}
              </div>
              <div className="text-[6vw] sm:text-[34px] font-semibold leading-none text-text/30">
                / мес
              </div>
            </div>

            <div className="mt-[9px] text-[3.9vw] sm:text-[22px] font-semibold leading-[1.15] text-text/35">
              {plan.integrations2[0]}
            </div>
          </div>

          <div className="mt-[30px] h-px w-full bg-text/12" />

          <div className="pt-[30px]">
            <div className="text-[5vw] sm:text-[28px] font-extrabold leading-none text-text">
              Ключевые параметры
            </div>

            <div className="mt-[9px] space-y-0 text-[4.4vw] sm:text-[25px] font-medium leading-[1.22] text-text/90">
              {plan.params3.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>

          <div className="mt-[30px] h-px w-full bg-text/12" />

          <div className="pt-[30px]">
            <button
              type="button"
              onClick={onOpenDetails}
              className="flex items-center gap-3 text-left text-[5vw] sm:text-[28px] font-extrabold leading-none text-text"
            >
              <span>Изучить возможности</span>
              <Eye className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>

          <div className="mt-[60px] flex items-center gap-4">
            <button
              type="button"
              onClick={onPrev}
              className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-bg/40"
              aria-label="Предыдущая карточка"
            >
              <ChevronLeft className="h-6 w-6 text-text" />
            </button>

            <button
              type="button"
              onClick={onOpenCta}
              className={[
                "btn-lift-outline flex-1 rounded-[20px] px-5 py-4 text-center text-[5vw] sm:text-[28px] font-extrabold leading-none",
                plan.ctaStyle === "fill"
                  ? "bg-[color:var(--plan)] text-bg"
                  : "border-[3px] border-[color:var(--plan)] text-[color:var(--plan)]",
              ].join(" ")}
              style={
                isNeutral && plan.ctaStyle === "outline"
                  ? { borderColor: "var(--text)", color: "var(--text)" }
                  : undefined
              }
            >
              {ctaLabel}
            </button>

            <button
              type="button"
              onClick={onNext}
              className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-bg/40"
              aria-label="Следующая карточка"
            >
              <ChevronRight className="h-6 w-6 text-text" />
            </button>
          </div>
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

  const setExpandedTo = (id: PlanId) => {
    setActive(id);
    setExpanded(id);
  };

  const openDetails = (id: PlanId) => setExpandedTo(id);
  const closeDetails = () => setExpanded(null);

  const CARD_H = 740;
  const W_INACTIVE = "25%";
  const W_ACTIVE = "30%";
  const ACTIVE_SHIFT = "2.5%";

  const activeIdx = plans.findIndex((p) => p.id === active);

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

  const titleAlignForInactive = (i: number) => (i < activeIdx ? "text-left" : "text-right");

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

  const goPrev = () => {
    const nextIdx = activeIdx <= 0 ? plans.length - 1 : activeIdx - 1;
    setActive(plans[nextIdx].id);
  };

  const goNext = () => {
    const nextIdx = activeIdx >= plans.length - 1 ? 0 : activeIdx + 1;
    setActive(plans[nextIdx].id);
  };

  const goPrevExpanded = () => {
    if (!expanded || !canPrev) return;
    setExpandedTo(plans[expandedIdx - 1].id);
  };

  const goNextExpanded = () => {
    if (!expanded || !canNext) return;
    setExpandedTo(plans[expandedIdx + 1].id);
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
        goPrevExpanded();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNextExpanded();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded, expandedIdx, canPrev, canNext, plans]);

  return (
    <section
      ref={sectionRef as any}
      id="pricing"
      className={`relative ${inView ? "opacity-100" : "opacity-0"} transition-opacity duration-700 ease-out`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10 transition-opacity duration-700 ${
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
            <div className="text-[14px] font-medium opacity-70 hover-accent">стоимость | пакеты</div>

            <div className="mt-3 text-[26px] font-extrabold leading-[0.95] tracking-tight text-accent-1">
              Сделай выбор
            </div>

            <h2 className="mt-3 text-[16px] font-semibold leading-[1.15] tracking-tight text-text">
              Прозрачные условия, никаких скрытых платежей
            </h2>

            <div className="mt-6">
              <div className="inline-flex rounded-[16px] bg-accent-1 p-[2px]">
                <div className="flex rounded-[14px] bg-accent-1 p-[3px]">
                  <button
                    type="button"
                    onClick={() => setBilling("monthly")}
                    className={
                      billing === "monthly"
                        ? "rounded-[12px] bg-accent-3 px-4 py-2 text-[12px] font-semibold text-text"
                        : "rounded-[12px] px-4 py-2 text-[12px] font-semibold text-bg/90"
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
                        ? "rounded-[12px] bg-accent-3 px-4 py-2 text-[12px] font-semibold text-text"
                        : "rounded-[12px] px-4 py-2 text-[12px] font-semibold text-bg/75"
                    }
                    aria-pressed={billing === "yearly"}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>Годовой</span>
                      <span className={billing === "yearly" ? "text-text/55" : "text-bg/75"}>-20%</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${REVEAL_BASE} ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            } mt-8`}
            style={{ transitionDelay: "120ms" }}
          >
            {expandedPlan ? (
              <div className="h-[76vh] min-h-[620px] max-h-[760px]">
                <DetailsFrame
                  plan={expandedPlan}
                  details={DETAILS[expandedPlan.id]}
                  borderClass={expandedBorderClass}
                  planHex={expandedTone?.hex ?? "#111827"}
                  tabs={planTabs}
                  activeId={expandedPlan.id}
                  onSelectPlan={setExpandedTo}
                  onPrev={goPrevExpanded}
                  onNext={goNextExpanded}
                  canPrev={canPrev}
                  canNext={canNext}
                  onClose={closeDetails}
                  ctaHref={CTA_LINKS[expandedPlan.id]}
                />
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="w-full">
                  <MobilePlanCard
                    plan={plans[activeIdx]}
                    billing={billing}
                    isActive
                    onOpenDetails={() => openDetails(plans[activeIdx].id)}
                    onOpenCta={() => openCta(plans[activeIdx].id)}
                    onPrev={goPrev}
                    onNext={goNext}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="grid gap-10 md:grid-cols-2 md:gap-0">
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
                          <span className={billing === "yearly" ? "text-text/60" : "text-bg/70"}>-20%</span>
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
            } mt-12 md:mt-14`}
            style={{ transitionDelay: "140ms" }}
          >
            <div className="relative">
              <div className="relative" style={{ height: CARD_H }}>
                <div
                  className={`absolute inset-0 transition-[opacity,filter] duration-400 ease-out ${
                    expanded ? "opacity-0 blur-[1px] pointer-events-none" : "opacity-100 blur-0"
                  }`}
                >
                  {plans.map((p, i) => {
                    const isActive = p.id === active;
                    const tone = TONE[p.tone];
                    const price =
                      p.monthly === 0
                        ? 0
                        : billing === "monthly"
                          ? p.monthly
                          : Math.round(p.monthly * 0.8);
                    const isNeutral = p.tone === "neutral";

                    const ringClass = isActive
                      ? isNeutral
                        ? "ring-2 ring-text/60"
                        : "ring-2 ring-[color:var(--plan)]"
                      : "ring-1 ring-text/15";

                    const bgClass = isActive ? "bg-accent-3" : "bg-bg";
                    const radiusClass = isActive ? "rounded-[30px]" : radiusForInactive(i);
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
                        <div className={`h-full overflow-hidden ${radiusClass} ${bgClass} ${ringClass} ${shadow}`}>
                          <div
                            className={`grid h-full ${ROWS} ${
                              isActive ? "divide-y divide-text/25" : "divide-y divide-text/10"
                            }`}
                          >
                            <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                              <div className="flex h-full flex-col justify-between">
                                <div
                                  className={
                                    isActive
                                      ? `text-[44px] font-extrabold leading-none ${
                                          isNeutral ? "text-text" : "text-[color:var(--plan)]"
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
                                  <div className="text-[34px] font-semibold leading-none text-text/35">/ мес</div>
                                </div>

                                <div className="text-[14px] font-semibold text-text/45">{p.integrations2[0]}</div>
                              </div>
                            </div>

                            <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                              <div
                                className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`}
                                style={{ transitionDelay: contentDelay }}
                              >
                                <div className="text-[20px] font-extrabold text-text">Ключевые параметры</div>

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
                      onPrev={goPrevExpanded}
                      onNext={goNextExpanded}
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
        </div>
      </Container>
    </section>
  );
}
