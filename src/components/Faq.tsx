/* src/components/Faq.tsx */
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/Container";

type FaqItem = { q: string; a: string };

const FAQ: FaqItem[] = [
  {
    q: "Чем ЮНИ отличается от «просто чат-бота»?",
    a: "ЮНИ — это не скриптовый бот с кнопками. Это полноценные ИИ-сотрудники, которые понимают контекст, ведут естественный диалог, помнят историю общения и могут решать сложные задачи. Они обучаются на вашей базе знаний и адаптируются под специфику бизнеса. Это как нанять умного менеджера, который работает 24/7 без выходных и больничных.",
  },
  {
    q: "Нужны ли программисты со стороны клиента?",
    a: "Нет. Вся настройка происходит в визуальном интерфейсе без кода. Для интеграций с CRM/ERP наши специалисты подготовят все необходимое. Вам понадобится только доступ к нужным системам и человек, который понимает бизнес-процессы.",
  },
  {
    q: "Сколько времени занимает внедрение?",
    a: "Базовый запуск — от 1 дня. Полноценное внедрение с интеграцией в CRM, обучением на базе знаний и настройкой сценариев — 2–4 недели. Мы сопровождаем вас на каждом этапе и проводим еженедельные улучшения по методологии Kaizen.",
  },
  {
    q: "Можно ли подключить нашу CRM?",
    a: "Да, мы интегрируемся с популярными CRM: Битрикс24, amoCRM, 1С, Мегаплан и другие. Для нестандартных систем делаем кастомную интеграцию через API. Данные о клиентах синхронизируются в реальном времени.",
  },
  {
    q: "Что насчет безопасности данных?",
    a: "Безопасность — приоритет. Все данные шифруются при передаче и хранении (TLS 1.3, AES-256). Серверы расположены в России, соответствие 152-ФЗ. Для Enterprise доступен вариант on-premise с размещением на ваших серверах.",
  },
  {
    q: "Как происходит обучение ИИ под наш бизнес?",
    a: "Вы загружаете базу знаний: прайсы, скрипты продаж, FAQ, описания услуг. ИИ анализирует материалы и начинает отвечать как ваш сотрудник. Можно добавлять примеры идеальных диалогов. Мы помогаем структурировать информацию для лучших результатов.",
  },
  {
    q: "Что если ИИ ответит неправильно?",
    a: "В аналитике вы видите все диалоги и можете отмечать ошибки. Мы оперативно корректируем модель. Для критичных сценариев настраиваем передачу на живого оператора. С каждой неделей качество ответов растет благодаря постоянным улучшениям.",
  },
  {
    q: "Работаете ли вы с Казахстаном?",
    a: "Да, ЮНИ работает в России и Казахстане. Поддерживаем русский и казахский языки. Оплата возможна в рублях или тенге. Все юридические вопросы решаем — работаем как с ИП/ООО, так и с ТОО.",
  },
  {
    q: "Какие каналы поддерживаются?",
    a: "Telegram, VK, Avito, WhatsApp (через официальный API), виджет на сайте, интеграция в мобильное приложение. На тарифе Enterprise — любые кастомные каналы. Один агент может работать во всех каналах одновременно.",
  },
];

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

