"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { Eye, X, ChevronLeft, ChevronRight, Layers, Workflow } from "lucide-react";

type ViewMode = "services" | "process";
type ServiceId = "consulting" | "custom" | "turnkey";

type Service = {
  id: ServiceId;
  navTitle: string; // для табов в фрейме
  title2: [string, string]; // заголовок: 2 строки (вторая может быть пустой, но место сохраняем)
  tone: "blue" | "green" | "red";
  lead3: [string, string, string]; // описание: 3 строки
  tags: string; // 1 строка
  brief2: [string, string]; // блок “Коротко”: 1 строка + 1 строка
  points3: [string, string, string]; // 3 пункта, 1 строка каждый
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

const TELEGRAM_HREF = "https://t.me/uni_smb";

function useOnceInView<T extends HTMLElement>(threshold = 0.12, rootMargin = "0px 0px -12% 0px") {
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
            <div className="text-[36px] md:text-[40px] font-extrabold leading-[1.05] text-text">
              {service.title2[0]}
              {service.title2[1] ? <span className="block">{service.title2[1]}</span> : null}
            </div>

            {/* (1) немного больше отступ между заголовком и описанием */}
            <div className="mt-5 text-[16px] md:text-[18px] font-medium text-text/85">
              {details.lead}
            </div>

            <div className="mt-4 text-[14px] font-semibold text-text/55">{details.tags}</div>
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
                  isOn ? "bg-bg/65 border-2" : "bg-bg/25 border border-text/10 text-text/65 hover:text-text",
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

          {/* CTA */}
          <div className="mt-10">
            <a
              href={service.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex w-full items-center justify-center rounded-xl border border-text/15 bg-bg/40 px-6 py-4 text-center text-[18px] font-extrabold text-text backdrop-blur"
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
    {
      title: "Знания и промпты",
      items: ["Адаптация документов для базы знаний", "Упаковка базы знаний", "Написание промптов"],
    },
    {
      title: "Сборка и запуск",
      items: ["Разработка MVP-версии", "Тестирование", "Внесение правок", "Доведение до итоговой версии"],
    },
    { title: "Интеграции", items: ["CRM/ERP/площадки/сервисы", "Права, маршрутизация, события"] },
    { title: "Сопровождение", items: ["Контроль качества", "Улучшения по аналитике и данным", "План развития (roadmap)"] },
  ];

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl bg-accent-3 border border-text/10" style={{ ["--tone" as any]: toneHex }}>
      <div className="h-full px-10 py-8">
        <div className="flex items-start gap-4">
          <div className="min-w-0">
            <div className="text-[30px] md:text-[32px] font-extrabold leading-[1.05] text-text">Интеграции под ключ</div>
            <div className="mt-3 text-[15px] md:text-[16px] font-medium text-text/70">
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
              href={TELEGRAM_HREF}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex w-full items-center justify-center rounded-xl border border-text/15 bg-bg/40 px-6 py-4 text-center text-[18px] font-extrabold text-text backdrop-blur"
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
        navTitle: "Обучение и консалтинг",
        title2: ["Обучение команд", "и консалтинг"],
        tone: "blue",
        lead3: ["Обучаем руководителей и команды тому,", "как применять нейросети в ежедневной работе", "и получать измеримый эффект."],
        tags: "Руководители • Команды • Практика • Результат",
        brief2: ["Учим работать с", "ChatGPT, Claude, Notion, NotebookLM и др."],
        points3: ["Документация, регламенты, база знаний", "Отчёты, аналитика, KPI, управленческие сводки", "Таблицы, расчёты, финмодели, Excel-рутины"],
        ctaHref: TELEGRAM_HREF,
      },
      {
        id: "custom",
        navTitle: "Индивидуальная разработка",
        title2: ["Индивидуальная", "разработка"],
        tone: "green",
        lead3: ["Проектная разработка решений под вашу", "задачу: от идеи и ТЗ до готового внедрения", "и сопровождения."],
        tags: "Проектно • Под ключ • Интеграции • Сопровождение",
        brief2: ["Делаем", "ИИ-инструменты, сайты и интернет-магазины и др."],
        points3: ["Сбор требований и формализация задачи", "Разработка MVP и доведение до итоговой версии", "Запуск, контроль качества, улучшения по данным"],
        ctaHref: TELEGRAM_HREF,
      },
      {
        id: "turnkey",
        navTitle: "Интеграции под ключ",
        title2: ["Интеграции под Ваши", "задачи и инфраструктуру"],
        tone: "red",
        lead3: ["Мы знаем, насколько важно сохранить", "удобство пользования инструментами для команды, поэтому", "интегрируем наши решения в Вашу экосистему"],
        tags: "Аудит • Подготовка требований • Интеграция • Сопровождение",
        brief2: ["Интеграции с", "AmoCRM, Битрикс24, 1С, трекеры и ERP и др."],
        points3: ["Аудит и метрики результата", "База знаний, промпты, MVP", "Интеграции, права, события"],
        ctaHref: TELEGRAM_HREF,
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
          { title: "Что делаем", items: ["Документация, регламенты, база знаний", "Отчёты, аналитика, KPI, управленческие сводки", "Таблицы, расчёты, финмодели, Excel-рутины", "Договоры, письма, коммерческие предложения", "Сценарии, промпты, стандарты качества ответов"] },
          { title: "Формат", items: ["Сессии с практикой на ваших задачах", "Шаблоны и стандарты для команды", "Фиксация результата в документах"] },
        ],
      },
      custom: {
        lead: "Проектная разработка решений под вашу задачу: от идеи и ТЗ до готового внедрения и сопровождения.",
        tags: "Проектно • Под ключ • Интеграции • Сопровождение",
        sections: [
          { title: "Этапы/состав работ", items: ["Сбор требований и формализация задачи", "Проектирование логики, ролей, сценариев", "Разработка MVP и доведение до итоговой версии", "Интеграции с сервисами, CRM/ERP, площадками", "Запуск, контроль качества, улучшения по данным"] },
          { title: "Как ведём проект", items: ["Прозрачные статусы и контроль качества", "Проверка гипотез по данным", "Доработки без хаоса"] },
        ],
      },
      turnkey: {
        lead: "Мы знаем, насколько важно сохранить удобство пользования инструментами для команды, поэтому интегрируем наши решения в Вашу экосистему.",
        tags: "Аудит • Подготовка требований • Интеграция • Сопровождение",
        sections: [
          { title: "Диагностика", items: ["Аудит", "Фиксация целей и метрик результата"] },
          { title: "Проектирование", items: ["Разработка ТЗ", "Декомпозиция сценариев и ролей"] },
          { title: "Знания и промпты", items: ["Адаптация документов и информации для базы знаний", "Упаковка базы знаний", "Написание промптов"] },
          { title: "Сборка и запуск", items: ["Разработка MVP-версии", "Тестирование", "Внесение правок", "Доработка до итоговой версии"] },
          { title: "Интеграции", items: ["Интеграции с сервисами/площадками/платформами, CRM, ERP", "Права, маршрутизация, события"] },
          { title: "Сопровождение", items: ["Контроль качества", "Улучшения по аналитике и данным", "План развития (roadmap)"] },
          { title: "Примечание", items: ["Стоимость интеграций зависит от состава систем и глубины сценариев."] },
        ],
      },
    }),
    [],
  );

  const CARD_H = 620;
  const INTERVAL = "24px";

  // колода: 3 карты
  const W_INACTIVE = "33.333%";
  const W_ACTIVE = "44%";
  const ACTIVE_SHIFT = "3%";

  const activeIdx = services.findIndex((s) => s.id === active);

  const leftFor = (i: number) => {
    if (i !== activeIdx) return `${i * 33.333}%`;
    if (activeIdx === 0) return "0%";
    if (activeIdx === services.length - 1) return `calc(100% - ${W_ACTIVE})`;
    return `calc(${i * 33.333}% - ${ACTIVE_SHIFT})`;
  };

  const radiusForInactive = (i: number) => {
    if (i === 0) return "rounded-l-[30px] rounded-r-none";
    if (i === services.length - 1) return "rounded-r-[30px] rounded-l-none";
    return "rounded-none";
  };

  // (5) правый неактивный заголовок: даём отступ справа/слева и не упираем в край
  const inactiveTitlePaddingFor = (i: number) => (i < activeIdx ? "pr-6" : "pl-6");
  const titleAlignForInactive = (i: number) => (i < activeIdx ? "text-left" : "text-right");

  const tabs = useMemo(
    () =>
      services.map((s) => ({
        id: s.id,
        title: s.navTitle,
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

  useEffect(() => {
    setExpanded(null);
  }, [mode]);

  const REVEAL_BASE =
    "transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

  const PANEL_MOTION =
    "will-change-[opacity,transform,filter] transition-[opacity,transform,filter] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  const CARD_MOTION =
    "will-change-[left,width,box-shadow,border-color,background-color] transition-[left,width,box-shadow,border-color,background-color] duration-[560ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";

  const CONTENT_MOTION =
    "will-change-[opacity,filter,transform] transition-[opacity,filter,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  const expandedToneHex = expandedService ? TONE[expandedService.tone].hex : TONE[activeService.tone].hex;
  const expandedBorderClass = expandedService ? "border-[color:var(--tone)]" : "border-text/10";

  // (2)(3)(4) точечная правка вертикальных интервалов:
  // - уменьшили третий ряд, чтобы нижний разделитель был ближе к списку
  // - увеличили четвертый ряд, чтобы был чуть больший «воздух» снизу, при этом в CTA мы уменьшаем верхний padding
  const ROWS_SERVICES = "grid-rows-[210px_110px_154px_146px]";

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
              {/* (6) убрали "Режим просмотра" */}

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
                    {/* (6) чуть ниже по вертикали */}
                    <span className="relative top-[1px] inline-flex items-center gap-2">
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
                    {/* (6) чуть ниже по вертикали */}
                    <span className="relative top-[1px] inline-flex items-center gap-2">
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
                    {services.map((s, i) => {
                      const isActive = s.id === active;
                      const toneHex = TONE[s.tone].hex;

                      const contentState = isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]";

                      return (
                        <div
                          key={s.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isActive}
                          onClick={() => setActive(s.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActive(s.id);
                            }
                          }}
                          className="text-left outline-none"
                        >
                          <div
                            className={[
                              "overflow-hidden rounded-[28px]",
                              isActive ? "bg-accent-3 ring-2 ring-[color:var(--tone)]" : "bg-bg ring-1 ring-text/15",
                            ].join(" ")}
                            style={{ ["--tone" as any]: toneHex, ["--i" as any]: INTERVAL }}
                          >
                            <div className={`grid h-full ${ROWS_SERVICES} ${isActive ? "divide-y divide-text/20" : "divide-y divide-text/10"}`}>
                              {/* 1 */}
                              <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                                <div className="flex h-full flex-col justify-between">
                                  <div
                                    className={[
                                      "text-[26px] font-extrabold leading-[1.05]",
                                      isActive ? "text-[color:var(--tone)]" : `text-text/20 ${titleAlignForInactive(i)} ${inactiveTitlePaddingFor(i)}`,
                                    ].join(" ")}
                                  >
                                    <div className="min-h-[56px]">
                                      <div className="truncate">{s.title2[0]}</div>
                                      <div className="truncate">{s.title2[1] || <span className="opacity-0">.</span>}</div>
                                    </div>
                                  </div>

                                  <div className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}>
                                    {/* (1) больше воздуха между заголовком и описанием: чуть увеличили mt */}
                                    <div className="mt-1 space-y-1 text-[14px] font-medium leading-[1.25] text-text/80">
                                      {s.lead3.map((l) => (
                                        <div key={l} className="truncate">
                                          {l}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-4 text-[13px] font-semibold text-text/55 truncate">{s.tags}</div>
                                  </div>
                                </div>
                              </div>

                              {/* 2 */}
                              <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                                <div className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}>
                                  <div className="text-[16px] font-extrabold text-text truncate">{s.brief2[0]}</div>
                                  <div className="mt-3 text-[14px] font-medium text-text/70 truncate">{s.brief2[1]}</div>
                                </div>
                              </div>

                              {/* 3 */}
                              <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                                <div className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}>
                                  <ul className="space-y-2 text-[15px] font-medium text-text/85">
                                    {s.points3.map((it) => (
                                      <li key={it} className="flex gap-3">
                                        <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-text/35" />
                                        <span className="min-w-0 truncate">{it}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* 4 */}
                              <div className="px-8 pt-3 pb-5">
                                {/* (3) меньше от разделителя до кнопок: pt-3 вместо pt-[var(--i)]
                                    (4) больше воздуха снизу: pb-5 */}
                                <div className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"} flex h-full items-end`}>
                                  <div className="flex w-full items-center gap-3">
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      aria-label="Изучить возможности"
                                      title="Изучить возможности"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openDetails(s.id);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          openDetails(s.id);
                                        }
                                      }}
                                      className="btn-lift-outline inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/35 text-[color:var(--tone)] backdrop-blur"
                                    >
                                      <Eye className="h-5 w-5" />
                                    </div>

                                    <a
                                      href={s.ctaHref}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn-lift-outline inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[color:var(--tone)] px-5 text-[16px] font-extrabold text-bg"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Написать нам
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* desktop */}
              <div className="relative hidden md:block">
                <div className="relative" style={{ height: CARD_H }}>
                  <div
                    className={`absolute inset-0 transition-[opacity,filter] duration-400 ease-out ${
                      expanded ? "opacity-0 blur-[1px] pointer-events-none" : "opacity-100 blur-0"
                    }`}
                  >
                    {services.map((s, i) => {
                      const isActive = s.id === active;
                      const toneHex = TONE[s.tone].hex;

                      const ringClass = isActive ? "ring-2 ring-[color:var(--tone)]" : "ring-1 ring-text/15";
                      const bgClass = isActive ? "bg-accent-3" : "bg-bg";
                      const radiusClass = isActive ? "rounded-[30px]" : radiusForInactive(i);
                      const inactiveTitleAlign = titleAlignForInactive(i);

                      const shadow = isActive
                        ? "shadow-[0_22px_70px_rgba(0,0,0,0.10)]"
                        : "shadow-[0_16px_46px_rgba(0,0,0,0.06)]";

                      const contentState = isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]";
                      const contentDelay = isActive ? "140ms" : "0ms";

                      return (
                        <div
                          key={s.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isActive}
                          onClick={() => setActive(s.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActive(s.id);
                            }
                          }}
                          className={`absolute top-0 h-full text-left outline-none ${CARD_MOTION}`}
                          style={{
                            left: leftFor(i),
                            width: isActive ? W_ACTIVE : W_INACTIVE,
                            zIndex: isActive ? 50 : 10 + i,
                            ["--tone" as any]: toneHex,
                            ["--i" as any]: INTERVAL,
                          }}
                        >
                          <div className={`h-full overflow-hidden ${radiusClass} ${bgClass} ${ringClass} ${shadow}`}>
                            <div className={`grid h-full ${ROWS_SERVICES} ${isActive ? "divide-y divide-text/25" : "divide-y divide-text/10"}`}>
                              {/* 1 */}
                              <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                <div className="flex h-full flex-col justify-between">
                                  <div
                                    className={
                                      isActive
                                        ? "text-[26px] font-extrabold leading-[1.05] text-[color:var(--tone)]"
                                        : `w-full text-[24px] font-extrabold leading-[1.05] text-text/15 ${inactiveTitleAlign} ${inactiveTitlePaddingFor(i)}`
                                    }
                                  >
                                    <div className="min-h-[56px]">
                                      <div className="truncate">{s.title2[0]}</div>
                                      <div className="truncate">{s.title2[1] || <span className="opacity-0">.</span>}</div>
                                    </div>
                                  </div>

                                  <div
                                    className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}
                                    style={{ transitionDelay: contentDelay }}
                                  >
                                    {/* (1) чуть увеличили отступ между заголовком и описанием */}
                                    <div className="mt-1 space-y-1 text-[15px] font-medium leading-[1.25] text-text/80">
                                      {s.lead3.map((l) => (
                                        <div key={l} className="truncate">
                                          {l}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-4 text-[13px] font-semibold text-text/55 truncate">{s.tags}</div>
                                  </div>
                                </div>
                              </div>

                              {/* 2 */}
                              <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                <div
                                  className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}
                                  style={{ transitionDelay: contentDelay }}
                                >
                                  <div className="text-[18px] font-extrabold text-text truncate">{s.brief2[0]}</div>
                                  <div className="mt-3 text-[14px] font-medium text-text/70 truncate">{s.brief2[1]}</div>
                                </div>
                              </div>

                              {/* 3 */}
                              <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                <div
                                  className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"}`}
                                  style={{ transitionDelay: contentDelay }}
                                >
                                  <ul className="space-y-2 text-[16px] font-medium text-text/85">
                                    {s.points3.map((it) => (
                                      <li key={it} className="flex gap-3">
                                        <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-text/35" />
                                        <span className="min-w-0 truncate">{it}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* 4 */}
                              <div className="px-10 pt-3 pb-6">
                                {/* (3) меньше от разделителя до кнопок: pt-3
                                    (4) больше воздуха снизу: pb-6 */}
                                <div
                                  className={`${CONTENT_MOTION} ${contentState} ${isActive ? "pointer-events-auto" : "pointer-events-none"} flex h-full items-end`}
                                  style={{ transitionDelay: contentDelay }}
                                >
                                  <div className="flex w-full items-center gap-3">
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      aria-label="Изучить возможности"
                                      title="Изучить возможности"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openDetails(s.id);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          openDetails(s.id);
                                        }
                                      }}
                                      className="btn-lift-outline inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[color:var(--tone)] bg-bg/35 text-[color:var(--tone)] backdrop-blur"
                                    >
                                      <Eye className="h-5 w-5" />
                                    </div>

                                    <a
                                      href={s.ctaHref}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn-lift-outline inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[color:var(--tone)] px-5 text-[16px] font-extrabold text-bg"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Написать нам
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`absolute inset-0 ${PANEL_MOTION} ${
                      expandedService ? "opacity-100 translate-y-0 blur-0 pointer-events-auto" : "opacity-0 translate-y-2 blur-[2px] pointer-events-none"
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
            <div className="relative" style={{ height: CARD_H }}>
              <ProcessFrame toneHex={TONE.red.hex} />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

