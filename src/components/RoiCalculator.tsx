/* src/components/RoiCalculator.tsx */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import {
  Calculator,
  SlidersHorizontal,
  X,
  MessageCircle,
  TrendingUp,
  Info,
} from "lucide-react";

type PackageId = "small" | "medium" | "enterprise";
type RoleId = "sales" | "admin" | "head";

type Inputs = {
  leadsPerMonth: number;
  callsPerMonth: number;
  teamSales: number;
  teamAdmin: number;
  teamHead: number;
};

type Params = {
  integrationFee: number; // разово, в 1-й год
  salarySales: number; // ₽/мес
  salaryAdmin: number;
  salaryHead: number;
  overheadCoef: number; // 1.35
  hoursPerMonth: number; // 168
  adoption: number; // 0..1
  conversion: number; // 0..1
};

type ModuleFlags = {
  bots: boolean;
  callAnalytics: boolean;
};

type Task = {
  module: "bots" | "callAnalytics";
  name: string;
  role: RoleId;
  minutesPerUnit: number;
  effect: number; // 0..1
  volumeKind: "leads" | "calls" | "fixed";
  volumeMultiplier?: number; // для leads/calls
  fixedMinutesPerMonth?: number; // для fixed
};

const TELEGRAM_HREF = "https://t.me/uni_smb";

const nfRub = new Intl.NumberFormat("ru-RU");
const nfNum = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

function rub(n: number) {
  return `${nfRub.format(Math.round(n))} ₽`;
}
function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}
function safeNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const PACKAGES: Record<
  PackageId,
  {
    title: string;
    monthlyFee: number;
    defaults: Inputs;
  }
> = {
  small: {
    title: "Малый",
    monthlyFee: 9_900,
    defaults: { leadsPerMonth: 300, callsPerMonth: 600, teamSales: 2, teamAdmin: 1, teamHead: 1 },
  },
  medium: {
    title: "Средний",
    monthlyFee: 39_900,
    defaults: { leadsPerMonth: 700, callsPerMonth: 1400, teamSales: 5, teamAdmin: 2, teamHead: 1 },
  },
  enterprise: {
    title: "Энтерпрайз",
    monthlyFee: 99_900,
    defaults: { leadsPerMonth: 2000, callsPerMonth: 4000, teamSales: 12, teamAdmin: 4, teamHead: 2 },
  },
};

const DEFAULT_PARAMS: Params = {
  integrationFee: 179_900,
  salarySales: 70_000,
  salaryAdmin: 70_000,
  salaryHead: 70_000,
  overheadCoef: 1.35,
  hoursPerMonth: 168,
  adoption: 0.85,
  conversion: 0.6,
};

const TASKS: Task[] = [
  // Чат-боты
  {
    module: "bots",
    name: "Первичная обработка обращений (часть задач админа)",
    role: "admin",
    minutesPerUnit: 2.5,
    effect: 0.5,
    volumeKind: "leads",
    volumeMultiplier: 1.0,
  },
  {
    module: "bots",
    name: "Первичная обработка обращений (часть задач продаж)",
    role: "sales",
    minutesPerUnit: 2.5,
    effect: 0.5,
    volumeKind: "leads",
    volumeMultiplier: 1.0,
  },
  {
    module: "bots",
    name: "Квалификация лида",
    role: "sales",
    minutesPerUnit: 6,
    effect: 0.35,
    volumeKind: "leads",
    volumeMultiplier: 0.8,
  },
  {
    module: "bots",
    name: "Запись/подтверждения/переносы",
    role: "admin",
    minutesPerUnit: 4,
    effect: 0.6,
    volumeKind: "leads",
    volumeMultiplier: 0.35,
  },
  {
    module: "bots",
    name: "Заполнение CRM по первичке",
    role: "sales",
    minutesPerUnit: 2,
    effect: 0.3,
    volumeKind: "leads",
    volumeMultiplier: 0.8,
  },

  // Аналитика звонков
  {
    module: "callAnalytics",
    name: "Ручной контроль качества/разбор",
    role: "head",
    minutesPerUnit: 5,
    effect: 0.7,
    volumeKind: "calls",
    volumeMultiplier: 1.0,
  },
  {
    module: "callAnalytics",
    name: "Теги, причины отказов, итоги",
    role: "head",
    minutesPerUnit: 1.5,
    effect: 0.6,
    volumeKind: "calls",
    volumeMultiplier: 1.0,
  },
  {
    module: "callAnalytics",
    name: "Еженедельные отчеты (время руководителя)",
    role: "head",
    minutesPerUnit: 1,
    effect: 0.6,
    volumeKind: "fixed",
    fixedMinutesPerMonth: 120 * 4.33,
  },
  {
    module: "callAnalytics",
    name: "Приоритезация коучинга (время руководителя)",
    role: "head",
    minutesPerUnit: 1,
    effect: 0.25,
    volumeKind: "fixed",
    fixedMinutesPerMonth: 90 * 4.33,
  },
];

