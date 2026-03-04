"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/Container";
import {
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Workflow,
  MessageCircle,
  MoveHorizontal,
} from "lucide-react";

type ViewMode = "services" | "process";
type ServiceId = "consulting" | "custom" | "turnkey";

type Service = {
  id: ServiceId;
  navTitle: string;
  title2: [string, string];
  mobileTitle2?: [string, string];
  tone: "blue" | "green" | "red";
  lead3: [string, string, string];
  mobileLead3?: [string, string, string];
  tags: string;
  brief2: [string, string];
  points3: [string, string, string];
  ctaHref: string;
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

function MobileScaleFrame({
  children,
  width = 600,
  height = 760,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      const w = Math.min(el.getBoundingClientRect().width, width);
      setScale(w / width);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={outerRef}
      className="mx-auto w-full max-w-[600px]"
      style={{ height: height * scale }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FullBleedDivider() {
  return <div className="h-px w-[calc(100%+80px)] -mx-[40px] bg-text/20" />;
}

function MobileServiceCard({
  service,
  toneHex,
  onOpenDetails,
  onPrev,
  onNext,
  canPrev,
  canNext,
  onSwipe,
}: {
  service: Service;
  toneHex: string;
  onOpenDetails: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const mobileTitle = service.mobileTitle2 ?? service.title2;
  const mobileLead = service.mobileLead3 ?? service.lead3;

  return (
    <MobileScaleFrame height={760}>
      <div
        className="h-full w-full"
        onTouchStart={(e) => {
          const t = e.touches[0];
          touchStartX.current = t.clientX;
          touchStartY.current = t.clientY;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null || touchStartY.current == null) return;

          const t = e.changedTouches[0];
          const dx = t.clientX - touchStartX.current;
          const dy = t.clientY - touchStartY.current;

          touchStartX.current = null;
          touchStartY.current = null;

          if (Math.abs(dx) < 26) return;
          if (Math.abs(dx) < Math.abs(dy)) return;

          onSwipe(dx < 0 ? "left" : "right");
        }}
      >
        <div
          className="h-full w-full overflow-hidden rounded-[30px] bg-accent-3 border-[3px]"
          style={{ borderColor: toneHex }}
        >
          <div className="flex h-full flex-col px-[40px] pt-[30px] pb-[30px]">
            <div className="flex items-start justify-between gap-4">
              <div
                className="text-[48px] font-extrabold leading-[1.02]"
                style={{ color: toneHex }}
              >
                <div>{mobileTitle[0]}</div>
                <div>{mobileTitle[1]}</div>
              </div>

              <div className="inline-flex h-[54px] w-[54px] items-center justify-center rounded-full bg-bg/65">
                <motion.div
                  animate={{ x: [0, 5, -5, 0] }}
                  transition={{
                    duration: 0.58,
                    ease: [0.16, 1, 0.3, 1],
                    repeat: Infinity,
                    repeatDelay: 2.4,
                  }}
                >
                  <MoveHorizontal className="h-6 w-6 text-text/55" />
                </motion.div>
              </div>
            </div>

            <div className="mt-[14px] w-full text-[20px] font-medium leading-[1.24] text-text/88">
              <div>{mobileLead[0]}</div>
              <div>{mobileLead[1]}</div>
              <div>{mobileLead[2]}</div>
            </div>

            <div className="mt-[10px] text-[14px] font-semibold leading-[1.22] text-text/55">
              {service.tags}
            </div>

            <div className="mt-[24px]">
              <FullBleedDivider />
            </div>

            <div className="mt-[24px] text-[24px] font-extrabold leading-none text-text">
              {service.brief2[0]}
            </div>

            <div className="mt-[9px] text-[20px] font-medium leading-[1.24] text-text/78">
              {service.brief2[1]}
            </div>

            <div className="mt-[24px]">
              <FullBleedDivider />
            </div>

            <div className="mt-[24px] space-y-[6px] text-[20px] font-medium leading-[1.24] text-text/88">
              <div>{service.points3[0]}</div>
              <div>{service.points3[1]}</div>
              <div>{service.points3[2]}</div>
            </div>

            <div className="mt-[24px]">
              <FullBleedDivider />
            </div>

            <button
              type="button"
              onClick={onOpenDetails}
              className="mt-[24px] inline-flex items-center gap-3 text-left text-[24px] font-extrabold leading-none text-text"
            >
              <span>Изучить возможности</span>
              <Eye className="h-7 w-7" />
            </button>

            <div className="mt-auto pt-[48px]">
              <div className="flex items-center gap-[14px]">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!canPrev}
                  className={[
                    "btn-lift-outline inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-bg/60",
                    canPrev ? "opacity-100" : "opacity-40 cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Предыдущая услуга"
                >
                  <ChevronLeft className="h-7 w-7 text-text" />
                </button>

                <a
                  href={service.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-lift-outline inline-flex h-[76px] flex-1 items-center justify-center rounded-[24px] text-center text-[26px] font-extrabold text-bg"
                  style={{ backgroundColor: toneHex }}
                >
                  Написать нам
                </a>

                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canNext}
                  className={[
                    "btn-lift-outline inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-bg/60",
                    canNext ? "opacity-100" : "opacity-40 cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Следующая услуга"
                >
                  <ChevronRight className="h-7 w-7 text-text" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileScaleFrame>
  );
}

function MobileDetailsCard({
  service,
  details,
  toneHex,
  onPrev,
  onNext,
  canPrev,
  canNext,
  onClose,
}: {
  service: Service;
  details: ServiceDetails;
  toneHex: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onClose: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const mobileTitle = service.mobileTitle2 ?? service.title2;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [service.id]);

  return (
    <MobileScaleFrame height={760}>
      <div
        className="h-full w-full overflow-hidden rounded-[30px] bg-accent-3 border-[3px]"
        style={{ borderColor: toneHex }}
      >
        <div className="flex h-full flex-col px-[40px] pt-[30px] pb-[30px]">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div
                className="text-[44px] font-extrabold leading-[1.02]"
                style={{ color: toneHex }}
              >
                <div>{mobileTitle[0]}</div>
                <div>{mobileTitle[1]}</div>
              </div>

              <div className="mt-[12px] text-[18px] font-medium leading-[1.24] text-text/86">
                {details.lead}
              </div>

              <div className="mt-[10px] text-[14px] font-semibold leading-[1.22] text-text/55">
                {details.tags}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-bg/65"
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 text-text" />
            </button>
          </div>

          <div className="mt-[22px]">
            <FullBleedDivider />
          </div>

          <div
            ref={bodyRef}
            className="mt-[22px] min-h-0 flex-1 overflow-auto pr-2"
          >
            <div className="space-y-[20px]">
              {details.sections.map((section) => (
                <div key={section.title} className="w-full">
                  <div className="text-left text-[22px] font-extrabold leading-none text-text">
                    {section.title}
                  </div>

                  <div className="mt-[9px] space-y-[7px]">
                    {section.items.map((item) => (
                      <div
                        key={item}
                        className="text-left text-[18px] font-medium leading-[1.24] text-text/84"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-[22px] flex items-center gap-[14px]">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              className={[
                "btn-lift-outline inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-bg/60",
                canPrev ? "opacity-100" : "opacity-40 cursor-not-allowed",
              ].join(" ")}
              aria-label="Предыдущая услуга"
            >
              <ChevronLeft className="h-7 w-7 text-text" />
            </button>

            <a
              href={service.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex h-[76px] flex-1 items-center justify-center rounded-[24px] text-center text-[26px] font-extrabold text-bg"
              style={{ backgroundColor: toneHex }}
            >
              Написать нам
            </a>

            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              className={[
                "btn-lift-outline inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-bg/60",
                canNext ? "opacity-100" : "opacity-40 cursor-not-allowed",
              ].join(" ")}
              aria-label="Следующая услуга"
            >
              <ChevronRight className="h-7 w-7 text-text" />
            </button>
          </div>
        </div>
      </div>
    </MobileScaleFrame>
  );
}

function MobileProcessCard({
  onClose,
}: {
  onClose: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const steps = [
    { title: "Диагностика", items: ["Аудит", "Фиксация целей и метрик результата"] },
    { title: "Проектирование", items: ["Разработка ТЗ", "Декомпозиция сценариев и ролей"] },
    {
      title: "Знания и промпты",
      items: [
        "Адаптация документов для базы знаний",
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
        "Доведение до итоговой версии",
      ],
    },
    {
      title: "Интеграции",
      items: ["CRM/ERP/площадки/сервисы", "Права, маршрутизация, события"],
    },
    {
      title: "Сопровождение",
      items: [
        "Контроль качества",
        "Улучшения по аналитике и данным",
        "План развития (roadmap)",
      ],
    },
  ];

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <MobileScaleFrame height={760}>
      <div
        className="h-full w-full overflow-hidden rounded-[30px] bg-accent-3 border-[3px]"
        style={{ borderColor: TONE.red.hex }}
      >
        <div className="flex h-full flex-col px-[40px] pt-[30px] pb-[30px]">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div
                className="text-[44px] font-extrabold leading-[1.02]"
                style={{ color: TONE.red.hex }}
              >
                Интеграции под ключ
              </div>

              <div className="mt-[12px] text-[18px] font-medium leading-[1.24] text-text/86">
                Прозрачный процесс: от аудита и ТЗ до запуска, интеграций и сопровождения.
              </div>

              <div className="mt-[10px] text-[14px] font-semibold leading-[1.22] text-text/55">
                Примечание: стоимость интеграций зависит от состава систем и глубины сценариев.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-bg/65"
              aria-label="Закрыть"
            >
              <X className="h-6 w-6 text-text" />
            </button>
          </div>

          <div className="mt-[22px]">
            <FullBleedDivider />
          </div>

          <div
            ref={bodyRef}
            className="mt-[22px] min-h-0 flex-1 overflow-auto pr-2"
          >
            <div className="space-y-[20px]">
              {steps.map((step) => (
                <div key={step.title} className="w-full">
                  <div className="text-left text-[22px] font-extrabold leading-none text-text">
                    {step.title}
                  </div>

                  <div className="mt-[9px] space-y-[7px]">
                    {step.items.map((item) => (
                      <div
                        key={item}
                        className="text-left text-[18px] font-medium leading-[1.24] text-text/84"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-[22px]">
            <a
              href={TELEGRAM_HREF}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex h-[76px] w-full items-center justify-center rounded-[24px] text-center text-[26px] font-extrabold text-bg"
              style={{ backgroundColor: TONE.red.hex }}
            >
              Написать нам
            </a>
          </div>
        </div>
      </div>
    </MobileScaleFrame>
  );
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
      <div className="h-full px-10 py-8 flex flex-col">
        <div className="flex items-start gap-6">
          <div className="min-w-0">
            <div className="text-[36px] md:text-[40px] font-extrabold leading-[1.05] text-text">
              {service.title2[0]}
              {service.title2[1] ? <span className="block">{service.title2[1]}</span> : null}
            </div>

            <div className="mt-5 text-[16px] md:text-[18px] font-medium text-text/85">
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

            <a
              href={service.ctaHref}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Написать нам"
              title="Написать нам"
            >
              <MessageCircle className="h-5 w-5" />
            </a>

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
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>

        <div ref={bodyRef} className="mt-8 flex-1 min-h-0 overflow-auto pr-2 pb-8">
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
        </div>
      </div>
    </div>
  );
}

function ProcessFrame({
  toneHex,
  onClose,
}: {
  toneHex: string;
  onClose: () => void;
}) {
  const steps = [
    { title: "Диагностика", items: ["Аудит", "Фиксация целей и метрик результата"] },
    { title: "Проектирование", items: ["Разработка ТЗ", "Декомпозиция сценариев и ролей"] },
    {
      title: "Знания и промпты",
      items: [
        "Адаптация документов для базы знаний",
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
        "Доведение до итоговой версии",
      ],
    },
    { title: "Интеграции", items: ["CRM/ERP/площадки/сервисы", "Права, маршрутизация, события"] },
    {
      title: "Сопровождение",
      items: [
        "Контроль качества",
        "Улучшения по аналитике и данным",
        "План развития (roadmap)",
      ],
    },
  ];

  return (
    <div
      className="h-full w-full overflow-hidden rounded-3xl bg-accent-3 border border-text/10"
      style={{ ["--tone" as any]: toneHex }}
    >
      <div className="h-full px-10 py-8 flex flex-col">
        <div className="flex items-start gap-4">
          <div className="min-w-0">
            <div className="text-[30px] md:text-[32px] font-extrabold leading-[1.05] text-text">
              Интеграции под ключ
            </div>
            <div className="mt-3 text-[15px] md:text-[16px] font-medium text-text/70">
              Прозрачный процесс: от аудита и ТЗ до запуска, интеграций и сопровождения.
            </div>
            <div className="mt-3 text-[13px] font-semibold text-text/55">
              Примечание: стоимость интеграций зависит от состава систем и глубины сценариев.
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-start gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-text/10 bg-bg/25 px-4 py-2 text-[13px] font-semibold text-text/70">
              <Workflow className="h-4 w-4" />
              <span>6 этапов</span>
            </div>

            <a
              href={TELEGRAM_HREF}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Написать нам"
              title="Написать нам"
            >
              <MessageCircle className="h-5 w-5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Закрыть"
              title="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex-1 min-h-0 overflow-auto pr-2 pb-8">
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
        lead3: [
          "Обучаем руководителей и команды тому,",
          "как применять нейросети в ежедневной работе",
          "и получать измеримый эффект.",
        ],
        tags: "Руководители • Команды • Практика • Результат",
        brief2: ["Учим работать с", "ChatGPT, Claude, Notion, NotebookLM и др."],
        points3: [
          "Документация, регламенты, база знаний",
          "Отчёты, аналитика, KPI, управленческие сводки",
          "Таблицы, расчёты, финмодели, Excel-рутины",
        ],
        ctaHref: TELEGRAM_HREF,
      },
      {
        id: "custom",
        navTitle: "Индивидуальная разработка",
        title2: ["Индивидуальная", "разработка"],
        tone: "green",
        lead3: [
          "Проектная разработка решений под вашу",
          "задачу: от идеи и ТЗ до готового внедрения",
          "и сопровождения.",
        ],
        tags: "Проектно • Под ключ • Интеграции • Сопровождение",
        brief2: ["Делаем", "ИИ-инструменты, сайты и интернет-магазины и др."],
        points3: [
          "Сбор требований и формализация задачи",
          "Разработка MVP и доведение до итоговой версии",
          "Запуск, контроль качества, улучшения по данным",
        ],
        ctaHref: TELEGRAM_HREF,
      },
      {
        id: "turnkey",
        navTitle: "Интеграции под ключ",
        title2: ["Интеграции под Ваши", "задачи и инфраструктуру"],
        mobileTitle2: ["Интеграции под", "Ваши задачи"],
        tone: "red",
        lead3: [
          "Мы знаем, насколько важно сохранить",
          "удобство пользования инструментами для команды, поэтому",
          "интегрируем наши решения в Вашу экосистему",
        ],
        mobileLead3: [
          "Мы знаем, насколько важно сохранить",
          "удобство пользования инструментами для команды,",
          "поэтому интегрируем наши решения в Вашу экосистему",
        ],
        tags: "Аудит • Подготовка требований • Интеграция • Сопровождение",
        brief2: ["Интеграции с", "AmoCRM, Битрикс24, 1С, трекеры и ERP и др."],
        points3: [
          "Аудит и метрики результата",
          "База знаний, промпты, MVP",
          "Интеграции, права, события",
        ],
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
        lead: "Мы знаем, насколько важно сохранить удобство пользования инструментами для команды, поэтому интегрируем наши решения в Вашу экосистему.",
        tags: "Аудит • Подготовка требований • Интеграция • Сопровождение",
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

  const CARD_H = 580;
  const INTERVAL = "24px";

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

  const titleAlignForInactive = (i: number) => (i < activeIdx ? "text-left" : "text-right");

  const inactiveTitleInsetFor = (i: number, isActive: boolean) => {
    if (isActive) return "";
    if (i < activeIdx) return "";
    if (i > activeIdx && i !== services.length - 1) return "pr-8";
    return "pr-18";
  };

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

  const goPrevCollapsed = () => {
    const idx = services.findIndex((s) => s.id === active);
    if (idx <= 0) return;
    setActive(services[idx - 1].id);
  };

  const goNextCollapsed = () => {
    const idx = services.findIndex((s) => s.id === active);
    if (idx >= services.length - 1) return;
    setActive(services[idx + 1].id);
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

  const ROWS_SERVICES = "grid-rows-[220px_110px_140px_110px]";

  return (
    <section
      ref={sectionRef as any}
      id="integrations"
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

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        {/* MOBILE */}
        <div className="md:hidden">
          <div
            className={`${REVEAL_BASE} ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="hover-accent text-[18px] font-medium opacity-70">
              услуги | интеграции
            </div>

            <div className="mt-5">
              <div className="inline-flex rounded-[16px] bg-accent-1 p-[2px]">
                <div className="flex rounded-[14px] bg-accent-1 p-[2px]">
                  <button
                    type="button"
                    onClick={() => setMode("services")}
                    className={
                      mode === "services"
                        ? "rounded-[12px] bg-accent-3 px-4 py-2 text-[13px] font-semibold text-text"
                        : "rounded-[12px] px-4 py-2 text-[13px] font-semibold text-bg/90"
                    }
                    aria-pressed={mode === "services"}
                  >
                    <span className="inline-flex items-center justify-center gap-2 leading-none">
                      <Layers className="h-[13px] w-[13px] shrink-0" />
                      <span className="leading-none">Услуги</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("process")}
                    className={
                      mode === "process"
                        ? "rounded-[12px] bg-accent-3 px-4 py-2 text-[13px] font-semibold text-text"
                        : "rounded-[12px] px-4 py-2 text-[13px] font-semibold text-bg/75"
                    }
                    aria-pressed={mode === "process"}
                  >
                    <span className="inline-flex items-center justify-center gap-2 leading-none">
                      <Workflow className="h-[13px] w-[13px] shrink-0" />
                      <span className="leading-none">Процесс</span>
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
            style={{ transitionDelay: "80ms" }}
          >
            {mode === "services" ? (
              expandedService ? (
                <MobileDetailsCard
                  service={expandedService}
                  details={DETAILS[expandedService.id]}
                  toneHex={expandedToneHex}
                  onPrev={goPrev}
                  onNext={goNext}
                  canPrev={canPrev}
                  canNext={canNext}
                  onClose={closeDetails}
                />
              ) : (
                <MobileServiceCard
                  service={activeService}
                  toneHex={TONE[activeService.tone].hex}
                  onOpenDetails={() => openDetails(activeService.id)}
                  onPrev={goPrevCollapsed}
                  onNext={goNextCollapsed}
                  canPrev={activeIdx > 0}
                  canNext={activeIdx < services.length - 1}
                  onSwipe={(dir) => {
                    if (dir === "left") goNextCollapsed();
                    else goPrevCollapsed();
                  }}
                />
              )
            ) : (
              <MobileProcessCard onClose={() => setMode("services")} />
            )}
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block">
          <div className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="hover-accent text-[18px] font-medium opacity-70">услуги | интеграции</div>

              <div className="flex items-center gap-3">
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
                      <span className="inline-flex items-center justify-center gap-2 leading-none">
                        <Layers className="h-[14px] w-[14px] shrink-0" />
                        <span className="leading-none">Услуги</span>
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
                      <span className="inline-flex items-center justify-center gap-2 leading-none">
                        <Workflow className="h-[14px] w-[14px] shrink-0" />
                        <span className="leading-none">Процесс интеграции</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} mt-10`}
            style={{ transitionDelay: "80ms" }}
          >
            {mode === "services" ? (
              <div className="relative">
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

                      const contentState = isActive
                        ? "opacity-100 translate-y-0 blur-0"
                        : "opacity-0 translate-y-1 blur-[2px]";
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
                            <div
                              className={`grid h-full ${ROWS_SERVICES} ${
                                isActive ? "divide-y divide-text/25" : "divide-y divide-text/10"
                              }`}
                            >
                              <div className="px-10 pt-[var(--i)] pb-[calc(var(--i)+10px)]">
                                <div className="flex h-full flex-col justify-start">
                                  <div
                                    className={
                                      isActive
                                        ? "text-[26px] font-extrabold leading-[1.05] text-[color:var(--tone)]"
                                        : `w-full text-[24px] font-extrabold leading-[1.05] text-text/15 ${inactiveTitleAlign} ${inactiveTitleInsetFor(i, isActive)}`
                                    }
                                  >
                                    <div className="min-h-[56px]">
                                      <div className="truncate">{s.title2[0]}</div>
                                      <div className="truncate">
                                        {s.title2[1] || <span className="opacity-0">.</span>}
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    className={`${CONTENT_MOTION} ${contentState} ${
                                      isActive ? "pointer-events-auto" : "pointer-events-none"
                                    }`}
                                    style={{ transitionDelay: contentDelay }}
                                  >
                                    <div className="mt-5 space-y-1 text-[15px] font-medium leading-[1.25] text-text/80">
                                      {s.lead3.map((l) => (
                                        <div key={l} className="truncate">
                                          {l}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-4 text-[13px] font-semibold text-text/55 truncate">
                                      {s.tags}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                                <div
                                  className={`${CONTENT_MOTION} ${contentState} ${
                                    isActive ? "pointer-events-auto" : "pointer-events-none"
                                  }`}
                                  style={{ transitionDelay: contentDelay }}
                                >
                                  <div className="text-[18px] font-extrabold text-text truncate">
                                    {s.brief2[0]}
                                  </div>
                                  <div className="mt-3 text-[14px] font-medium text-text/70 truncate">
                                    {s.brief2[1]}
                                  </div>
                                </div>
                              </div>

                              <div className="px-10 pt-[var(--i)] pb-4">
                                <div
                                  className={`${CONTENT_MOTION} ${contentState} ${
                                    isActive ? "pointer-events-auto" : "pointer-events-none"
                                  }`}
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

                              <div className="px-10 pt-2 pb-8">
                                <div
                                  className={`${CONTENT_MOTION} ${contentState} ${
                                    isActive ? "pointer-events-auto" : "pointer-events-none"
                                  } flex h-full items-end`}
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
            ) : (
              <div className="relative" style={{ height: CARD_H }}>
                <ProcessFrame
                  toneHex={TONE.red.hex}
                  onClose={() => setMode("services")}
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