function FaqCard({
  item,
  isActive, // отвечает за “активный вид” карточки (фон/бордер/жирность вопроса)
  isOpen, // отвечает за показ/анимацию ответа
  onToggle,
  onAnswerExitComplete,
  mode,
  radiusClass,
}: {
  item: FaqItem;
  isActive: boolean;
  isOpen: boolean;
  onToggle?: () => void;
  onAnswerExitComplete?: () => void;
  mode: "desktop" | "mobile" | "measure";
  radiusClass: string;
}) {
  const interactive = mode !== "measure";
  const desktopLayout = mode !== "mobile"; // desktop + measure
  const fillHeight = mode === "desktop";

  const shell = [
    "w-full overflow-hidden ring-inset",
    fillHeight ? "h-full" : "h-auto",
    isActive ? "bg-accent-3 ring-2 ring-accent-2" : "bg-bg ring-1 ring-text/15",
    "transition-[background-color] duration-[560ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
    radiusClass,
  ].join(" ");

  // ВАЖНО: для неактивной строки делаем стабильное вертикальное центрирование
  // через flex + items-center, а сам вопрос без лишних обёрток, чтобы не “подъезжал”.
  const padInactiveDesktop = "h-full px-8 lg:px-10 flex items-center justify-start";
  const padActiveDesktop = "px-8 lg:px-10 py-8";
  const padMobile = "px-6 md:px-8 py-6";

  const qClass = [
    "text-left",
    "leading-[1.12] tracking-tight",
    "text-[18px] md:text-[20px] lg:text-[22px]",
    isActive ? "font-semibold text-text" : "font-normal text-text/55",
  ].join(" ");

  const AnswerBlock = (
    <AnimatePresence
      initial={false}
      mode="sync"
      onExitComplete={onAnswerExitComplete}
    >
      {isOpen ? (
        <motion.div
          key="answer"
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0, y: 6 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: 4 }}
          transition={{
            height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <div className="mt-5 h-px w-full bg-text/10" />
          <div className="mt-4 text-[15px] md:text-[16px] font-medium leading-snug text-text">
            {item.a}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const body = (
    <div className={shell}>
      {desktopLayout ? (
        isActive ? (
          <div className={padActiveDesktop}>
            <div className="w-full">
              <div className={qClass}>{item.q}</div>

              {/* measure: без анимаций, чтобы высота считалась ровно */}
              {mode === "measure" ? (
                <>
                  <div className="mt-5 h-px w-full bg-text/10" />
                  <div className="mt-4 text-[15px] md:text-[16px] font-medium leading-snug text-text">
                    {item.a}
                  </div>
                </>
              ) : (
                AnswerBlock
              )}
            </div>
          </div>
        ) : (
          <div className={padInactiveDesktop}>
            <div className={qClass}>{item.q}</div>
          </div>
        )
      ) : (
        // Mobile
        <div className={padMobile}>
          <div className="w-full">
            <div className={qClass}>{item.q}</div>
            {mode === "measure" ? null : AnswerBlock}
          </div>
        </div>
      )}
    </div>
  );

  if (!interactive) return body;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={fillHeight ? "block h-full w-full text-left" : "block w-full text-left"}
      aria-expanded={isOpen}
    >
      {body}
    </button>
  );
}

export function Faq() {
  const { ref: sectionRef, inView } = useOnceInView<HTMLElement>();

  // openIdx = кто реально показывает ответ
  // layoutIdx = кто держит “активную геометрию/стиль” (в т.ч. во время закрытия)
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [layoutIdx, setLayoutIdx] = useState<number | null>(null);
  const [closingIdx, setClosingIdx] = useState<number | null>(null);

  // геометрия “колоды” (desktop)
  const COLLAPSED_H = 92;
  const OVERLAP = 20;
  const STEP = COLLAPSED_H - OVERLAP;

  const deckRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [deckW, setDeckW] = useState(0);
  const [activeH, setActiveH] = useState(260);

  useLayoutEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    const update = () => setDeckW(el.getBoundingClientRect().width);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (layoutIdx == null) return;
    if (!measureRef.current) return;

    const raf = requestAnimationFrame(() => {
      const h = measureRef.current?.getBoundingClientRect().height ?? 0;
      if (h > 0) setActiveH(Math.ceil(h));
    });

    return () => cancelAnimationFrame(raf);
  }, [layoutIdx, deckW]);

  const extra = useMemo(() => {
    if (layoutIdx == null) return 0;
    return Math.max(0, activeH - COLLAPSED_H);
  }, [layoutIdx, activeH]);

  const deckH = useMemo(() => {
    const base = (FAQ.length - 1) * STEP + COLLAPSED_H;
    return base + extra;
  }, [extra]);

  const topFor = (i: number) => {
    if (layoutIdx == null) return i * STEP;
    if (i <= layoutIdx) return i * STEP;
    return i * STEP + extra;
  };

  const heightFor = (i: number) => {
    if (layoutIdx == null) return COLLAPSED_H;
    return i === layoutIdx ? activeH : COLLAPSED_H;
  };

  const radiusFor = (i: number, isActive: boolean) => {
    if (isActive) return "rounded-[30px]";
    const last = FAQ.length - 1;

    const top = i === 0 && layoutIdx !== 0;
    const bot = i === last && layoutIdx !== last;

    if (top && bot) return "rounded-[30px]";
    if (top) return "rounded-t-[30px] rounded-b-none";
    if (bot) return "rounded-b-[30px] rounded-t-none";
    return "rounded-none";
  };

  const onToggle = (i: number) => {
    // закрываем текущую
    if (openIdx === i) {
      setOpenIdx(null);
      setClosingIdx(i);
      // layoutIdx оставляем, пока не отработает exit ответа
      return;
    }

    // открываем новую
    setClosingIdx(null);
    setLayoutIdx(i);
    setOpenIdx(i);
  };

  const onAnswerExitCompleteFor = (i: number) => {
    // защита от “позднего” exit, если уже открыли другую карточку
    setLayoutIdx((prev) => (prev === i ? null : prev));
    setClosingIdx((prev) => (prev === i ? null : prev));
  };

  const CARD_MOTION =
    "will-change-[top,height] transition-[top,height] duration-[560ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";

  const REVEAL_BASE =
    "transform-gpu transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

  return (
    <section
      id="faq"
      ref={sectionRef as any}
      className={`relative overflow-x-clip ${inView ? "opacity-100" : "opacity-0"} transition-opacity duration-700 ease-out`}
      aria-label="FAQ"
    >
      {/* разделители как в Packages */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10 transition-opacity duration-700 ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 h-[220px] w-px -translate-x-1/2 bg-text/10 transition-opacity duration-700 ${
          inView ? "opacity-100" : "opacity-0"
        }`}
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        {/* header */}
        <div className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="md:pr-10">
              <div className="text-[18px] font-medium opacity-70 hover-accent">FAQ | Ответы</div>
            </div>

            <div className="md:pl-10 text-right flex flex-col items-end">
              <div className="text-[22px] md:text-[26px] lg:text-[34px] font-extrabold text-accent-1">
                Часто задаваемые вопросы
              </div>

              <div className="mt-3 font-semibold leading-[1.05] tracking-tight text-[22px] md:text-[26px] lg:text-[28px] text-text">
                Вероятнее всего,
                <br />
                ответ на твой вопрос тут.
              </div>
            </div>
          </div>
        </div>

        {/* cards */}
        <div
          className={`${REVEAL_BASE} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} mt-12`}
          style={{ transitionDelay: "80ms" }}
        >
          {/* Desktop: вертикальная “колода” */}
          <div className="hidden md:block">
            <div ref={deckRef} className="relative w-full" style={{ height: deckH }}>
              {/* hidden measure (высота активной) */}
              {layoutIdx != null && deckW > 0 ? (
                <div
                  className="pointer-events-none absolute -left-[9999px] top-0 opacity-0"
                  style={{ width: deckW }}
                  aria-hidden
                >
                  <div ref={measureRef}>
                    <FaqCard
                      item={FAQ[layoutIdx]}
                      isActive={true}
                      isOpen={true}
                      mode="measure"
                      radiusClass="rounded-[30px]"
                    />
                  </div>
                </div>
              ) : null}

              {FAQ.map((item, i) => {
                const isActive = i === layoutIdx;
                const isOpen = i === openIdx;

                const z = isActive ? 50 : 10 + (FAQ.length - i);

                return (
                  <div
                    key={item.q}
                    className={`${CARD_MOTION} absolute left-0 right-0`}
                    style={{
                      top: topFor(i),
                      height: heightFor(i),
                      zIndex: z,
                    }}
                  >
                    <FaqCard
                      item={item}
                      isActive={isActive}
                      isOpen={isOpen}
                      mode="desktop"
                      radiusClass={radiusFor(i, isActive)}
                      onToggle={() => onToggle(i)}
                      onAnswerExitComplete={
                        closingIdx === i ? () => onAnswerExitCompleteFor(i) : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: обычный аккордеон */}
          <div className="md:hidden space-y-4">
            {FAQ.map((item, i) => {
              const isActive = i === openIdx;
              return (
                <FaqCard
                  key={item.q}
                  item={item}
                  isActive={isActive}
                  isOpen={isActive}
                  mode="mobile"
                  radiusClass="rounded-[24px]"
                  onToggle={() => onToggle(i)}
                />
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}