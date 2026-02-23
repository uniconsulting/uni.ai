"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { Eye, X, ChevronLeft, ChevronRight, Layers, Workflow } from "lucide-react";

type ViewMode = "services" | "process";
type ServiceId = "consulting" | "custom" | "turnkey";

type Service = {
  id: ServiceId;
  tone: "blue" | "green" | "red";

  // карточка: всегда 2 строки
  title2: [string, string];

  // карточка: всегда 3 строки
  lead3: [string, string, string];

  // строка под описанием (в одну строку)
  tagsLine: string;

  // блок "Коротко": 1 строка + 1 строка
  shortTitle: string;
  shortSub: string;

  // 3 пункта: каждый в одну строку
  preview3: [string, string, string];

  // CTA
  ctaHref: string; // Telegram
};

type ServiceDetails = {
  lead: string;
  tags: string;
  sections: Array<{ title: string; items: string[] }>;
};

const TONE: Record<Service["tone"], { hex: string }> = {
  blue: { hex: "#5B86C6" },
  green: { hex: "#49C874" },
  red: { hex: "#C94444" },
};

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

function titleFull(s: Service) {
  return `${s.title2[0]} ${s.title2[1]}`.replace(/\s+/g, " ").trim();
}

function openExternal(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

function DetailsFrame({
  service,
  details,
  borderClass,
  toneHex,
  tabs,
  activeId,
  onSelect,
  onPrev,
  onNext,
  canPrev,
  canNext,
  onClose,
}: {
  service: Service;
  details: ServiceDetails;
  borderClass: string;
  toneHex: string;
  tabs: Array<{ id: ServiceId; title: string; hex: string }>;
  activeId: ServiceId;
  onSelect: (id: ServiceId) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onClose: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [service.id]);

  return (
    <div
      className={`h-full w-full overflow-hidden rounded-3xl bg-accent-3 border-2 ${borderClass}`}
      style={{ ["--tone" as any]: toneHex }}
    >
      <div className="h-full px-10 py-8">
        {/* top */}
        <div className="flex items-start gap-6">
          <div className="min-w-0">
            <div className="text-[36px] font-extrabold leading-[1.05] text-text">
              <span className="block">{service.title2[0]}</span>
              <span className="block">{service.title2[1]}</span>
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
              aria-label="Предыдущая услуга"
              title="Предыдущая (←)"
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
              aria-label="Следующая услуга"
              title="Следующая (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Закрыть"
              title="Закрыть (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const isOn = t.id === activeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={[
                  "btn-lift-outline inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold",
                  isOn
                    ? "bg-bg/65 border-2"
                    : "bg-bg/25 border border-text/10 text-text/65 hover:text-text",
                ].join(" ")}
                style={isOn ? { borderColor: t.hex } : undefined}
                aria-pressed={isOn}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.hex }} />
                <span className="truncate">{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* body */}
        <div ref={bodyRef} className="mt-8 h-[calc(100%-188px)] overflow-auto pr-2">
          <div className="grid gap-8 md:grid-cols-2">
            {details.sections.map((s) => (
              <div key={s.title} className="min-w-0">
                <div className="text-[18px] font-extrabold text-text">{s.title}</div>

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

          {/* CTA (внизу) */}
          <div className="mt-10">
            <a
              href={service.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex w-full items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/40 px-6 py-4 text-center text-[18px] font-extrabold text-[color:var(--tone)] backdrop-blur"
            >
              Написать нам
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessFrame({ toneHex }: { toneHex: string }) {
  const steps = [
    { title: "Диагностика", items: ["Аудит", "Фиксация целей и метрик результата"] },
    { title: "Проектирование", items: ["Разработка ТЗ", "Декомпозиция сценариев и ролей"] },
    { title: "Знания и промпты", items: ["Адаптация документов для базы знаний", "Упаковка базы знаний", "Написание промптов"] },
    { title: "Сборка и запуск", items: ["Разработка MVP-версии", "Тестирование", "Внесение правок", "Доведение до итоговой версии"] },
    { title: "Интеграции", items: ["CRM/ERP/площадки/сервисы", "Права, маршрутизация, события"] },
    { title: "Сопровождение", items: ["Контроль качества", "Улучшения по аналитике и данным", "План развития (roadmap)"] },
  ];

  return (
    <div
      className="h-full w-full overflow-hidden rounded-3xl bg-accent-3 border border-text/10"
      style={{ ["--tone" as any]: toneHex }}
    >
      <div className="h-full px-10 py-8">
        <div className="flex items-start gap-4">
          <div className="min-w-0">
            <div className="text-[32px] font-extrabold leading-[1.05] text-text">
              Интеграции под ключ
            </div>
            <div className="mt-3 text-[16px] font-medium text-text/70">
              Прозрачный процесс: от аудита и ТЗ до запуска, интеграций и сопровождения.
            </div>
            <div className="mt-3 text-[13px] font-semibold text-text/55">
              Примечание: стоимость интеграций зависит от состава систем и глубины сценариев.
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-start">
            <div className="inline-flex items-center gap-2 rounded-xl border border-text/10 bg-bg/25 px-4 py-2 text-[13px] font-semibold text-text/70">
              <Workflow className="h-4 w-4" />
              <span>6 этапов</span>
            </div>
          </div>
        </div>

        <div className="mt-8 h-[calc(100%-132px)] overflow-auto pr-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="rounded-2xl border border-text/10 bg-bg/20 p-6">
                <div className="text-[18px] font-extrabold text-text">{s.title}</div>
                <ul className="mt-4 space-y-2 text-[15px] font-medium text-text/80">
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

          <div className="mt-6">
            <a
              href="https://t.me/uni_smb"
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex w-full items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/40 px-6 py-4 text-center text-[18px] font-extrabold text-[color:var(--tone)] backdrop-blur"
            >
              Написать нам
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicesIntegrations() {
  const [mode, setMode] = useState<ViewMode>("services");
  const [active, setActive] = useState<ServiceId>("consulting");
  const [expanded, setExpanded] = useState<ServiceId | null>(null);

  const { ref: sectionRef, inView } = useOnceInView<HTMLElement>();

  const services: Service[] = useMemo(
    () => [
      {
        id: "consulting",
        tone: "blue",
        title2: ["Обучение команд", "и консалтинг"],
        lead3: [
          "Обучаем руководителей и команды тому,",
          "как применять нейросети в ежедневной работе",
          "и получать измеримый эффект.",
        ],
        tagsLine: "Руководители • Команды • Практика • Результат",
        shortTitle: "Учим работать с",
        shortSub: "ChatGPT, Claude, Notion, NotebookLM и др.",
        preview3: [
          "Документация, регламенты, база знаний",
          "Отчёты, аналитика, KPI, управленческие сводки",
          "Таблицы, расчёты, финмодели, Excel-рутины",
        ],
        ctaHref: "https://t.me/uni_smb",
      },
      {
        id: "custom",
        tone: "green",
        title2: ["Индивидуальная", "разработка"],
        lead3: [
          "Проектная разработка решений под вашу",
          "",
          "задачу: от идеи и ТЗ до готового внедрения и сопровождения.",
        ],
        tagsLine: "Проектно • Под ключ • Интеграции • Сопровождение",
        shortTitle: "Делаем",
        shortSub: "ИИ-инструменты, сайты и интернет-магазины и др.",
        preview3: [
          "Сбор требований и формализация",
          "Разработка MVP и доведение до версии",
          "Запуск, контроль качества, улучшения",
        ],
        ctaHref: "https://t.me/uni_smb",
      },
      {
        id: "turnkey",
        tone: "red",
        title2: ["Интеграции под Ваши", "задачи и инфраструктуру"],
        lead3: [
          "Мы знаем, насколько важно сохранить",
          "удобство пользования инструментами для команды, поэтому",
          "интегрируем наши решения в Вашу экосистему",
        ],
        tagsLine: "Аудит Подготовка требований Интеграция Сопровождение",
        shortTitle: "Интеграции с",
        shortSub: "AmoCRM Битрикс24 1С трекеры и ERP и др.",
        preview3: [
          "Аудит и метрики результата",
          "База знаний, промпты, MVP",
          "Интеграции, права, события",
        ],
        ctaHref: "https://t.me/uni_smb",
      },
    ],
    [],
  );

  const DETAILS: Record<ServiceId, ServiceDetails> = useMemo(
    () => ({
      consulting: {
        lead: "Обучаем руководителей и команды тому, как применять нейросети в ежедневной работе и получать измеримый эффект.",
        tags: "Руководители • Команды • Практика • Результат",
        sections: [
          {
            title: "Что делаем",
            items: [
              "Документация, регламенты, база знаний",
              "Отчёты, аналитика, KPI, управленческие сводки",
              "Таблицы, расчёты, финмодели, Excel-рутины",
              "Договоры, письма, коммерческие предложения",
              "Сценарии, промпты, стандарты качества ответов",
            ],
          },
          {
            title: "Формат",
            items: [
              "Сессии с практикой на ваших задачах",
              "Шаблоны и стандарты для команды",
              "Фиксация результата в документах",
            ],
          },
        ],
      },

      custom: {
        lead: "Проектная разработка решений под вашу задачу: от идеи и ТЗ до готового внедрения и сопровождения.",
        tags: "Проектно • Под ключ • Интеграции • Сопровождение",
        sections: [
          {
            title: "Этапы/состав работ",
            items: [
              "Сбор требований и формализация задачи",
              "Проектирование логики, ролей, сценариев",
              "Разработка MVP и доведение до итоговой версии",
              "Интеграции с сервисами, CRM/ERP, площадками",
              "Запуск, контроль качества, улучшения по данным",
            ],
          },
          {
            title: "Как ведём проект",
            items: [
              "Прозрачные статусы и контроль качества",
              "Проверка гипотез по данным",
              "Доработки без хаоса",
            ],
          },
        ],
      },

      turnkey: {
        lead: "Прозрачный процесс: от аудита и ТЗ до запуска, интеграций и сопровождения.",
        tags: "Аудит Подготовка требований Интеграция Сопровождение",
        sections: [
          { title: "Диагностика", items: ["Аудит", "Фиксация целей и метрик результата"] },
          { title: "Проектирование", items: ["Разработка ТЗ", "Декомпозиция сценариев и ролей"] },
          {
            title: "Знания и промпты",
            items: [
              "Адаптация документов и информации для базы знаний",
              "Упаковка базы знаний",
              "Написание промптов",
            ],
          },
          {
            title: "Сборка и запуск",
            items: [
              "Разработка MVP-версии",
              "Тестирование",
              "Внесение правок",
              "Доработка до итоговой версии",
            ],
          },
          {
            title: "Интеграции",
            items: [
              "Интеграции с сервисами/площадками/платформами, CRM, ERP",
              "Права, маршрутизация, события",
            ],
          },
          {
            title: "Сопровождение",
            items: [
              "Контроль качества",
              "Улучшения по аналитике и данным",
              "План развития (roadmap)",
            ],
          },
          {
            title: "Примечание",
            items: ["Стоимость интеграций зависит от состава систем и глубины сценариев."],
          },
        ],
      },
    }),
    [],
  );

  // ниже пакетов: делаем карточки ниже по высоте
  const CARD_H = 660;
  const INTERVAL = "24px";

  const tabs = useMemo(
    () =>
      services.map((s) => ({
        id: s.id,
        title: titleFull(s),
        hex: TONE[s.tone].hex,
      })),
    [services],
  );

  const activeService = services.find((s) => s.id === active) ?? services[0];
  const expandedService = expanded ? services.find((s) => s.id === expanded) : null;

  const expandedIdx = expanded ? services.findIndex((s) => s.id === expanded) : -1;
  const canPrev = expandedIdx > 0;
  const canNext = expandedIdx >= 0 && expandedIdx < services.length - 1;

  const setExpandedTo = (id: ServiceId) => {
    setActive(id);
    setExpanded(id);
  };

  const openDetails = (id: ServiceId) => setExpandedTo(id);
  const closeDetails = () => setExpanded(null);

  const goPrev = () => {
    if (!expanded || !canPrev) return;
    setExpandedTo(services[expandedIdx - 1].id);
  };

  const goNext = () => {
    if (!expanded || !canNext) return;
    setExpandedTo(services[expandedIdx + 1].id);
  };

  // клавиатура: ← → и Esc (только когда открыт фрейм)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, expandedIdx, canPrev, canNext, services]);

  // если переключили режим, закрываем раскрытие
  useEffect(() => {
    setExpanded(null);
  }, [mode]);

  const REVEAL_BASE =
    "transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

  const PANEL_MOTION =
    "will-change-[opacity,transform,filter] transition-[opacity,transform,filter] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  const expandedToneHex = expandedService
    ? TONE[expandedService.tone].hex
    : TONE[activeService.tone].hex;

  const expandedBorderClass = expandedService ? "border-[color:var(--tone)]" : "border-text/10";

  // карточка услуг: фиксируем 4 ряда (desktop)
  const ROWS_SERVICES = "grid-rows-[240px_110px_190px_120px]";

  return (
    <section
      ref={sectionRef as any}
      id="integrations"
      className={`relative ${inView ? "opacity-100" : "opacity-0"} transition-opacity duration-700 ease-out`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10 transition-opacity duration-700 ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        {/* label + view mode switch */}
        <div className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="hover-accent text-[18px] font-medium opacity-70">услуги | интеграции</div>

            <div className="flex items-center gap-3">
              <div className="text-[13px] font-semibold text-text/55">Режим просмотра</div>

              <div className="rounded-2xl bg-accent-1 p-[3px]">
                <div className="flex rounded-2xl bg-accent-1 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("services")}
                    className={
                      mode === "services"
                        ? "rounded-xl bg-accent-3 px-6 py-3 text-[14px] font-semibold text-text"
                        : "rounded-xl px-6 py-3 text-[14px] font-semibold text-bg/85"
                    }
                    aria-pressed={mode === "services"}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>Услуги</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("process")}
                    className={
                      mode === "process"
                        ? "rounded-xl bg-accent-3 px-6 py-3 text-[14px] font-semibold text-text"
                        : "rounded-xl px-6 py-3 text-[14px] font-semibold text-bg/70"
                    }
                    aria-pressed={mode === "process"}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Workflow className="h-4 w-4" />
                      <span>Процесс интеграции</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* main zone */}
        <div
          className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} mt-10`}
          style={{ transitionDelay: "80ms" }}
        >
          {/* SERVICES MODE */}
          {mode === "services" ? (
            <>
              {/* mobile */}
              <div className="md:hidden">
                {expandedService ? (
                  <div style={{ height: CARD_H }}>
                    <DetailsFrame
                      service={expandedService}
                      details={DETAILS[expandedService.id]}
                      borderClass={expandedBorderClass}
                      toneHex={expandedToneHex}
                      tabs={tabs}
                      activeId={expandedService.id}
                      onSelect={setExpandedTo}
                      onPrev={goPrev}
                      onNext={goNext}
                      canPrev={canPrev}
                      canNext={canNext}
                      onClose={closeDetails}
                    />
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {services.map((s) => {
                      const isActive = s.id === active;
                      const toneHex = TONE[s.tone].hex;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActive(s.id)}
                          className="text-left"
                          aria-pressed={isActive}
                        >
                          <div
                            className={[
                              "overflow-hidden rounded-[28px]",
                              isActive
                                ? "bg-accent-3 ring-2 ring-[color:var(--tone)]"
                                : "bg-bg ring-1 ring-text/15",
                            ].join(" ")}
                            style={{ ["--tone" as any]: toneHex, ["--i" as any]: INTERVAL }}
                          >
                            <div className="p-8">
                              {/* title: 2 строки */}
                              <div
                                className={[
                                  "text-[26px] font-extrabold leading-[1.05]",
                                  isActive ? "text-[color:var(--tone)]" : "text-text/25",
                                ].join(" ")}
                              >
                                <span className="block truncate">{s.title2[0]}</span>
                                <span className="block truncate">{s.title2[1]}</span>
                              </div>

                              {/* lead: 3 строки */}
                              <div className="mt-4 text-[15px] font-medium leading-[1.25] text-text/80">
                                {s.lead3.map((l, idx) => (
                                  <div key={idx} className="truncate">
                                    {l || "\u00A0"}
                                  </div>
                                ))}
                              </div>

                              {/* tags: 1 строка */}
                              <div className="mt-3 text-[13px] font-semibold text-text/55 truncate">
                                {s.tagsLine}
                              </div>

                              {/* short: 1 + 1 */}
                              <div className="mt-6">
                                <div className="text-[16px] font-extrabold text-text truncate">
                                  {s.shortTitle}
                                </div>
                                <div className="mt-2 text-[14px] font-medium text-text/70 truncate">
                                  {s.shortSub}
                                </div>
                              </div>

                              {/* 3 пункта: по 1 строке */}
                              <ul className="mt-6 space-y-2 text-[15px] font-medium text-text/85">
                                {s.preview3.map((it) => (
                                  <li key={it} className="flex gap-3">
                                    <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-text/35" />
                                    <span className="min-w-0 truncate">{it}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* CTA: одна строка (Eye + Написать нам) */}
                              <div className="mt-8 flex items-center gap-3">
                                <button
                                  type="button"
                                  className="btn-lift-outline inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/40 text-[color:var(--tone)] backdrop-blur"
                                  aria-label="Изучить возможности"
                                  title="Изучить возможности"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openDetails(s.id);
                                  }}
                                >
                                  <Eye className="h-5 w-5" />
                                </button>

                                <button
                                  type="button"
                                  className="btn-lift-outline inline-flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/40 px-5 text-[16px] font-extrabold text-[color:var(--tone)] backdrop-blur"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openExternal(s.ctaHref);
                                  }}
                                >
                                  Написать нам
                                </button>
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
                    <div className="grid h-full grid-cols-3 gap-4">
                      {services.map((s) => {
                        const isActive = s.id === active;
                        const toneHex = TONE[s.tone].hex;

                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActive(s.id)}
                            aria-pressed={isActive}
                            className="h-full text-left"
                            style={{ ["--tone" as any]: toneHex, ["--i" as any]: INTERVAL }}
                          >
                            <div
                              className={[
                                "h-full overflow-hidden rounded-[30px]",
                                isActive
                                  ? "bg-accent-3 ring-2 ring-[color:var(--tone)]"
                                  : "bg-bg ring-1 ring-text/15",
                                isActive
                                  ? "shadow-[0_22px_70px_rgba(0,0,0,0.10)]"
                                  : "shadow-[0_16px_46px_rgba(0,0,0,0.06)]",
                              ].join(" ")}
                            >
                              <div
                                className={`grid h-full ${ROWS_SERVICES} ${
                                  isActive ? "divide-y divide-text/25" : "divide-y divide-text/10"
                                }`}
                              >
                                {/* 1: title (2) + lead (3) + tags (1) */}
                                <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                  <div className="flex h-full flex-col">
                                    <div
                                      className={[
                                        "text-[26px] font-extrabold leading-[1.05]",
                                        isActive ? "text-[color:var(--tone)]" : "text-text/25",
                                      ].join(" ")}
                                    >
                                      <span className="block truncate">{s.title2[0]}</span>
                                      <span className="block truncate">{s.title2[1]}</span>
                                    </div>

                                    <div className="mt-5 text-[15px] font-medium leading-[1.25] text-text/80">
                                      {s.lead3.map((l, idx) => (
                                        <div key={idx} className="truncate">
                                          {l || "\u00A0"}
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-4 text-[13px] font-semibold text-text/55 truncate">
                                      {s.tagsLine}
                                    </div>
                                  </div>
                                </div>

                                {/* 2: shortTitle (1) + shortSub (1) */}
                                <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                  <div className="text-[18px] font-extrabold text-text truncate">
                                    {s.shortTitle}
                                  </div>
                                  <div className="mt-3 text-[14px] font-medium text-text/70 truncate">
                                    {s.shortSub}
                                  </div>
                                </div>

                                {/* 3: 3 пункта по 1 строке */}
                                <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                  <ul className="space-y-2 text-[16px] font-medium text-text/85">
                                    {s.preview3.map((it) => (
                                      <li key={it} className="flex gap-3">
                                        <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-text/35" />
                                        <span className="min-w-0 truncate">{it}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* 4: CTA row */}
                                <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                  <div className="flex h-full items-end">
                                    <div className="flex w-full items-center gap-3">
                                      <button
                                        type="button"
                                        className="btn-lift-outline inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/40 text-[color:var(--tone)] backdrop-blur"
                                        aria-label="Изучить возможности"
                                        title="Изучить возможности"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          openDetails(s.id);
                                        }}
                                      >
                                        <Eye className="h-6 w-6" />
                                      </button>

                                      <button
                                        type="button"
                                        className="btn-lift-outline inline-flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/40 px-5 text-[16px] font-extrabold text-[color:var(--tone)] backdrop-blur"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          openExternal(s.ctaHref);
                                        }}
                                      >
                                        Написать нам
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PANEL */}
                  <div
                    className={`absolute inset-0 ${PANEL_MOTION} ${
                      expandedService
                        ? "opacity-100 translate-y-0 blur-0 pointer-events-auto"
                        : "opacity-0 translate-y-2 blur-[2px] pointer-events-none"
                    }`}
                  >
                    {expandedService ? (
                      <DetailsFrame
                        service={expandedService}
                        details={DETAILS[expandedService.id]}
                        borderClass={expandedBorderClass}
                        toneHex={expandedToneHex}
                        tabs={tabs}
                        activeId={expandedService.id}
                        onSelect={setExpandedTo}
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
            </>
          ) : (
            /* PROCESS MODE */
            <div className="relative" style={{ height: CARD_H }}>
              <ProcessFrame toneHex={TONE[activeService.tone].hex} />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
