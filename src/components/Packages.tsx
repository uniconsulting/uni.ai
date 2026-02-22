"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { Eye } from "lucide-react";

type Billing = "monthly" | "yearly";
type PlanId = "test" | "small" | "mid" | "ent";

type Plan = {
  id: PlanId;
  title: string;
  description: string;
  priceMonthly: number;
  integrationNote: string;
  params: string[];
  cta: string;
  tone: {
    text: string; // заголовок + цена
    ring: string; // рамка активной карточки
    btn: "outline" | "solid";
    btnBg?: string;
    btnText?: string;
    btnBorder?: string;
  };
};

function money(v: number) {
  return new Intl.NumberFormat("ru-RU").format(v);
}

export function Packages() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [active, setActive] = useState<PlanId>("test");

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "test",
        title: "Тестовый",
        description:
          "Соберите первых ассистентов и оцените интерфейс, аналитику и логику работы.",
        priceMonthly: 0,
        integrationNote: "нет интеграции от ЮНИ",
        params: ["2 кастомных агента", "2 готовых агента", "До 1 000 сообщений / мес"],
        cta: "Попробовать",
        tone: {
          text: "text-text",
          ring: "ring-text/70",
          btn: "outline",
          btnBorder: "border-text/60",
          btnText: "text-text",
        },
      },
      {
        id: "small",
        title: "Малый",
        description:
          "Для небольших команд: быстрый запуск по инструкциям ЮНИ + лёгкая помощь эксперта.",
        priceMonthly: 9900,
        integrationNote: "интеграции: от 179 900₽ / разово *",
        params: ["5 кастомных агентов", "+ вся библиотека готовых", "До 5 000 сообщений / мес"],
        cta: "Попробовать",
        tone: {
          text: "text-[#5B86C5]",
          ring: "ring-[#5B86C5]",
          btn: "outline",
          btnBorder: "border-[#5B86C5]",
          btnText: "text-[#5B86C5]",
        },
      },
      {
        id: "mid",
        title: "Средний",
        description:
          "Для масштабирования действующих процессов. Полноценная интеграция под ключ командой ЮНИ.",
        priceMonthly: 39900,
        integrationNote: "интеграции: от 179 900₽ / разово *",
        params: ["10 кастомных агентов", "+ вся библиотека готовых", "До 30 000 сообщений / мес"],
        cta: "Подключить сейчас",
        tone: {
          text: "text-[#45C97A]",
          ring: "ring-[#45C97A]",
          btn: "solid",
          btnBg: "bg-[#45C97A]",
          btnText: "text-bg",
        },
      },
      {
        id: "ent",
        title: "Энтерпрайз",
        description:
          "Для крупных компаний: макс. персонализации, SLA и постоянное вовлечение команды ЮНИ.",
        priceMonthly: 99900,
        integrationNote: "интеграции: от 179 900₽ / разово *",
        params: ["индивидуальные лимиты", "Максимум персонализации", "Без ограничений"],
        cta: "Заказать звонок",
        tone: {
          text: "text-[#D14B4B]",
          ring: "ring-[#D14B4B]",
          btn: "solid",
          btnBg: "bg-[#D14B4B]",
          btnText: "text-bg",
        },
      },
    ],
    [],
  );

  const priceFor = (p: Plan) => {
    if (billing === "monthly") return p.priceMonthly;
    // -20% при оплате за год, показываем "эффективную" стоимость / мес
    return Math.round(p.priceMonthly * 0.8);
  };

  return (
    <section id="pricing" className="relative">
      {/* horizontal divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10"
      />

      {/* vertical divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[160px] md:h-[200px] lg:h-[240px] w-px -translate-x-1/2 bg-text/10"
      />

      <Container className="relative z-10 py-12 px-6 md:py-14 md:px-10 lg:px-12">
        {/* ====== Header (как в макете) ====== */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          {/* LEFT */}
          <div className="md:pr-12">
            <div className="text-[22px] font-extrabold text-accent-1 md:text-[26px] lg:text-[28px]">
              Сделай выбор
            </div>

            <h2 className="mt-3 text-[22px] font-semibold leading-[1.05] tracking-tight md:text-[26px] lg:text-[28px]">
              <span className="block">Прозрачные условия,</span>
              <span className="block">никаких скрытых платежей.</span>
            </h2>
          </div>

          {/* RIGHT */}
          <div className="md:pl-12">
            <div className="flex flex-col items-start md:items-end">
              <div className="hover-accent text-[18px] font-medium opacity-70">
                стоимость | пакеты
              </div>

              <div className="mt-6">
                {/* toggle */}
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
                        <span className={billing === "yearly" ? "text-text/60" : "text-bg/70"}>
                          -20%
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* убрали заглушку */}
            </div>
          </div>
        </div>

        {/* ====== Cards grid ====== */}
        <div className="mt-12 md:mt-14">
          <div className="rounded-3xl bg-accent-3 ring-1 ring-text/10 overflow-hidden">
            <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-text/10">
              {plans.map((p) => {
                const isActive = p.id === active;
                const price = priceFor(p);
                const showPayYearHint = billing === "yearly" && p.priceMonthly > 0;

                return (
                  <div key={p.id} className="relative">
                    {/* overlay click для неактивных карточек (без вложенных кнопок) */}
                    {!isActive && (
                      <button
                        type="button"
                        className="absolute inset-0 z-[1] cursor-pointer"
                        aria-label={`Выбрать пакет: ${p.title}`}
                        onClick={() => setActive(p.id)}
                      />
                    )}

                    <div
                      className={[
                        "relative h-full min-h-[640px] md:min-h-[680px]",
                        isActive ? "z-[2]" : "z-0",
                      ].join(" ")}
                    >
                      {/* активная рамка поверх сетки */}
                      <div
                        className={[
                          "h-full",
                          isActive
                            ? `rounded-3xl bg-accent-3 ring-2 ${p.tone.ring}`
                            : "bg-transparent",
                        ].join(" ")}
                      >
                        {/* Section 1 */}
                        <div className="px-8 pt-9 pb-8 md:px-10">
                          <div
                            className={[
                              "text-[34px] md:text-[40px] font-extrabold leading-none tracking-tight",
                              isActive ? p.tone.text : "text-text/18",
                            ].join(" ")}
                          >
                            {p.title}
                          </div>

                          <div
                            className={[
                              "mt-5 text-[16px] leading-snug font-medium text-text/90",
                              isActive ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 5,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {p.description}
                          </div>
                        </div>

                        <div className="h-px bg-text/10" />

                        {/* Section 2 */}
                        <div className="px-8 py-8 md:px-10">
                          <div className={isActive ? "opacity-100" : "opacity-0"}>
                            <div className="flex items-baseline gap-3">
                              <div
                                className={[
                                  "text-[38px] md:text-[44px] font-extrabold tracking-tight",
                                  p.priceMonthly === 0 ? "text-text" : p.tone.text,
                                ].join(" ")}
                              >
                                {money(price)}₽
                              </div>
                              <div className="text-[36px] md:text-[40px] font-medium text-text/35">
                                / мес
                              </div>
                            </div>

                            <div className="mt-2 text-[14px] font-medium text-text/40">
                              {p.integrationNote}
                            </div>

                            {showPayYearHint && (
                              <div className="mt-1 text-[12px] font-medium text-text/35">
                                при оплате за год (−20%)
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-text/10" />

                        {/* Section 3 */}
                        <div className="px-8 py-8 md:px-10">
                          <div className={isActive ? "opacity-100" : "opacity-0"}>
                            <div className="text-[20px] font-extrabold text-text">
                              Ключевые параметры
                            </div>

                            <div className="mt-5 space-y-2 text-[22px] leading-tight font-medium text-text">
                              {p.params.map((x) => (
                                <div key={x}>{x}</div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-text/10" />

                        {/* Section 4 */}
                        <div className="px-8 py-8 md:px-10">
                          <div className={isActive ? "opacity-100" : "opacity-0"}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between text-left"
                              onClick={() => {
                                // позже: открыть модал/страницу с возможностями
                              }}
                            >
                              <div className="text-[20px] font-extrabold text-text">
                                Изучить возможности
                              </div>
                              <Eye className="h-6 w-6 text-text" />
                            </button>

                            <button
                              type="button"
                              className={[
                                "mt-6 w-full rounded-xl px-6 py-4 text-[20px] font-extrabold",
                                p.tone.btn === "solid"
                                  ? `${p.tone.btnBg} ${p.tone.btnText}`
                                  : `border-2 ${p.tone.btnBorder} ${p.tone.btnText} bg-transparent`,
                              ].join(" ")}
                              onClick={() => {
                                // позже: lead form / checkout
                              }}
                            >
                              {p.cta}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* мелкая подпись как в макете (звёздочка) */}
          <div className="mt-4 text-[12px] font-medium text-text/40">
            * интеграция зависит от задач и выбранных каналов (CRM, телефония, Telegram и т.д.)
          </div>
        </div>
      </Container>
    </section>
  );
}
