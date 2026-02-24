"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { Calculator, SlidersHorizontal, X, Plus, Minus, Info } from "lucide-react";

type PlanId = "small" | "mid" | "enterprise";

type Plan = {
  id: PlanId;
  title: string;
  priceMonthly: number; // ₽/мес
  tone: "blue" | "green" | "red";
  hint: string;
};

const TONE: Record<Plan["tone"], { hex: string }> = {
  blue: { hex: "#5B86C6" },
  green: { hex: "#49C874" },
  red: { hex: "#C94444" },
};

const DEFAULTS = {
  salaryMonthly: 88894, // ₽/мес, средняя оплата труда МОП по РФ
  hoursPerWeek: 40,
  integrationFee: 179900, // ₽, разово
  replacementFactor: 0.8, // доля замещения (0..1)
};

const PLANS: Plan[] = [
  { id: "small", title: "Малый", priceMonthly: 9900, tone: "blue", hint: "Чат-боты + аналитика, базовый масштаб" },
  { id: "mid", title: "Средний", priceMonthly: 39900, tone: "green", hint: "Больше сценариев и глубже аналитика" },
  { id: "enterprise", title: "Энтерпрайз", priceMonthly: 99900, tone: "red", hint: "Максимальная глубина и масштаб" },
];

function formatRUB(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(v)) + " ₽";
}

