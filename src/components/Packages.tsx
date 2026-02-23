"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { Eye, X, ChevronLeft, ChevronRight } from "lucide-react";

type Billing = "monthly" | "yearly";
type PlanId = "test" | "small" | "mid" | "ent";

type Plan = {
  id: PlanId;
  title: string;
  tone: "neutral" | "blue" | "green" | "red";
  desc4: [string, string, string, string];
  monthly: number;
  integrations2: [string, string]; // используем только [0]
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
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // при перелистывании пакета в фрейме скролл возвращаем вверх
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [plan.id]);

  return (
    <div
      className={`h-full w-full overflow-hidden rounded-3xl bg-accent-3 border-2 ${borderClass}`}
      style={{ ["--plan" as any]: planHex }}
    >
      <div className="h-full px-10 py-8">
        {/* top */}
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
              title="Предыдущий пакет (←)"
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
              title="Следующий пакет (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Закрыть описание"
              title="Закрыть (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* tabs (подсветка активного названия пакета) */}
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
                  isOn ? "bg-bg/65 border-2" : "bg-bg/25 border border-text/10 text-text/65 hover:text-text",
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

        {/* body */}
        <div
          ref={bodyRef}
          className="mt-8 h-[calc(100%-188px)] overflow-auto pr-2"
        >
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
      </div>
    </div>
  );
}

