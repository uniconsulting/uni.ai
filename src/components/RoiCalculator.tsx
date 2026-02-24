"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import {
  Calculator,
  TrendingUp,
  Clock,
  Users,
  Percent,
  SlidersHorizontal,
} from "lucide-react";

type ScenarioId = "ops" | "support" | "sales" | "hr" | "docs";
type ProductId = "chat" | "voice" | "analytics" | "turnkey" | "custom";

type TaskDef = {
  id: string;
  title: string;
  hint?: string;
  minutesPerUse: number;
  usesPerMonth: number;
  adoption: number; // 0..1
  enabled: boolean;
};

type ScenarioDef = {
  id: ScenarioId;
  title: string;
  desc: string;
  tasks: TaskDef[];
};

type ProductPreset = {
  id: ProductId;
  title: string;
  oneTime: number;
  monthly: number;
  note?: string;
};

const TONE = { hex: "#C94444" };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toNum(v: string) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatRUB(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function formatPct(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n)}%`;
}

function Sparkline({ values }: { values: number[] }) {
  const W = 220;
  const H = 56;
  const pad = 6;

  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 0);

  const span = maxV - minV || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i * (W - pad * 2)) / Math.max(1, values.length - 1);
    const y = pad + (H - pad * 2) * (1 - (v - minV) / span);
    return { x, y };
  });

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

  const zeroY = pad + (H - pad * 2) * (1 - (0 - minV) / span);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <path d={`M ${pad} ${zeroY} L ${W - pad} ${zeroY}`} stroke="currentColor" strokeOpacity="0.2" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.25" />
    </svg>
  );
}

export function RoiCalculator() {
  const scenarios: ScenarioDef[] = useMemo(
    () => [
      {
        id: "ops",
        title: "Операционка",
        desc: "Рутина руководителя и команды: отчёты, сводки, контроль, таблицы.",
        tasks: [
          { id: "ops_reports", title: "Отчёты и сводки", hint: "Еженедельные/ежедневные отчёты, статусы, итоги.", minutesPerUse: 45, usesPerMonth: 12, adoption: 0.7, enabled: true },
          { id: "ops_kpi", title: "KPI и контроль показателей", hint: "Сбор цифр, форматирование, выводы.", minutesPerUse: 35, usesPerMonth: 10, adoption: 0.6, enabled: true },
          { id: "ops_excel", title: "Excel-рутина", hint: "Сводные, формулы, очистка данных.", minutesPerUse: 25, usesPerMonth: 20, adoption: 0.6, enabled: true },
          { id: "ops_meetings", title: "Протоколы и поручения", hint: "Итоги встреч, задачи, фиксация.", minutesPerUse: 20, usesPerMonth: 12, adoption: 0.7, enabled: false },
        ],
      },
      {
        id: "support",
        title: "Клиентский сервис",
        desc: "Ответы, классификация обращений, качество сервиса.",
        tasks: [
          { id: "sup_answers", title: "Черновики ответов клиентам", hint: "Быстрые ответы в мессенджерах/почте.", minutesPerUse: 4, usesPerMonth: 600, adoption: 0.75, enabled: true },
          { id: "sup_tags", title: "Классификация обращений", hint: "Теги, причины, типы проблем.", minutesPerUse: 1.2, usesPerMonth: 600, adoption: 0.7, enabled: true },
          { id: "sup_qc", title: "Контроль качества диалогов", hint: "Проверка, разбор, рекомендации.", minutesPerUse: 12, usesPerMonth: 40, adoption: 0.6, enabled: false },
        ],
      },
      {
        id: "sales",
        title: "Продажи",
        desc: "Лиды, КП, скрипты, подготовка предложений.",
        tasks: [
          { id: "sales_kp", title: "Коммерческие предложения", hint: "Структура, аргументы, выгоды.", minutesPerUse: 35, usesPerMonth: 16, adoption: 0.65, enabled: true },
          { id: "sales_follow", title: "Фоллоу-апы и сообщения", hint: "Переписка, догоняющие касания.", minutesPerUse: 3, usesPerMonth: 250, adoption: 0.7, enabled: true },
          { id: "sales_calls", title: "Подготовка к звонкам", hint: "Контекст, вопросы, резюме.", minutesPerUse: 10, usesPerMonth: 60, adoption: 0.6, enabled: false },
        ],
      },
      {
        id: "hr",
        title: "HR",
        desc: "Подбор, адаптация, обучение, регламенты.",
        tasks: [
          { id: "hr_cv", title: "Отбор резюме и краткие выводы", hint: "Сравнение кандидатов, риски.", minutesPerUse: 6, usesPerMonth: 120, adoption: 0.6, enabled: true },
          { id: "hr_docs", title: "Регламенты и инструкции", hint: "Черновики регламентов, стандарты.", minutesPerUse: 60, usesPerMonth: 6, adoption: 0.6, enabled: false },
          { id: "hr_adapt", title: "Материалы адаптации", hint: "План, чек-листы, тесты.", minutesPerUse: 45, usesPerMonth: 4, adoption: 0.6, enabled: false },
        ],
      },
      {
        id: "docs",
        title: "Документы",
        desc: "Договоры, письма, формулировки, согласования.",
        tasks: [
          { id: "doc_contracts", title: "Черновики договоров/допсоглашений", hint: "Структура, пункты, формулировки.", minutesPerUse: 50, usesPerMonth: 6, adoption: 0.6, enabled: true },
          { id: "doc_letters", title: "Письма и официальные ответы", hint: "Собрать позицию и текст.", minutesPerUse: 18, usesPerMonth: 20, adoption: 0.7, enabled: true },
          { id: "doc_summary", title: "Выжимка из документов", hint: "Коротко: что важно и что делать.", minutesPerUse: 12, usesPerMonth: 16, adoption: 0.6, enabled: false },
        ],
      },
    ],
    [],
  );

  const products: ProductPreset[] = useMemo(
    () => [
      { id: "chat", title: "Чат-бот", oneTime: 79990, monthly: 1890 },
      { id: "voice", title: "Голосовой бот", oneTime: 149990, monthly: 20000, note: "Можно заменить на расчёт по минутам." },
      { id: "analytics", title: "Аналитика", oneTime: 49990, monthly: 6000 },
      { id: "turnkey", title: "Интеграция под ключ", oneTime: 179990, monthly: 6000 },
      { id: "custom", title: "Свой вариант", oneTime: 179990, monthly: 0 },
    ],
    [],
  );

  const [scenarioId, setScenarioId] = useState<ScenarioId>("ops");
  const activeScenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];

  const [productId, setProductId] = useState<ProductId>("turnkey");
  const preset = products.find((p) => p.id === productId) ?? products[0];

  const [integrationFee, setIntegrationFee] = useState<number>(preset.oneTime);
  const [monthlyFee, setMonthlyFee] = useState<number>(preset.monthly);

  const [salaryMonthly, setSalaryMonthly] = useState<number>(90000);
  const [overheadPct, setOverheadPct] = useState<number>(30);
  const [workHours, setWorkHours] = useState<number>(160);
  const [people, setPeople] = useState<number>(2);
  const [horizon, setHorizon] = useState<number>(12);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // задачи - локальное состояние на сценарий
  const [tasksByScenario, setTasksByScenario] = useState<Record<ScenarioId, TaskDef[]>>(() => {
    const m = {} as Record<ScenarioId, TaskDef[]>;
    for (const s of scenarios) m[s.id] = s.tasks.map((t) => ({ ...t }));
    return m;
  });

  const tasks = tasksByScenario[scenarioId] ?? activeScenario.tasks;

  const applyPreset = (id: ProductId) => {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setIntegrationFee(p.oneTime);
    setMonthlyFee(p.monthly);
  };

  const updateTask = (taskId: string, patch: Partial<TaskDef>) => {
    setTasksByScenario((prev) => {
      const cur = prev[scenarioId] ?? [];
      const next = cur.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
      return { ...prev, [scenarioId]: next };
    });
  };

  const hourlyRate = useMemo(() => {
    const base = Math.max(0, salaryMonthly);
    const k = 1 + clamp(overheadPct, 0, 300) / 100;
    const hours = Math.max(1, workHours);
    return (base * k) / hours;
  }, [salaryMonthly, overheadPct, workHours]);

  const calc = useMemo(() => {
    const team = clamp(people, 1, 999);

    const taskRows = tasks.map((t) => {
      const minutes = Math.max(0, t.minutesPerUse);
      const uses = Math.max(0, t.usesPerMonth);
      const adoption = clamp(t.adoption, 0, 1);
      const enabled = !!t.enabled;

      const minutesSaved = enabled ? minutes * uses * adoption * team : 0;
      const rubSaved = (minutesSaved / 60) * hourlyRate;

      return { ...t, minutesSaved, rubSaved };
    });

    const savingsPerMonth = taskRows.reduce((a, b) => a + b.rubSaved, 0);

    const oneTime = Math.max(0, integrationFee);
    const monthly = Math.max(0, monthlyFee);

    const totalCost = oneTime + monthly * horizon;
    const totalBenefit = savingsPerMonth * horizon;
    const net = totalBenefit - totalCost;

    const monthlyNet = savingsPerMonth - monthly;
    const paybackMonths =
      monthlyNet > 0 ? oneTime / monthlyNet : Infinity;

    const roiPct = totalCost > 0 ? (net / totalCost) * 100 : 0;

    const series = Array.from({ length: horizon + 1 }, (_, m) => {
      const cum = -oneTime + monthlyNet * m;
      return cum;
    });

    const topTasks = [...taskRows]
      .filter((t) => t.rubSaved > 0)
      .sort((a, b) => b.rubSaved - a.rubSaved)
      .slice(0, 4);

    const minutesSavedTotal = taskRows.reduce((a, b) => a + b.minutesSaved, 0);

    return {
      taskRows,
      savingsPerMonth,
      minutesSavedTotal,
      totalCost,
      totalBenefit,
      net,
      roiPct,
      paybackMonths,
      series,
      topTasks,
      monthlyNet,
    };
  }, [tasks, people, hourlyRate, integrationFee, monthlyFee, horizon]);

  return (
    <section id="roi" className="relative">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10" />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="hover-accent text-[18px] font-medium opacity-70">ROI-калькулятор</div>
            <div className="mt-3 text-[30px] md:text-[36px] font-extrabold leading-[1.05] text-text">
              Оцените окупаемость по ФОТ
            </div>
            <div className="mt-3 text-[15px] md:text-[16px] font-medium text-text/70">
              Сравниваем экономию времени команды с её стоимостью (зарплата + накладные).
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="btn-lift-outline inline-flex items-center gap-2 rounded-xl border border-text/10 bg-bg px-4 py-3 text-[13px] font-semibold text-text/80"
              title="Параметры расчёта"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Параметры</span>
            </button>

            <div
              className="inline-flex items-center gap-2 rounded-xl border border-text/10 bg-accent-3 px-4 py-3 text-[13px] font-semibold"
              style={{ color: TONE.hex }}
              title="Базовая логика"
            >
              <Calculator className="h-4 w-4" />
              <span>Сценарий + задачи</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT: settings + tasks */}
          <div className="rounded-3xl border border-text/10 bg-accent-3 p-6 md:p-8">
            {/* scenario tabs */}
            <div className="flex flex-wrap gap-2">
              {scenarios.map((s) => {
                const on = s.id === scenarioId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScenarioId(s.id)}
                    className={[
                      "btn-lift-outline inline-flex items-center rounded-xl px-4 py-2 text-[13px] font-semibold",
                      on
                        ? "border-2 bg-bg/70 text-text"
                        : "border border-text/10 bg-bg/25 text-text/70 hover:text-text",
                    ].join(" ")}
                    style={on ? { borderColor: TONE.hex } : undefined}
                    aria-pressed={on}
                  >
                    {s.title}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-[14px] font-medium text-text/70">{activeScenario.desc}</div>

            {/* product + horizon */}
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-text/10 bg-bg/25 p-4">
                <div className="text-[13px] font-semibold text-text/65">Решение</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {products.map((p) => {
                    const on = p.id === productId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p.id)}
                        className={[
                          "btn-lift-outline inline-flex items-center rounded-xl px-3 py-2 text-[12px] font-semibold",
                          on
                            ? "border-2 bg-bg/70 text-text"
                            : "border border-text/10 bg-bg/25 text-text/70 hover:text-text",
                        ].join(" ")}
                        style={on ? { borderColor: TONE.hex } : undefined}
                        aria-pressed={on}
                      >
                        {p.title}
                      </button>
                    );
                  })}
                </div>

                {preset.note ? (
                  <div className="mt-3 text-[12px] font-medium text-text/55">{preset.note}</div>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-[12px] font-semibold text-text/60">Разово, ₽</div>
                    <input
                      value={integrationFee}
                      onChange={(e) => setIntegrationFee(toNum(e.target.value))}
                      inputMode="numeric"
                      className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[14px] font-semibold text-text outline-none"
                    />
                  </label>

                  <label className="block">
                    <div className="text-[12px] font-semibold text-text/60">В месяц, ₽</div>
                    <input
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(toNum(e.target.value))}
                      inputMode="numeric"
                      className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[14px] font-semibold text-text outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-text/10 bg-bg/25 p-4">
                <div className="text-[13px] font-semibold text-text/65">Горизонт расчёта</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[3, 6, 12, 18, 24].map((m) => {
                    const on = m === horizon;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setHorizon(m)}
                        className={[
                          "btn-lift-outline inline-flex items-center rounded-xl px-4 py-2 text-[12px] font-semibold",
                          on
                            ? "border-2 bg-bg/70 text-text"
                            : "border border-text/10 bg-bg/25 text-text/70 hover:text-text",
                        ].join(" ")}
                        style={on ? { borderColor: TONE.hex } : undefined}
                        aria-pressed={on}
                      >
                        {m} мес
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-[12px] font-semibold text-text/60">Зарплата, ₽/мес</div>
                    <input
                      value={salaryMonthly}
                      onChange={(e) => setSalaryMonthly(toNum(e.target.value))}
                      inputMode="numeric"
                      className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[14px] font-semibold text-text outline-none"
                    />
                  </label>

                  <label className="block">
                    <div className="text-[12px] font-semibold text-text/60">Людей в процессе</div>
                    <input
                      value={people}
                      onChange={(e) => setPeople(toNum(e.target.value))}
                      inputMode="numeric"
                      className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[14px] font-semibold text-text outline-none"
                    />
                  </label>
                </div>

                {showAdvanced ? (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                      <div className="text-[12px] font-semibold text-text/60">Накладные, %</div>
                      <input
                        value={overheadPct}
                        onChange={(e) => setOverheadPct(toNum(e.target.value))}
                        inputMode="numeric"
                        className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[14px] font-semibold text-text outline-none"
                      />
                    </label>

                    <label className="block">
                      <div className="text-[12px] font-semibold text-text/60">Часов/мес</div>
                      <input
                        value={workHours}
                        onChange={(e) => setWorkHours(toNum(e.target.value))}
                        inputMode="numeric"
                        className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[14px] font-semibold text-text outline-none"
                      />
                    </label>

                    <div className="col-span-2 text-[12px] font-medium text-text/55">
                      Часовая ставка: <span className="font-semibold text-text/80">{formatRUB(hourlyRate)}</span> / час
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* tasks */}
            <div className="mt-8">
              <div className="text-[15px] font-extrabold text-text">Задачи и экономия времени</div>
              <div className="mt-2 text-[13px] font-medium text-text/60">
                Мин/раз и Раз/мес можно менять под вашу реальность. Охват: доля задач, где реально применяют инструмент.
              </div>

              <div className="mt-5 grid gap-3">
                {tasks.map((t) => {
                  const contrib = calc.taskRows.find((x) => x.id === t.id)?.rubSaved ?? 0;
                  return (
                    <div key={t.id} className="rounded-2xl border border-text/10 bg-bg/25 p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={t.enabled}
                          onChange={(e) => updateTask(t.id, { enabled: e.target.checked })}
                          className="mt-1 h-4 w-4 accent-[color:var(--tone)]"
                          style={{ ["--tone" as any]: TONE.hex }}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-extrabold text-text">{t.title}</div>
                          {t.hint ? (
                            <div className="mt-1 text-[12px] font-medium text-text/55">{t.hint}</div>
                          ) : null}

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <label className="block">
                              <div className="text-[12px] font-semibold text-text/60">Мин/раз</div>
                              <input
                                value={t.minutesPerUse}
                                onChange={(e) => updateTask(t.id, { minutesPerUse: toNum(e.target.value) })}
                                inputMode="decimal"
                                className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[13px] font-semibold text-text outline-none"
                              />
                            </label>

                            <label className="block">
                              <div className="text-[12px] font-semibold text-text/60">Раз/мес</div>
                              <input
                                value={t.usesPerMonth}
                                onChange={(e) => updateTask(t.id, { usesPerMonth: toNum(e.target.value) })}
                                inputMode="numeric"
                                className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[13px] font-semibold text-text outline-none"
                              />
                            </label>

                            <label className="block">
                              <div className="text-[12px] font-semibold text-text/60">Охват, %</div>
                              <input
                                value={Math.round(t.adoption * 100)}
                                onChange={(e) => updateTask(t.id, { adoption: clamp(toNum(e.target.value) / 100, 0, 1) })}
                                inputMode="numeric"
                                className="mt-2 w-full rounded-xl border border-text/10 bg-bg px-3 py-2 text-[13px] font-semibold text-text outline-none"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-[12px] font-semibold text-text/60">Экономия</div>
                          <div className="mt-2 text-[14px] font-extrabold" style={{ color: TONE.hex }}>
                            {formatRUB(contrib)}
                            <span className="text-[12px] font-semibold text-text/55"> /мес</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: results */}
          <div className="rounded-3xl border border-text/10 bg-bg p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-text/60">Результат</div>
                <div className="mt-2 text-[22px] font-extrabold text-text">Окупаемость и ROI</div>
                <div className="mt-2 text-[13px] font-medium text-text/60">
                  Учитываем разовый платёж и ежемесячный платёж.
                </div>
              </div>
              <div className="rounded-2xl border border-text/10 bg-accent-3 px-4 py-3 text-[12px] font-semibold text-text/70">
                {horizon} мес
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-text/10 bg-accent-3 p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-text/60">
                  <TrendingUp className="h-4 w-4" />
                  Экономия, ₽/мес
                </div>
                <div className="mt-3 text-[22px] font-extrabold" style={{ color: TONE.hex }}>
                  {formatRUB(calc.savingsPerMonth)}
                </div>
                <div className="mt-2 text-[12px] font-medium text-text/55">
                  Время: ~{Math.round(calc.minutesSavedTotal / 60)} ч/мес
                </div>
              </div>

              <div className="rounded-2xl border border-text/10 bg-accent-3 p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-text/60">
                  <Clock className="h-4 w-4" />
                  Окупаемость
                </div>
                <div className="mt-3 text-[22px] font-extrabold text-text">
                  {calc.paybackMonths === Infinity ? "не сходится" : `${Math.max(0.1, calc.paybackMonths).toFixed(1)} мес`}
                </div>
                <div className="mt-2 text-[12px] font-medium text-text/55">
                  Чистыми: {formatRUB(calc.monthlyNet)} /мес
                </div>
              </div>

              <div className="rounded-2xl border border-text/10 bg-accent-3 p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-text/60">
                  <Percent className="h-4 w-4" />
                  ROI за {horizon} мес
                </div>
                <div className="mt-3 text-[22px] font-extrabold text-text">
                  {formatPct(calc.roiPct)}
                </div>
                <div className="mt-2 text-[12px] font-medium text-text/55">
                  Затраты: {formatRUB(calc.totalCost)}
                </div>
              </div>

              <div className="rounded-2xl border border-text/10 bg-accent-3 p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-text/60">
                  <Users className="h-4 w-4" />
                  Эффект за {horizon} мес
                </div>
                <div className="mt-3 text-[22px] font-extrabold" style={{ color: calc.net >= 0 ? TONE.hex : "currentColor" }}>
                  {formatRUB(calc.net)}
                </div>
                <div className="mt-2 text-[12px] font-medium text-text/55">
                  Выгода: {formatRUB(calc.totalBenefit)}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-text/10 bg-accent-3 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-text/60">Кумулятивный эффект</div>
                  <div className="mt-2 text-[13px] font-medium text-text/65">
                    Стартуем с минуса на разовый платёж, затем “отбиваемся” ежемесячным эффектом.
                  </div>
                </div>
                <div className="text-right text-[12px] font-semibold text-text/60">
                  0 → {horizon} мес
                </div>
              </div>

              <div className="mt-4 text-text/70">
                <Sparkline values={calc.series} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-text/10 bg-accent-3 p-4">
              <div className="text-[12px] font-semibold text-text/60">Топ источников экономии</div>
              <div className="mt-3 grid gap-2">
                {calc.topTasks.length ? (
                  calc.topTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-text/10 bg-bg/25 px-3 py-2">
                      <div className="min-w-0 text-[13px] font-semibold text-text/75 truncate">{t.title}</div>
                      <div className="shrink-0 text-[13px] font-extrabold" style={{ color: TONE.hex }}>
                        {formatRUB(t.rubSaved)}/мес
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[13px] font-medium text-text/55">
                    Включи хотя бы одну задачу, чтобы увидеть распределение.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-[12px] font-medium text-text/55">
              Подсказка: если хочешь “жёстче” считать ФОТ, увеличь накладные и/или уменьши охват.
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}