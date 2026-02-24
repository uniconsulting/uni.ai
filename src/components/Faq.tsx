/* src/components/Faq.tsx */
"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

type FaqItem = {
  q: string;
  a: string;
};

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

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  const headerPad = useMemo(() => "pt-12 md:pt-14 lg:pt-16", []);
  const bodyPad = useMemo(() => "pb-12 md:pb-16 lg:pb-20", []);

  return (
    <section id="faq" className="relative overflow-x-clip">
      {/* горизонтальный разделитель во всю ширину */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10"
      />

      <Container className={`relative z-10 ${headerPad} ${bodyPad} px-6 md:px-10 lg:px-12`}>
        {/* HEADER */}
        <div className="relative">
          {/* вертикальный разделитель на 220px из центра */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 hidden h-[220px] w-px -translate-x-1/2 bg-text/10 md:block"
          />

          <div className="grid gap-8 md:grid-cols-2 md:gap-0">
            {/* left */}
            <div className="md:pr-10">
              <div className="text-[18px] font-medium opacity-70 hover-accent">FAQ | Ответы</div>
            </div>

            {/* right */}
            <div className="md:pl-10">
              <div className="text-[22px] md:text-[26px] lg:text-[34px] font-extrabold text-accent-1">
                Часто задаваемые вопросы
              </div>
              <div className="mt-3 font-semibold leading-[1.05] tracking-tight text-[22px] md:text-[26px] lg:text-[28px]">
                Вероятнее всего,
                <br />
                ответ на твой вопрос тут.
              </div>
            </div>
          </div>
        </div>

        {/* FAQ DECK */}
        <div className="mt-10 md:mt-12 lg:mt-14">
          <ul className="mx-auto max-w-[980px]">
            {FAQ.map((item, idx) => {
              const isOpen = open === idx;

              const baseOverlap =
                idx === 0
                  ? ""
                  : open == null
                    ? "-mt-4"
                    : idx === open + 1
                      ? "mt-6"
                      : "-mt-4";

              const z = isOpen ? 50 : 10 + (FAQ.length - idx);

              return (
                <motion.li
                  key={item.q}
                  layout
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className={baseOverlap}
                  style={{ zIndex: z, position: "relative" }}
                >
                  <motion.div
                    layout
                    className={[
                      "rounded-[30px] bg-accent-3 ring-1 ring-text/10 overflow-hidden",
                      "shadow-[0_14px_50px_rgba(0,0,0,0.12)]",
                      isOpen ? "scale-[1.01]" : "scale-[0.995] opacity-[0.92]",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen((v) => (v === idx ? null : idx))}
                      className="w-full text-left p-6 md:p-7"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${idx}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-[16px] md:text-[18px] font-extrabold text-text leading-snug">
                            {idx + 1}. {item.q}
                          </div>
                          <div className="mt-2 text-[13px] md:text-[14px] font-semibold text-text/55">
                            {isOpen ? "нажми, чтобы свернуть" : "нажми, чтобы раскрыть"}
                          </div>
                        </div>

                        <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-text/10 bg-bg/20">
                          {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          id={`faq-panel-${idx}`}
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="px-6 md:px-7 pb-6 md:pb-7">
                            <div className="h-px w-full bg-text/10" />
                            <div className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-text/85">
                              {item.a}
                            </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}