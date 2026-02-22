"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { Eye } from "lucide-react";

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

const TONE: Record<Plan["tone"], { hex: string }> = {
  neutral: { hex: "#111827" },
  blue: { hex: "#5B86C6" },
  green: { hex: "#49C874" },
  red: { hex: "#C94444" },
};

function formatRub(n: number) {
  return `${new Intl.NumberFormat("ru-RU").format(n)}₽`;
}

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

export function Packages() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [active, setActive] = useState<PlanId>("test");

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

  const activeIdx = plans.findIndex((p) => p.id === active);

  const priceFor = (p: Plan) => {
    if (p.monthly === 0) return 0;
    if (billing === "monthly") return p.monthly;
    return Math.round(p.monthly * 0.8);
  };

  // геометрия
  const CARD_H = 740;
  const W_INACTIVE = "25%";
  const W_ACTIVE = "30%";
  const ACTIVE_SHIFT = "2.5%";

  const leftFor = (i: number) => {
    if (i !== activeIdx) return `${i * 25}%`;
    if (activeIdx === 0) return "0%";
    if (activeIdx === 3) return `calc(100% - ${W_ACTIVE})`;
    return `calc(${i * 25}% - ${ACTIVE_SHIFT})`;
  };

  // фиксированные высоты секций, чтобы divider-ы везде были на одной высоте
  const ROWS = "grid-rows-[220px_140px_180px_190px]";

  // один-единственный интервал для пунктов 1-8
  const INTERVAL = "28px";

  const radiusForInactive = (i: number) => {
    if (i === 0) return "rounded-l-[30px] rounded-r-none";
    if (i === plans.length - 1) return "rounded-r-[30px] rounded-l-none";
    return "rounded-none";
  };

  const titleAlignForInactive = (i: number) => (i < activeIdx ? "text-left" : "text-right");

  // новая анимация “перелистывания”: без scale/translate карточки
  const CARD_MOTION =
    "will-change-[left,width,box-shadow,border-color,background-color] transition-[left,width,box-shadow,border-color,background-color] duration-[560ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";

  // премиальный показ/скрытие контента (отдельно от движения карточки)
  const CONTENT_MOTION =
    "will-change-[opacity,filter,transform] transition-[opacity,filter,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  const REVEAL_BASE =
    "transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

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
          <div className="grid gap-6 md:hidden">
            {plans.map((p) => {
              const isActive = p.id === active;
              const tone = TONE[p.tone];
              const price = priceFor(p);
              const isNeutral = p.tone === "neutral";

              return (
                <button key={p.id} type="button" onClick={() => setActive(p.id)} className="text-left" aria-pressed={isActive}>
                  <div
                    className={
                      isActive
                        ? "overflow-hidden rounded-[28px] bg-accent-3 ring-2 ring-[color:var(--plan)]"
                        : "overflow-hidden rounded-[28px] bg-bg ring-1 ring-text/15"
                    }
                    style={{ ["--plan" as any]: tone.hex, ["--i" as any]: INTERVAL }}
                  >
                    <div className={`grid h-full ${ROWS} ${isActive ? "divide-y divide-text/20" : "divide-y divide-text/10"}`}>
                      {/* 1 */}
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

                      {/* 2 */}
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

                      {/* 3 */}
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

                      {/* 4 */}
                      <div className="px-8 pt-[var(--i)] pb-[var(--i)]">
                        <div className={`${CONTENT_MOTION} ${isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px]"} flex h-full flex-col justify-between`}>
                          <div className="flex items-center gap-3 text-[18px] font-extrabold text-text">
                            <span>Изучить возможности</span>
                            <Eye className="h-6 w-6" />
                          </div>

                          <div
                            className={
                              p.ctaStyle === "fill"
                                ? "w-full rounded-xl bg-[color:var(--plan)] px-6 py-4 text-center text-[18px] font-extrabold text-bg"
                                : "w-full rounded-xl border-2 border-[color:var(--plan)] px-6 py-4 text-center text-[18px] font-extrabold text-[color:var(--plan)]"
                            }
                            style={isNeutral && p.ctaStyle === "outline" ? { borderColor: "var(--text)", color: "var(--text)" } : undefined}
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

          {/* desktop */}
          <div className="relative hidden md:block">
            <div className="relative" style={{ height: CARD_H }}>
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
                        {/* Section 1 */}
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

                        {/* Section 2 */}
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

                        {/* Section 3 */}
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

                        {/* Section 4 */}
                        <div className="px-10 pt-[var(--i)] pb-[var(--i)]">
                          <div className={`${CONTENT_MOTION} ${contentState} flex h-full flex-col justify-between`} style={{ transitionDelay: contentDelay }}>
                            <div className="flex items-center gap-4 text-[20px] font-extrabold text-text">
                              <span>Изучить возможности</span>
                              <Eye className="h-7 w-7" />
                            </div>

                            <div
                              className={
                                p.ctaStyle === "fill"
                                  ? "w-full rounded-xl bg-[color:var(--plan)] px-6 py-4 text-center text-[20px] font-extrabold text-bg"
                                  : "w-full rounded-xl border-2 border-[color:var(--plan)] px-6 py-4 text-center text-[20px] font-extrabold text-[color:var(--plan)]"
                              }
                              style={isNeutral && p.ctaStyle === "outline" ? { borderColor: "var(--text)", color: "var(--text)" } : undefined}
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
          </div>
        </div>
      </Container>
    </section>
  );
}