export function Packages() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [active, setActive] = useState<PlanId>("test");
  const [expanded, setExpanded] = useState<PlanId | null>(null);

  const { ref: sectionRef, inView } = useOnceInView<HTMLElement>();

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

  // геометрия
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

  // выбранный план для панели
  const expandedPlan = expanded ? plans.find((p) => p.id === expanded) : null;
  const expandedTone = expandedPlan ? TONE[expandedPlan.tone] : null;
  const expandedIsNeutral = expandedPlan?.tone === "neutral";

  const expandedBorderClass = expandedPlan
    ? expandedIsNeutral
      ? "border-text/60"
      : "border-[color:var(--plan)]"
    : "border-text/10";

  // tabs для фрейма
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
    if (!expanded || !canPrev) return;
    setExpandedTo(plans[expandedIdx - 1].id);
  };

  const goNext = () => {
    if (!expanded || !canNext) return;
    setExpandedTo(plans[expandedIdx + 1].id);
  };

  // клавиатура: ← → и Esc
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
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 h-[160px] md:h-[200px] lg:h-[240px] w-px -translate-x-1/2 bg-text/10 transition-opacity duration-700 ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          <div className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} md:pr-12`}>
            <div className="text-[22px] md:text-[26px] lg:text-[34px] font-extrabold text-accent-1">Сделай выбор</div>

            <h2 className="mt-3 font-semibold leading-[1.05] tracking-tight text-[22px] md:text-[26px] lg:text-[28px]">
              <span className="block">Прозрачные условия,</span>
              <span className="block">никаких скрытых платежей.</span>
            </h2>
          </div>

          <div
            className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} md:pl-12`}
            style={{ transitionDelay: "80ms" }}
          >
            <div className="flex flex-col items-start md:items-end">
              <div className="hover-accent text-[18px] font-medium opacity-70">стоимость | пакеты</div>

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
          className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} mt-12 md:mt-14`}
          style={{ transitionDelay: "140ms" }}
        >
          {/* mobile */}
          <div className="md:hidden">
            {expandedPlan ? (
              <div style={{ height: CARD_H }}>
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
                />
              </div>
            ) : (
              <div className="grid gap-6">
                {plans.map((p) => {
                  const isActive = p.id === active;
                  const tone = TONE[p.tone];
                  const price = priceFor(p);
                  const isNeutral = p.tone === "neutral";

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActive(p.id)}
                      className="text-left"
                      aria-pressed={isActive}
                    >
                      <div
                        className={
                          isActive
                            ? "overflow-hidden rounded-[28px] bg-accent-3 ring-2 ring-[color:var(--plan)]"
                            : "overflow-hidden rounded-[28px] bg-bg ring-1 ring-text/15"
                        }
                        style={{ ["--plan" as any]: tone.hex, ["--i" as any]: INTERVAL }}
                      >
                        <div className={`grid h-full ${ROWS} ${isActive ? "divide-y divide-text/20" : "divide-y divide-text/10"}`}>
                          <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                            <div className="flex h-full flex-col justify-between">
                              <div
                                className={
                                  isActive
                                    ? `text-[34px] font-extrabold leading-none ${isNeutral ? "text-text" : "text-[color:var(--plan)]"}`
                                    : "text-[28px] font-extrabold leading-none text-text/15"
                                }
                              >
                                {p.title}
                              </div>

                              <div className={`${CONTENT_MOTION} ${isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]"}`}>
                                <div className="space-y-1 text-[16px] font-medium text-text/90">
                                  {p.desc4.map((l) => (
                                    <div key={l} className="whitespace-nowrap">
                                      {l}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                            <div className={`${CONTENT_MOTION} ${isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]"} flex h-full flex-col justify-between`}>
                              <div className="flex items-baseline gap-3">
                                <div className={`text-[36px] font-extrabold leading-none ${isNeutral ? "text-text" : "text-[color:var(--plan)]"}`}>
                                  {formatRub(price)}
                                </div>
                                <div className="text-[28px] font-semibold leading-none text-text/35">/ мес</div>
                              </div>

                              <div className="text-[13px] font-semibold text-text/45">{p.integrations2[0]}</div>
                            </div>
                          </div>

                          <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                            <div className={`${CONTENT_MOTION} ${isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]"} flex h-full flex-col justify-between`}>
                              <div className="text-[18px] font-extrabold text-text">Ключевые параметры</div>

                              <div className="space-y-1 text-[16px] font-medium text-text/90">
                                {p.params3.map((l) => (
                                  <div key={l} className="whitespace-nowrap">
                                    {l}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                            <div className={`${CONTENT_MOTION} ${isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]"} flex h-full flex-col justify-between`}>
                              <div
                                className="flex items-center gap-3 text-[18px] font-extrabold text-text cursor-pointer select-none hover:opacity-80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDetails(p.id);
                                }}
                              >
                                <span>Изучить возможности</span>
                                <Eye className="h-6 w-6" />
                              </div>

                              <div
                                className={[
                                  isActive ? "btn-lift-outline" : "",
                                  p.ctaStyle === "fill"
                                    ? "w-full rounded-xl bg-[color:var(--plan)] px-6 py-4 text-center text-[20px] font-extrabold text-bg"
                                    : "w-full rounded-xl border-2 border-[color:var(--plan)] px-6 py-4 text-center text-[20px] font-extrabold text-[color:var(--plan)]",
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
            )}
          </div>

          {/* desktop */}
          <div className="relative hidden md:block">
            <div className="relative" style={{ height: CARD_H }}>
              {/* DECK */}
              <div
                className={`absolute inset-0 transition-[opacity,filter] duration-400 ease-out ${
                  expanded ? "opacity-0 blur-[1px] pointer-events-none" : "opacity-100 blur-0"
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
                  const radiusClass = isActive ? "rounded-[30px]" : radiusForInactive(i);
                  const inactiveTitleAlign = titleAlignForInactive(i);

                  const shadow = isActive
                    ? "shadow-[0_22px_70px_rgba(0,0,0,0.10)]"
                    : "shadow-[0_16px_46px_rgba(0,0,0,0.06)]";

                  const contentState = isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]";
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
                        <div className={`grid h-full ${ROWS} ${isActive ? "divide-y divide-text/25" : "divide-y divide-text/10"}`}>
                          <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                            <div className="flex h-full flex-col justify-between">
                              <div
                                className={
                                  isActive
                                    ? `text-[44px] font-extrabold leading-none ${isNeutral ? "text-text" : "text-[color:var(--plan)]"}`
                                    : `w-full text-[28px] font-extrabold leading-none text-text/15 ${inactiveTitleAlign}`
                                }
                              >
                                {p.title}
                              </div>

                              <div className={`${CONTENT_MOTION} ${contentState}`} style={{ transitionDelay: contentDelay }}>
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
                            <div className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`} style={{ transitionDelay: contentDelay }}>
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
                            <div className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`} style={{ transitionDelay: contentDelay }}>
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
                            <div className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`} style={{ transitionDelay: contentDelay }}>
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
                                className={[
                                  isActive ? "btn-lift-outline" : "",
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

              {/* PANEL */}
              <div
                className={`absolute inset-0 ${PANEL_MOTION} ${
                  expandedPlan ? "opacity-100 translate-y-0 blur-0 pointer-events-auto" : "opacity-0 translate-y-2 blur-[2px] pointer-events-none"
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
