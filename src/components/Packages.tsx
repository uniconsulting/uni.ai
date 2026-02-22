"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { Eye } from "lucide-react";

type Billing = "monthly" | "yearly";
type PlanId = "test" | "small" | "mid" | "ent";

type Plan = {
  id: PlanId;
  title: string;
  tone: "neutral" | "blue" | "green" | "red";
  desc4: [string, string, string, string];
  monthly: number; // ₽/мес (базовая)
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

export function Packages() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [active, setActive] = useState<PlanId>("test");

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

  // 1) выше карточки
  const CARD_H = 820;

  // 2) активная ширина меньше
  const W_INACTIVE = "25%";
  const W_ACTIVE = "30%";
  const ACTIVE_SHIFT = "2.5%";

  const leftFor = (i: number) => {
    if (i !== activeIdx) return `${i * 25}%`;
    if (activeIdx === 0) return "0%";
    if (activeIdx === 3) return `calc(100% - ${W_ACTIVE})`;
    return `calc(${i * 25}% - ${ACTIVE_SHIFT})`;
  };

  // фиксированная сетка секций
  const ROWS = "grid-rows-[250px_190px_190px_190px]";

  const radiusForInactive = (i: number) => {
    if (i === 0) return "rounded-l-[30px] rounded-r-none";
    if (i === plans.length - 1) return "rounded-r-[30px] rounded-l-none";
    return "rounded-none";
  };

  const titleAlignForInactive = (i: number) => (i < activeIdx ? "text-left" : "text-right");

  return (
    <section id="pricing" className="relative">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[160px] md:h-[260px] lg:h-[300px] w-px -translate-x-1/2 bg-text/10"
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          <div className="md:pr-12">
            <div className="text-[22px] md:text-[26px] lg:text-[28px] font-extrabold text-accent-1">Сделай выбор</div>

            <h2 className="mt-3 font-semibold leading-[1.05] tracking-tight text-[22px] md:text-[26px] lg:text-[28px]">
              <span className="block">Прозрачные условия,</span>
              <span className="block">никаких скрытых платежей.</span>
            </h2>
          </div>

          <div className="md:pl-12">
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

        {/* === Пакеты === */}
        <div className="mt-12 md:mt-14">
          {/* mobile fallback */}
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
                    style={{ ["--plan" as any]: tone.hex }}
                  >
                    <div className={`grid h-full ${ROWS} ${isActive ? "divide-y divide-text/20" : "divide-y divide-text/10"}`}>
                      <div className="p-8">
                        <div
                          className={
                            isActive
                              ? `text-[34px] font-extrabold leading-none ${isNeutral ? "text-text" : "text-[color:var(--plan)]"}`
                              : "text-[28px] font-extrabold leading-none text-text/15"
                          }
                        >
                          {p.title}
                        </div>

                        <div className={isActive ? "mt-4 space-y-1 text-[16px] font-medium text-text/90" : "mt-4 opacity-0"}>
                          {p.desc4.map((l) => (
                            <div key={l} className="whitespace-nowrap">
                              {l}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8">
                        <div className={isActive ? "opacity-100" : "opacity-0"}>
                          <div className="flex items-end gap-3">
                            <div className={`text-[36px] font-extrabold leading-none ${isNeutral ? "text-text" : "text-[color:var(--plan)]"}`}>
                              {formatRub(price)}
                            </div>
                            <div className="text-[28px] font-semibold leading-none text-text/35">/ мес</div>
                          </div>
                          <div className="mt-3 text-[13px] font-semibold text-text/45">
                            <div>{p.integrations2[0]}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className={isActive ? "opacity-100" : "opacity-0"}>
                          <div className="text-[18px] font-extrabold text-text">Ключевые параметры</div>
                          <div className="mt-4 space-y-1 text-[16px] font-medium text-text/90">
                            {p.params3.map((l) => (
                              <div key={l} className="whitespace-nowrap">
                                {l}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className={isActive ? "opacity-100" : "opacity-0"}>
                          <div className="flex items-center gap-3 text-[18px] font-extrabold text-text">
                            <span>Изучить возможности</span>
                            <Eye className="h-6 w-6" />
                          </div>

                          <div className="mt-5">
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
                  </div>
                </button>
              );
            })}
          </div>

          {/* desktop deck */}
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

                // 5) у неактивных внутренних стыков без скругления
                const radiusClass = isActive ? "rounded-[30px]" : radiusForInactive(i);

                // 6 + 8) размер 28px в неактиве + выравнивание
                const inactiveTitleAlign = titleAlignForInactive(i);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActive(p.id)}
                    aria-pressed={isActive}
                    className="absolute top-0 h-full"
                    style={{
                      left: leftFor(i),
                      width: isActive ? W_ACTIVE : W_INACTIVE,
                      zIndex: isActive ? 50 : 10 + i,
                      transition: "left 420ms cubic-bezier(0.2, 0.8, 0.2, 1), width 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                      ["--plan" as any]: tone.hex,
                    }}
                  >
                    <div className={`h-full overflow-hidden ${radiusClass} ${bgClass} ${ringClass} shadow-[0_18px_50px_rgba(0,0,0,0.06)]`}>
                      {/* 3) активные разделители насыщеннее */}
                      <div className={`grid h-full ${ROWS} ${isActive ? "divide-y divide-text/20" : "divide-y divide-text/10"}`}>
                        {/* Section 1 */}
                        <div className="p-10">
                          <div
                            className={
                              isActive
                                ? `text-[44px] font-extrabold leading-none ${isNeutral ? "text-text" : "text-[color:var(--plan)]"}`
                                : `w-full text-[28px] font-extrabold leading-none text-text/15 ${inactiveTitleAlign}`
                            }
                          >
                            {p.title}
                          </div>

                          <div className={isActive ? "mt-6 space-y-1 text-[20px] font-medium leading-[1.15] text-text/90" : "mt-6 opacity-0"}>
                            {p.desc4.map((l) => (
                              <div key={l} className="whitespace-nowrap">
                                {l}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Section 2 */}
                        <div className="p-10">
                          <div className={isActive ? "opacity-100" : "opacity-0"}>
                            <div className="flex items-end gap-4">
                              <div
                                className={
                                  isNeutral
                                    ? "text-[44px] font-extrabold leading-none text-text"
                                    : "text-[44px] font-extrabold leading-none text-[color:var(--plan)]"
                                }
                              >
                                {formatRub(price)}
                              </div>
                              <div className="pb-[2px] text-[34px] font-semibold leading-none text-text/35">/ мес</div>
                            </div>

                            <div className="mt-4 text-[14px] font-semibold text-text/45">
                              <div>{p.integrations2[0]}</div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3 */}
                        <div className="p-10">
                          <div className={isActive ? "opacity-100" : "opacity-0"}>
                            <div className="text-[20px] font-extrabold text-text">Ключевые параметры</div>
                            <div className="mt-5 space-y-1 text-[20px] font-medium leading-[1.15] text-text/90">
                              {p.params3.map((l) => (
                                <div key={l} className="whitespace-nowrap">
                                  {l}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Section 4 */}
                        <div className="p-10">
                          <div className={isActive ? "opacity-100" : "opacity-0"}>
                            <div className="flex items-center gap-4 text-[20px] font-extrabold text-text">
                              <span>Изучить возможности</span>
                              <Eye className="h-7 w-7" />
                            </div>

                            <div className="mt-6">
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