function hourCost(salaryMonthly: number, overheadCoef: number, hoursPerMonth: number) {
  const denom = Math.max(1, hoursPerMonth);
  return (salaryMonthly * overheadCoef) / denom;
}

function computeMonthlySavings(inputs: Inputs, params: Params, flags: ModuleFlags) {
  const hc = {
    sales: hourCost(params.salarySales, params.overheadCoef, params.hoursPerMonth),
    admin: hourCost(params.salaryAdmin, params.overheadCoef, params.hoursPerMonth),
    head: hourCost(params.salaryHead, params.overheadCoef, params.hoursPerMonth),
  } as const;

  const enabledModules = {
    bots: flags.bots,
    callAnalytics: flags.callAnalytics,
  };

  const raw = TASKS.filter((t) => enabledModules[t.module]);

  const adoption = clamp(params.adoption, 0, 1);
  const conversion = clamp(params.conversion, 0, 1);

  // 1) считаем "сырые" часы и деньги по задачам
  const items = raw.map((t) => {
    let units = 0;

    if (t.volumeKind === "leads") units = inputs.leadsPerMonth * (t.volumeMultiplier ?? 1);
    if (t.volumeKind === "calls") units = inputs.callsPerMonth * (t.volumeMultiplier ?? 1);
    if (t.volumeKind === "fixed") units = 1;

    const minutes =
      t.volumeKind === "fixed"
        ? (t.fixedMinutesPerMonth ?? 0)
        : units * t.minutesPerUnit;

    const hoursSaved = (minutes / 60) * t.effect * adoption;
    const moneySaved = hoursSaved * hc[t.role] * conversion;

    return {
      ...t,
      hoursSaved,
      moneySaved,
    };
  });

  // 2) кап по роли (чтобы не улетало в нереалистичные значения)
  // допущение: экономия времени не может превышать 70% доступного рабочего времени роли в месяц
  const capCoef = 0.7;
  const maxHours = {
    sales: inputs.teamSales * params.hoursPerMonth * capCoef,
    admin: inputs.teamAdmin * params.hoursPerMonth * capCoef,
    head: inputs.teamHead * params.hoursPerMonth * capCoef,
  };

  const byRoleHoursRaw: Record<RoleId, number> = { sales: 0, admin: 0, head: 0 };
  const byRoleMoneyRaw: Record<RoleId, number> = { sales: 0, admin: 0, head: 0 };

  for (const it of items) {
    byRoleHoursRaw[it.role] += it.hoursSaved;
    byRoleMoneyRaw[it.role] += it.moneySaved;
  }

  // коэффициенты "сжатия" по каждой роли
  const squeeze: Record<RoleId, number> = {
    sales: byRoleHoursRaw.sales > 0 ? Math.min(1, maxHours.sales / byRoleHoursRaw.sales) : 1,
    admin: byRoleHoursRaw.admin > 0 ? Math.min(1, maxHours.admin / byRoleHoursRaw.admin) : 1,
    head: byRoleHoursRaw.head > 0 ? Math.min(1, maxHours.head / byRoleHoursRaw.head) : 1,
  };

  const itemsCapped = items.map((it) => {
    const k = squeeze[it.role];
    return { ...it, hoursSaved: it.hoursSaved * k, moneySaved: it.moneySaved * k };
  });

  const byRoleHours: Record<RoleId, number> = { sales: 0, admin: 0, head: 0 };
  const byRoleMoney: Record<RoleId, number> = { sales: 0, admin: 0, head: 0 };

  for (const it of itemsCapped) {
    byRoleHours[it.role] += it.hoursSaved;
    byRoleMoney[it.role] += it.moneySaved;
  }

  const totalMoney = byRoleMoney.sales + byRoleMoney.admin + byRoleMoney.head;
  const totalHours = byRoleHours.sales + byRoleHours.admin + byRoleHours.head;

  return {
    totalMoney,
    totalHours,
    byRoleMoney,
    byRoleHours,
    hourCosts: hc,
    items: itemsCapped,
    squeeze,
  };
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="overflow-hidden rounded-3xl border border-text/10 bg-accent-3 shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3 border-b border-text/10 px-7 py-5">
            <div className="min-w-0">
              <div className="text-[18px] font-extrabold text-text">{title}</div>
              <div className="mt-1 text-[13px] font-medium text-text/60">
                Настрой под свой контекст, на главном экране останется только самое нужное.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-lift-outline ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text/15 bg-bg/40 backdrop-blur"
              aria-label="Закрыть"
              title="Закрыть (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-auto px-7 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function RoiCalculator() {
  const [pkg, setPkg] = useState<PackageId>("small");
  const [flags, setFlags] = useState<ModuleFlags>({ bots: true, callAnalytics: true });
  const [inputs, setInputs] = useState<Inputs>(PACKAGES.small.defaults);
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const [openParams, setOpenParams] = useState(false);

  // автоподстановка дефолтов под пакет
  useEffect(() => {
    setInputs(PACKAGES[pkg].defaults);
  }, [pkg]);

  const monthlyFee = PACKAGES[pkg].monthlyFee;

  const calc = useMemo(() => computeMonthlySavings(inputs, params, flags), [inputs, params, flags]);

  const costYear1 = params.integrationFee + monthlyFee * 12;
  const costYear2 = monthlyFee * 12;
  const costYear3 = monthlyFee * 12;

  const benefitYear = calc.totalMoney * 12;

  const netYear1 = benefitYear - costYear1;
  const netYear2 = benefitYear - costYear2;
  const netYear3 = benefitYear - costYear3;

  const paybackMonths =
    calc.totalMoney > 0 ? costYear1 / calc.totalMoney : Number.POSITIVE_INFINITY;

  const roiYear1 = costYear1 > 0 ? (netYear1 / costYear1) * 100 : 0;

  const bars = useMemo(() => {
    const xs = [netYear1, netYear2, netYear3];
    const maxAbs = Math.max(1, ...xs.map((v) => Math.abs(v)));
    return xs.map((v) => ({
      value: v,
      pct: Math.round((Math.abs(v) / maxAbs) * 100),
      sign: v >= 0 ? "pos" : "neg",
    }));
  }, [netYear1, netYear2, netYear3]);

  return (
    <section id="roi" className="relative">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10" />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="hover-accent text-[18px] font-medium opacity-70">
              ROI-калькулятор
            </div>
            <div className="mt-3 text-[34px] md:text-[40px] font-extrabold leading-[1.05] text-text">
              Оценка окупаемости
              <span className="block">по ФОТ и времени команды</span>
            </div>
            <div className="mt-5 max-w-[900px] text-[16px] md:text-[18px] font-medium text-text/70">
              Выбираешь пакет и контекст. Калькулятор показывает 1-й год с учетом разовой интеграции
              и 2-й год без нее, поэтому там эффект выше.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenParams(true)}
              className="btn-lift-outline inline-flex items-center gap-2 rounded-2xl border border-text/10 bg-bg/25 px-5 py-3 text-[14px] font-semibold text-text/80 backdrop-blur hover:text-text"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Параметры</span>
            </button>

            <a
              href={TELEGRAM_HREF}
              target="_blank"
              rel="noreferrer"
              className="btn-lift-outline inline-flex items-center gap-2 rounded-2xl bg-accent-3 px-5 py-3 text-[14px] font-extrabold text-text"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Написать нам</span>
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT: inputs */}
          <div className="rounded-3xl border border-text/10 bg-bg/25 p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-text/10 bg-bg/35">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[18px] font-extrabold text-text">Вводные</div>
                <div className="mt-1 text-[13px] font-medium text-text/60">
                  На главном экране только 5 простых настроек.
                </div>
              </div>
            </div>

            {/* Package */}
            <div className="mt-6">
              <div className="text-[13px] font-semibold text-text/60">Пакет</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(PACKAGES) as PackageId[]).map((id) => {
                  const on = id === pkg;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPkg(id)}
                      className={[
                        "btn-lift-outline inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[13px] font-semibold",
                        on
                          ? "bg-accent-3 border-2 border-text/15 text-text"
                          : "bg-bg/25 border border-text/10 text-text/70 hover:text-text",
                      ].join(" ")}
                      aria-pressed={on}
                    >
                      <span>{PACKAGES[id].title}</span>
                      <span className="text-text/45">{rub(PACKAGES[id].monthlyFee)}/мес</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modules */}
            <div className="mt-6">
              <div className="text-[13px] font-semibold text-text/60">Что внедряем</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFlags((p) => ({ ...p, bots: !p.bots }))}
                  className={[
                    "btn-lift-outline flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left",
                    flags.bots ? "border-text/15 bg-accent-3" : "border-text/10 bg-bg/25",
                  ].join(" ")}
                  aria-pressed={flags.bots}
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-extrabold text-text">Чат-боты</div>
                    <div className="mt-1 text-[12px] font-medium text-text/60">
                      Снимают рутину с админа и продаж
                    </div>
                  </div>
                  <div
                    className={[
                      "h-6 w-11 rounded-full border border-text/10 p-[2px] transition",
                      flags.bots ? "bg-text/10" : "bg-bg/35",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-5 w-5 rounded-full bg-text/60 transition",
                        flags.bots ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFlags((p) => ({ ...p, callAnalytics: !p.callAnalytics }))}
                  className={[
                    "btn-lift-outline flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left",
                    flags.callAnalytics ? "border-text/15 bg-accent-3" : "border-text/10 bg-bg/25",
                  ].join(" ")}
                  aria-pressed={flags.callAnalytics}
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-extrabold text-text">Аналитика звонков</div>
                    <div className="mt-1 text-[12px] font-medium text-text/60">
                      Снимает контроль качества с РОП
                    </div>
                  </div>
                  <div
                    className={[
                      "h-6 w-11 rounded-full border border-text/10 p-[2px] transition",
                      flags.callAnalytics ? "bg-text/10" : "bg-bg/35",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-5 w-5 rounded-full bg-text/60 transition",
                        flags.callAnalytics ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Volumes + team */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Лиды/обращения в месяц</div>
                <input
                  value={inputs.leadsPerMonth}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, leadsPerMonth: clamp(safeNumber(e.target.value, 0), 0, 1_000_000) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>

              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Звонки в месяц</div>
                <input
                  value={inputs.callsPerMonth}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, callsPerMonth: clamp(safeNumber(e.target.value, 0), 0, 2_000_000) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Менеджеры</div>
                <input
                  value={inputs.teamSales}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, teamSales: clamp(safeNumber(e.target.value, 0), 0, 200) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>

              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Админы</div>
                <input
                  value={inputs.teamAdmin}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, teamAdmin: clamp(safeNumber(e.target.value, 0), 0, 200) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>

              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">РОП</div>
                <input
                  value={inputs.teamHead}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, teamHead: clamp(safeNumber(e.target.value, 0), 0, 50) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-text/10 bg-bg/20 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-text/60" />
              <div className="text-[12px] font-medium text-text/60">
                В расчет заложен консервативный кап: экономия времени по роли не превышает 70% доступного рабочего времени.
                Это защищает от нереалистичных значений при больших объемах.
              </div>
            </div>
          </div>

          {/* RIGHT: results */}
          <div className="rounded-3xl border border-text/10 bg-accent-3 p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-text/10 bg-bg/35">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[18px] font-extrabold text-text">Результат</div>
                <div className="mt-1 text-[13px] font-medium text-text/60">
                  Год 1 с интеграцией, год 2 и далее без нее.
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-text/10 bg-bg/20 p-5">
                <div className="text-[12px] font-semibold text-text/60">Экономия в месяц</div>
                <div className="mt-2 text-[22px] font-extrabold text-text">{rub(calc.totalMoney)}</div>
                <div className="mt-2 text-[12px] font-medium text-text/60">
                  Время: {nf1.format(calc.totalHours)} ч/мес
                </div>
              </div>

              <div className="rounded-2xl border border-text/10 bg-bg/20 p-5">
                <div className="text-[12px] font-semibold text-text/60">Окупаемость</div>
                <div className="mt-2 text-[22px] font-extrabold text-text">
                  {Number.isFinite(paybackMonths) ? `${nf1.format(paybackMonths)} мес` : "—"}
                </div>
                <div className="mt-2 text-[12px] font-medium text-text/60">
                  ROI (год 1): {Number.isFinite(roiYear1) ? `${nf1.format(roiYear1)}%` : "—"}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-text/10 bg-bg/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[12px] font-semibold text-text/60">Финансы по годам (чистая выгода)</div>
                <div className="text-[12px] font-medium text-text/60">
                  Пакет: {rub(monthlyFee)}/мес, Интеграция: {rub(params.integrationFee)}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  { title: "Год 1", net: netYear1, cost: costYear1, bar: bars[0] },
                  { title: "Год 2", net: netYear2, cost: costYear2, bar: bars[1] },
                  { title: "Год 3", net: netYear3, cost: costYear3, bar: bars[2] },
                ].map((y) => (
                  <div key={y.title} className="rounded-2xl border border-text/10 bg-bg/25 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] font-extrabold text-text">{y.title}</div>
                      <div className="text-[13px] font-semibold text-text/70">
                        Net: <span className="text-text">{rub(y.net)}</span>
                        <span className="text-text/40"> · </span>
                        Cost: {rub(y.cost)}
                      </div>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg/30">
                      <div
                        className={[
                          "h-full rounded-full",
                          y.bar.sign === "pos" ? "bg-text/70" : "bg-text/25",
                        ].join(" ")}
                        style={{ width: `${y.bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-text/10 bg-bg/20 p-4">
                <div className="text-[12px] font-semibold text-text/60">Менеджеры</div>
                <div className="mt-2 text-[14px] font-extrabold text-text">{rub(calc.byRoleMoney.sales)}</div>
                <div className="mt-1 text-[12px] font-medium text-text/60">
                  {nf1.format(calc.byRoleHours.sales)} ч
                </div>
              </div>
              <div className="rounded-2xl border border-text/10 bg-bg/20 p-4">
                <div className="text-[12px] font-semibold text-text/60">Админы</div>
                <div className="mt-2 text-[14px] font-extrabold text-text">{rub(calc.byRoleMoney.admin)}</div>
                <div className="mt-1 text-[12px] font-medium text-text/60">
                  {nf1.format(calc.byRoleHours.admin)} ч
                </div>
              </div>
              <div className="rounded-2xl border border-text/10 bg-bg/20 p-4">
                <div className="text-[12px] font-semibold text-text/60">РОП</div>
                <div className="mt-2 text-[14px] font-extrabold text-text">{rub(calc.byRoleMoney.head)}</div>
                <div className="mt-1 text-[12px] font-medium text-text/60">
                  {nf1.format(calc.byRoleHours.head)} ч
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Modal open={openParams} title="Параметры расчета" onClose={() => setOpenParams(false)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-text/10 bg-bg/25 p-6">
            <div className="text-[16px] font-extrabold text-text">Цены</div>

            <label className="mt-4 block">
              <div className="text-[13px] font-semibold text-text/60">Интеграция (разово)</div>
              <input
                value={params.integrationFee}
                onChange={(e) =>
                  setParams((p) => ({ ...p, integrationFee: clamp(safeNumber(e.target.value, 0), 0, 50_000_000) }))
                }
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
              />
              <div className="mt-2 text-[12px] font-medium text-text/60">
                Если уже внедрено, можно поставить 0.
              </div>
            </label>
          </div>

          <div className="rounded-3xl border border-text/10 bg-bg/25 p-6">
            <div className="text-[16px] font-extrabold text-text">ФОТ (по умолчанию 70 000 ₽)</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Менеджер</div>
                <input
                  value={params.salarySales}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, salarySales: clamp(safeNumber(e.target.value, 0), 0, 5_000_000) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>

              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Админ</div>
                <input
                  value={params.salaryAdmin}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, salaryAdmin: clamp(safeNumber(e.target.value, 0), 0, 5_000_000) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>

              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">РОП</div>
                <input
                  value={params.salaryHead}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, salaryHead: clamp(safeNumber(e.target.value, 0), 0, 5_000_000) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Коэф. накладных</div>
                <input
                  value={params.overheadCoef}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, overheadCoef: clamp(safeNumber(e.target.value, 1.35), 1, 3) }))
                  }
                  inputMode="decimal"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
                <div className="mt-2 text-[12px] font-medium text-text/60">По умолчанию 1.35</div>
              </label>

              <label className="block">
                <div className="text-[13px] font-semibold text-text/60">Часов в месяц</div>
                <input
                  value={params.hoursPerMonth}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, hoursPerMonth: clamp(safeNumber(e.target.value, 168), 80, 220) }))
                  }
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-text/10 bg-bg/25 px-4 py-3 text-[14px] font-semibold text-text outline-none focus:border-text/25"
                />
                <div className="mt-2 text-[12px] font-medium text-text/60">По умолчанию 168</div>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-text/10 bg-bg/25 p-6 lg:col-span-2">
            <div className="text-[16px] font-extrabold text-text">Эффект</div>
            <div className="mt-2 text-[13px] font-medium text-text/60">
              Adoption отражает внедрение и дисциплину команды. Conversion отражает, какая часть сэкономленного времени реально превращается в деньги.
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13px] font-semibold text-text/60">Adoption</div>
                  <div className="text-[13px] font-semibold text-text">{nfNum.format(params.adoption * 100)}%</div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(params.adoption * 100)}
                  onChange={(e) => setParams((p) => ({ ...p, adoption: clamp(Number(e.target.value) / 100, 0, 1) }))}
                  className="mt-2 w-full"
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13px] font-semibold text-text/60">Conversion</div>
                  <div className="text-[13px] font-semibold text-text">{nfNum.format(params.conversion * 100)}%</div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(params.conversion * 100)}
                  onChange={(e) => setParams((p) => ({ ...p, conversion: clamp(Number(e.target.value) / 100, 0, 1) }))}
                  className="mt-2 w-full"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, adoption: 0.7, conversion: 0.45 }))}
                className="btn-lift-outline rounded-2xl border border-text/10 bg-bg/25 px-4 py-2 text-[13px] font-semibold text-text/70 hover:text-text"
              >
                Консервативно
              </button>
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, adoption: 0.85, conversion: 0.6 }))}
                className="btn-lift-outline rounded-2xl border border-text/10 bg-bg/25 px-4 py-2 text-[13px] font-semibold text-text/70 hover:text-text"
              >
                Нормально
              </button>
              <button
                type="button"
                onClick={() => setParams((p) => ({ ...p, adoption: 0.92, conversion: 0.75 }))}
                className="btn-lift-outline rounded-2xl border border-text/10 bg-bg/25 px-4 py-2 text-[13px] font-semibold text-text/70 hover:text-text"
              >
                Агрессивно
              </button>

              <button
                type="button"
                onClick={() => setParams(DEFAULT_PARAMS)}
                className="btn-lift-outline ml-auto rounded-2xl border border-text/10 bg-bg/25 px-4 py-2 text-[13px] font-extrabold text-text/80"
              >
                Сбросить дефолты
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
}