function formatPct(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(v) + "%";
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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

export function RoiCalculator() {
  const { ref: sectionRef, inView } = useOnceInView<HTMLElement>();

  const [planId, setPlanId] = useState<PlanId>("mid");
  const [years, setYears] = useState<1 | 2 | 3>(2);

  // быстрые вводные (по умолчанию)
  const [fteTotal, setFteTotal] = useState(1); // эквивалент сотрудников
  const [paramsOpen, setParamsOpen] = useState(false);

  // параметры (модалка)
  const [salaryMonthly, setSalaryMonthly] = useState(DEFAULTS.salaryMonthly);
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULTS.hoursPerWeek);
  const [integrationFee, setIntegrationFee] = useState(DEFAULTS.integrationFee);
  const [includeIntegration, setIncludeIntegration] = useState(true);
  const [replacementFactor, setReplacementFactor] = useState(DEFAULTS.replacementFactor);

  // по ролям (опционально)
  const [useRoles, setUseRoles] = useState(false);
  const [fteMop, setFteMop] = useState(0.5);
  const [fteAdmin, setFteAdmin] = useState(0.25);
  const [fteRop, setFteRop] = useState(0.25);

  // UX: блокируем скролл страницы, пока открыта модалка
  useEffect(() => {
    if (!paramsOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [paramsOpen]);

  // Esc закрывает модалку
  useEffect(() => {
    if (!paramsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setParamsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paramsOpen]);

  const plan = useMemo(() => PLANS.find((p) => p.id === planId) ?? PLANS[0], [planId]);
  const toneHex = TONE[plan.tone].hex;

  const fteEffective = useMemo(() => {
    const base = useRoles ? fteMop + fteAdmin + fteRop : fteTotal;
    return clamp(base, 0, 20);
  }, [useRoles, fteMop, fteAdmin, fteRop, fteTotal]);

  const replacementK = useMemo(() => clamp(replacementFactor, 0, 1), [replacementFactor]);

  const calc = useMemo(() => {
    const months = years * 12;

    const monthlySavings = salaryMonthly * fteEffective * replacementK;
    const monthlyCost = plan.priceMonthly;

    const totalSavings = monthlySavings * months;
    const totalCosts = monthlyCost * months + (includeIntegration ? integrationFee : 0);

    const net = totalSavings - totalCosts;
    const roi = totalCosts > 0 ? (net / totalCosts) * 100 : 0;

    const year1Savings = monthlySavings * 12;
    const year1Costs = monthlyCost * 12 + (includeIntegration ? integrationFee : 0);
    const year1Net = year1Savings - year1Costs;

    const year2Costs = monthlyCost * 12;
    const year2Net = year1Savings - year2Costs; // те же savings, но без интеграции

    // окупаемость по месяцам (интеграция считается "в начале")
    let paybackMonths: number | null = null;
    let cumSavings = 0;
    let cumCosts = includeIntegration ? integrationFee : 0;

    for (let m = 1; m <= months; m += 1) {
      cumCosts += monthlyCost;
      cumSavings += monthlySavings;
      if (cumSavings >= cumCosts) {
        paybackMonths = m;
        break;
      }
    }

    return {
      months,
      monthlySavings,
      monthlyCost,
      totalSavings,
      totalCosts,
      net,
      roi,
      year1Net,
      year2Net,
      paybackMonths,
    };
  }, [years, salaryMonthly, fteEffective, replacementK, plan.priceMonthly, includeIntegration, integrationFee]);

  const REVEAL_BASE =
    "transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

  const pillBtn = (isOn: boolean) =>
    [
      "btn-lift-outline inline-flex items-center justify-center rounded-xl px-4 py-2 text-[13px] font-semibold",
      isOn ? "bg-bg/65 border-2" : "bg-bg/25 border border-text/10 text-text/65 hover:text-text",
    ].join(" ");

  const horizonPillBtn = (isOn: boolean) =>
    [
      "btn-lift-outline inline-flex items-center justify-center rounded-xl px-4 py-2 text-[13px] font-semibold border border-text",
      isOn ? "bg-bg/65 text-text" : "bg-bg/25 text-text/65 hover:text-text",
    ].join(" ");

  return (
    <section
      ref={sectionRef as any}
      id="roi"
      className={`relative ${inView ? "opacity-100" : "opacity-0"} transition-opacity duration-700 ease-out`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10 transition-opacity duration-700 ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        {/* header */}
        <div className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="text-[34px] md:text-[40px] font-extrabold leading-[1.05] text-text">
                Окупаемость через ФОТ
              </div>

              <div className="mt-4 text-[15px] md:text-[16px] font-medium text-text/70 max-w-[820px]">
                <span>Сравниваем стоимость пакета и разовой интеграции с экономией на человеко-часах.</span>
                <br />
                <span>Интеграция оплачивается один раз, поэтому на второй и последующие годы эффект заметно выше.</span>
              </div>
            </div>

            <div className="flex items-center md:justify-end">
              <div className="hover-accent text-[18px] font-medium opacity-70">ROI | Калькулятор</div>
            </div>
          </div>
        </div>

        {/* main */}
        <div
          className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} mt-10`}
          style={{ transitionDelay: "80ms" }}
        >
          <div
            className="rounded-[30px] bg-accent-3 ring-1 ring-text/10 shadow-[0_22px_70px_rgba(0,0,0,0.10)] overflow-hidden"
            style={{ ["--tone" as any]: toneHex }}
          >
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr] divide-y lg:divide-y-0 lg:divide-x divide-text/10">
              {/* inputs */}
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-text">
                    <Calculator className="h-5 w-5 text-accent-3" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-[18px] font-extrabold text-text">Вводные данные</div>
                  </div>
                </div>

                {/* defaults + disclaimer */}
                <div className="mt-4">
                  <div className="text-[13px] font-semibold text-text/55">
                    По умолчанию: ФОТ {formatRUB(DEFAULTS.salaryMonthly)}/мес, {DEFAULTS.hoursPerWeek} ч/нед, интеграция{" "}
                    {formatRUB(DEFAULTS.integrationFee)} разово.
                  </div>

                  <div className="mt-4">
                    <div className="text-[14px] font-extrabold text-accent-1">Дисклеймер</div>
                    <div className="mt-2 text-[13px] font-medium text-text">
                      Расчёт упрощённый. Используем средний ФОТ МОП по РФ ({formatRUB(DEFAULTS.salaryMonthly)}/мес) и
                      коэффициент замещения по умолчанию {formatPct(DEFAULTS.replacementFactor * 100)}. В "Параметры" можно
                      подставить твой контекст.
                    </div>
                  </div>
                </div>

                {/* plan */}
                <div className="mt-8">
                  <div className="text-[14px] font-extrabold text-text">Пакет</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PLANS.map((p) => {
                      const isOn = p.id === planId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPlanId(p.id)}
                          className={pillBtn(isOn)}
                          style={isOn ? { borderColor: TONE[p.tone].hex } : undefined}
                          aria-pressed={isOn}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TONE[p.tone].hex }} />
                            <span>{p.title}</span>
                            <span className="text-text/55">·</span>
                            <span className="text-text/70">{formatRUB(p.priceMonthly)}/мес</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-[14px] font-medium text-text/70">{plan.hint}</div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-text/10 bg-bg/20 px-3 py-2 text-[13px] font-semibold text-text/70">
                      <Info className="h-4 w-4" />
                      <span>Интеграция 1 раз: {formatRUB(integrationFee)}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-xl border border-text/10 bg-bg/20 px-3 py-2 text-[13px] font-semibold text-text/70">
                      <span>Доля замещения</span>
                      <span className="text-text/55">·</span>
                      <span>{formatPct(replacementK * 100)}</span>
                    </div>
                  </div>
                </div>

                {/* fte */}
                <div className="mt-8">
                  <div className="text-[14px] font-extrabold text-text">Эквивалент сотрудников</div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFteTotal((v) => clamp(Math.round((v - 0.25) * 100) / 100, 0, 20))}
                      className="btn-lift-outline inline-flex h-11 w-11 items-center justify-center rounded-xl border border-text/10 bg-bg/25"
                      aria-label="Уменьшить"
                      title="Уменьшить"
                    >
                      <Minus className="h-5 w-5" />
                    </button>

                    <div className="min-w-[160px] rounded-2xl bg-accent-3 border border-accent-2 px-5 py-3 text-center">
                      <div className="text-[22px] font-extrabold text-accent-2">{fteTotal.toFixed(2).replace(/\.00$/, "")}</div>
                      <div className="mt-1 text-[12px] font-semibold text-accent-2">FTE</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFteTotal((v) => clamp(Math.round((v + 0.25) * 100) / 100, 0, 20))}
                      className="btn-lift-outline inline-flex h-11 w-11 items-center justify-center rounded-xl border border-text/10 bg-bg/25"
                      aria-label="Увеличить"
                      title="Увеличить"
                    >
                      <Plus className="h-5 w-5" />
                    </button>

                    <div className="ml-auto hidden md:block text-[13px] font-semibold text-text/55">
                      Если считаешь по ролям, открой "Параметры".
                    </div>
                  </div>

                  <div className="mt-4 text-[13px] font-medium text-text/70">
                    Под капотом: экономия = ФОТ * FTE * доля замещения.
                  </div>
                </div>

                {/* horizon */}
                <div className="mt-8">
                  <div className="text-[14px] font-extrabold text-text">Горизонт расчёта</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3].map((y) => {
                      const isOn = years === y;
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setYears(y as 1 | 2 | 3)}
                          className={horizonPillBtn(isOn)}
                          aria-pressed={isOn}
                        >
                          {y} {y === 1 ? "год" : "года"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* results */}
              <div className="p-8 md:p-10 bg-bg/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[18px] font-extrabold text-text">Результат</div>
                    <div className="mt-1 text-[13px] font-semibold text-text/55">
                      План: {plan.title}, горизонт: {years} {years === 1 ? "год" : "года"}.
                    </div>
                  </div>

                  <div className="shrink-0 inline-flex items-center gap-2 rounded-xl border-2 border-text bg-bg/30 px-4 py-2 text-[13px] font-extrabold text-text">
                    <span>ROI</span>
                    <span className="text-text/55">·</span>
                    <span>{formatPct(calc.roi)}</span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {/* Экономия: bg-accent-1, текст accent-3 */}
                  <div className="rounded-2xl bg-accent-1 p-6">
                    <div className="text-[13px] font-semibold text-accent-3">Экономия в месяц</div>
                    <div className="mt-2 text-[26px] font-extrabold text-accent-3">{formatRUB(calc.monthlySavings)}</div>
                    <div className="mt-2 text-[13px] font-medium text-accent-3/60">
                      ФОТ {formatRUB(salaryMonthly)}/мес · FTE {fteEffective.toFixed(2).replace(/\.00$/, "")} · доля{" "}
                      {formatPct(replacementK * 100)}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Затраты: bg-text, текст accent-3 */}
                    <div className="rounded-2xl bg-text p-6">
                      <div className="text-[13px] font-semibold text-accent-3/80">Затраты (в месяц)</div>
                      <div className="mt-2 text-[22px] font-extrabold text-accent-3">
                        {formatRUB(calc.monthlyCost)}
                        <span className="text-[13px] font-semibold text-accent-3/70"> /мес</span>
                      </div>
                      <div className="mt-2 text-[13px] font-medium text-accent-3/70">
                        + интеграция {includeIntegration ? formatRUB(integrationFee) : formatRUB(0)} разово
                      </div>
                    </div>

                    {/* Окупаемость: bg-text, текст accent-3 */}
                    <div className="rounded-2xl bg-text p-6">
                      <div className="text-[13px] font-semibold text-accent-3/80">Окупаемость</div>
                      <div className="mt-2 text-[22px] font-extrabold text-accent-3">
                        {calc.paybackMonths ? `${calc.paybackMonths} мес` : `не за ${calc.months} мес`}
                      </div>
                      <div className="mt-2 text-[13px] font-medium text-accent-3/70">• интеграция учтена</div>
                    </div>
                  </div>

                  {/* Итог: bg-accent-2, весь текст + шкала accent-3 */}
                  <div className="rounded-2xl bg-accent-2 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] font-semibold text-accent-3/80">Итог за {calc.months} мес</div>
                      <div className="text-[13px] font-semibold text-accent-3/80">
                        Затраты: {formatRUB(calc.totalCosts)} · Экономия: {formatRUB(calc.totalSavings)}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 w-full rounded-full bg-accent-3/25 overflow-hidden">
                        {(() => {
                          const a = calc.totalSavings;
                          const b = calc.totalCosts;
                          const total = Math.max(a + b, 1);
                          const w = clamp((a / total) * 100, 0, 100);
                          return <div className="h-full bg-accent-3" style={{ width: `${w}%` }} />;
                        })()}
                      </div>

                      <div className="mt-3 flex items-baseline justify-between gap-3">
                        <div className="text-[13px] font-semibold text-accent-3/80">Чистый эффект</div>
                        <div className="text-[22px] font-extrabold text-accent-3">{formatRUB(calc.net)}</div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-sm bg-accent-3 p-5">
                        <div className="text-[13px] font-semibold text-text/55">Год 1 (с интеграцией)</div>
                        <div className="mt-2 text-[20px] font-extrabold text-accent-2">{formatRUB(calc.year1Net)}</div>
                      </div>

                      <div className="rounded-sm bg-accent-3 p-5">
                        <div className="text-[13px] font-semibold text-text/55">Год 2+ (без интеграции)</div>
                        <div className="mt-2 text-[20px] font-extrabold text-accent-2">{formatRUB(calc.year2Net)}</div>
                      </div>
                    </div>
                  </div>

                  {/* кнопка "Открыть параметры" возвращена под итог */}
                  <button
                    type="button"
                    onClick={() => setParamsOpen(true)}
                    className="btn-lift-outline inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-2 px-6 py-4 text-center text-[16px] font-extrabold text-accent-3"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span>Открыть параметры</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PARAMS MODAL */}
        {paramsOpen ? (
          <div className="fixed inset-0 z-[60]">
            <div
              className="absolute inset-0 bg-text/25 backdrop-blur-[2px]"
              onClick={() => setParamsOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="w-full max-w-[980px] overflow-hidden rounded-3xl bg-accent-3 ring-1 ring-text/10 shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
                style={{ ["--tone" as any]: toneHex }}
                role="dialog"
                aria-modal="true"
                aria-label="Параметры ROI-калькулятора"
              >
                <div className="px-8 py-6 flex items-start gap-3 border-b border-text/10">
                  <div className="min-w-0">
                    <div className="text-[18px] font-extrabold text-text">Параметры</div>
                    <div className="mt-1 text-[13px] font-semibold text-text/55">
                      Настрой под свой контекст. Значения обновляют расчёт сразу после закрытия.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setParamsOpen(false)}
                    className="ml-auto btn-lift-outline inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
                    aria-label="Закрыть"
                    title="Закрыть"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-8 py-6 max-h-[75vh] overflow-auto">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-text/10 bg-bg/20 p-6">
                      <div className="text-[14px] font-extrabold text-text">ФОТ и режим</div>

                      <label className="mt-5 block">
                        <div className="text-[13px] font-semibold text-text/55">ФОТ сотрудника (₽/мес)</div>
                        <input
                          type="number"
                          value={salaryMonthly}
                          min={0}
                          onChange={(e) => setSalaryMonthly(clamp(Number(e.target.value || 0), 0, 10_000_000))}
                          className="mt-2 w-full rounded-xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:ring-2 focus:ring-[color:var(--tone)]"
                        />
                      </label>

                      <label className="mt-4 block">
                        <div className="text-[13px] font-semibold text-text/55">Часы в неделю</div>
                        <input
                          type="number"
                          value={hoursPerWeek}
                          min={0}
                          max={168}
                          onChange={(e) => setHoursPerWeek(clamp(Number(e.target.value || 0), 0, 168))}
                          className="mt-2 w-full rounded-xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:ring-2 focus:ring-[color:var(--tone)]"
                        />
                      </label>

                      <label className="mt-4 block">
                        <div className="text-[13px] font-semibold text-text/55">Доля замещения (0..1)</div>
                        <input
                          type="number"
                          step="0.05"
                          value={replacementFactor}
                          min={0}
                          max={1}
                          onChange={(e) => setReplacementFactor(clamp(Number(e.target.value || 0), 0, 1))}
                          className="mt-2 w-full rounded-xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:ring-2 focus:ring-[color:var(--tone)]"
                        />
                        <div className="mt-2 text-[12px] font-medium text-text/55">
                          Пример: 0.8 означает, что инструмент покрывает около 80% функционала ставки.
                        </div>
                      </label>
                    </div>

                    <div className="rounded-2xl border border-text/10 bg-bg/20 p-6">
                      <div className="text-[14px] font-extrabold text-text">Интеграция и FTE</div>

                      <label className="mt-5 block">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[13px] font-semibold text-text/55">Интеграция (₽, разово)</div>
                          <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-text/70">
                            <input
                              type="checkbox"
                              checked={includeIntegration}
                              onChange={(e) => setIncludeIntegration(e.target.checked)}
                            />
                            учитывать
                          </label>
                        </div>

                        <input
                          type="number"
                          value={integrationFee}
                          min={0}
                          onChange={(e) => setIntegrationFee(clamp(Number(e.target.value || 0), 0, 50_000_000))}
                          className="mt-2 w-full rounded-xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:ring-2 focus:ring-[color:var(--tone)]"
                          disabled={!includeIntegration}
                        />
                      </label>

                      <div className="mt-6 rounded-2xl border border-text/10 bg-bg/20 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[13px] font-extrabold text-text">Считать по ролям</div>
                          <button
                            type="button"
                            onClick={() => setUseRoles((v) => !v)}
                            className="btn-lift-outline inline-flex items-center justify-center rounded-xl border border-text/10 bg-bg/25 px-4 py-2 text-[13px] font-semibold text-text/70"
                            aria-pressed={useRoles}
                          >
                            {useRoles ? "включено" : "выключено"}
                          </button>
                        </div>

                        {useRoles ? (
                          <div className="mt-4 grid gap-4">
                            <label className="block">
                              <div className="text-[13px] font-semibold text-text/55">МОП (FTE)</div>
                              <input
                                type="number"
                                step="0.25"
                                value={fteMop}
                                min={0}
                                max={20}
                                onChange={(e) => setFteMop(clamp(Number(e.target.value || 0), 0, 20))}
                                className="mt-2 w-full rounded-xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:ring-2 focus:ring-[color:var(--tone)]"
                              />
                            </label>

                            <label className="block">
                              <div className="text-[13px] font-semibold text-text/55">Администратор (FTE)</div>
                              <input
                                type="number"
                                step="0.25"
                                value={fteAdmin}
                                min={0}
                                max={20}
                                onChange={(e) => setFteAdmin(clamp(Number(e.target.value || 0), 0, 20))}
                                className="mt-2 w-full rounded-xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:ring-2 focus:ring-[color:var(--tone)]"
                              />
                            </label>

                            <label className="block">
                              <div className="text-[13px] font-semibold text-text/55">РОП (FTE)</div>
                              <input
                                type="number"
                                step="0.25"
                                value={fteRop}
                                min={0}
                                max={20}
                                onChange={(e) => setFteRop(clamp(Number(e.target.value || 0), 0, 20))}
                                className="mt-2 w-full rounded-xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:ring-2 focus:ring-[color:var(--tone)]"
                              />
                            </label>

                            <div className="text-[13px] font-semibold text-text/70">
                              Итого FTE: {fteEffective.toFixed(2).replace(/\.00$/, "")}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 text-[13px] font-medium text-text/70">
                            Сейчас используется быстрый параметр "Эквивалент сотрудников" на карточке.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSalaryMonthly(DEFAULTS.salaryMonthly);
                        setHoursPerWeek(DEFAULTS.hoursPerWeek);
                        setIntegrationFee(DEFAULTS.integrationFee);
                        setIncludeIntegration(true);
                        setReplacementFactor(DEFAULTS.replacementFactor);
                        setUseRoles(false);
                        setFteTotal(1);
                        setFteMop(0.5);
                        setFteAdmin(0.25);
                        setFteRop(0.25);
                      }}
                      className="btn-lift-outline inline-flex items-center justify-center rounded-xl border border-text/10 bg-bg/25 px-5 py-3 text-[13px] font-semibold text-text/70"
                    >
                      Сбросить к дефолту
                    </button>

                    <button
                      type="button"
                      onClick={() => setParamsOpen(false)}
                      className="btn-lift-outline inline-flex items-center justify-center rounded-xl border border-text/15 bg-bg/40 px-6 py-3 text-[14px] font-extrabold text-text backdrop-blur"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
