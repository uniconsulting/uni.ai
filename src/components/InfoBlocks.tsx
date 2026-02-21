"use client";

import { useMemo, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/Container";

export function InfoBlocks() {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Прогресс скролла по секции
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Сглаживание, чтобы анимация была “дорогая”
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.9 });

  // Таймлайн:
  // 0..0.28  -> состояние 1
  // 0.28..0.46 -> переход 1->2
  // 0.46..0.62 -> состояние 2
  // 0.62..0.80 -> переход 2->3
  // 0.80..1    -> состояние 3
  const a = useMemo(() => ({ s1: 0.28, t12: 0.46, s2: 0.62, t23: 0.8 }), []);

  // LEFT: текст блока 1
  const left1Opacity = useTransform(p, [0, a.s1, a.t12], [1, 1, 0]);
  const left1X = useTransform(p, [0, a.t12], [0, -140]);

  // LEFT: разделитель (появляется на блоке 2)
  const leftLineOpacity = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [0, 1, 1, 0]);
  const leftLineX = useTransform(p, [a.s1, a.t12], [-80, 0]);

  // LEFT: текст блока 3
  const left3Opacity = useTransform(p, [a.s2, a.t23, 1], [0, 1, 1]);
  const left3X = useTransform(p, [a.s2, a.t23], [-140, 0]);

  // RIGHT: разделитель (есть на блоке 1 и 3)
  const rightLineAOpacity = useTransform(p, [0, a.s1, a.t12], [1, 1, 0]);
  const rightLineAX = useTransform(p, [a.s1, a.t12], [0, 80]);

  const rightLineBOpacity = useTransform(p, [a.s2, a.t23, 1], [0, 1, 1]);
  const rightLineBX = useTransform(p, [a.s2, a.t23], [-80, 0]);

  // RIGHT: текст блока 2
  const right2Opacity = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [0, 1, 1, 0]);
  const right2X = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [140, 0, 0, 140]);

  return (
    <section
      id="info"
      ref={sectionRef}
      className="relative"
      aria-label="Инфо-блоки"
    >
      {/* Высота секции задает “длину” скролл-таймлайна */}
      <div className="relative h-[240vh]">
        <div className="sticky top-24 z-20">
          <Container className="py-12 md:py-16">
            {/* Desktop layout */}
            <div className="hidden md:grid grid-cols-[1fr_580px_1fr] gap-10">
              {/* LEFT COLUMN (фиксированная высота под центрирование разделителей относительно вставки) */}
              <div className="relative h-[326px]">
                {/* Блок 1 */}
                <motion.div
                  style={{ opacity: left1Opacity, x: left1X }}
                  className="absolute left-0 top-0 w-full"
                >
                  <div className="max-w-[360px]">
                    <div className="text-[40px] font-extrabold leading-[1.05] tracking-tight">
                      Не знаете,
                      <br />
                      с чего начать?
                    </div>

                    <div className="mt-10 text-[20px] leading-snug opacity-85">
                      Представьте, что Вам
                      <br />
                      необходимо составить
                      <br />
                      вакансию - опишите
                      <br />
                      именно те требования,
                      <br />
                      которые для Вас важны.
                      <br />
                      <br />
                      Встроенный помощник
                      <br />
                      составит должностную
                      <br />
                      инструкцию, а далее...
                    </div>
                  </div>
                </motion.div>

                {/* Разделитель слева (для блока 2) */}
                <motion.div
                  style={{ opacity: leftLineOpacity, x: leftLineX }}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <div className="h-px w-[240px] bg-text/15" />
                </motion.div>

                {/* Блок 3 */}
                <motion.div
                  style={{ opacity: left3Opacity, x: left3X }}
                  className="absolute left-0 top-0 w-full"
                >
                  <div className="max-w-[380px]">
                    <div className="text-[40px] font-extrabold leading-[1.05] tracking-tight">
                      Больше, чем кабинет
                      <br />
                      Это - виртуальный офис
                    </div>

                    <div className="mt-10 text-[20px] leading-snug opacity-85">
                      Управляйте ботами для
                      <br />
                      Telegram, VK и Avito из
                      <br />
                      единого интерфейса.
                      <br />
                      <br />
                      Настраивайте поведение,
                      <br />
                      подключайте базы знаний
                      <br />
                      и анализируйте результаты.
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* CENTER INSERT (580px, 16:9, без бордюров) */}
              <div className="h-[326px] w-[580px]">
                <div className="h-full w-full rounded-[44px] bg-accent-3" />
              </div>

              {/* RIGHT COLUMN */}
              <div className="relative h-[326px]">
                {/* Разделитель справа (блок 1) */}
                <motion.div
                  style={{ opacity: rightLineAOpacity, x: rightLineAX }}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <div className="h-px w-[240px] bg-text/15" />
                </motion.div>

                {/* Текст блока 2 */}
                <motion.div
                  style={{ opacity: right2Opacity, x: right2X }}
                  className="absolute left-0 top-0 w-full"
                >
                  <div className="max-w-[420px]">
                    <div className="text-[40px] font-extrabold leading-[1.05] tracking-tight">
                      Простые, понятные,
                      <br />
                      бесплатные уроки
                    </div>

                    <div className="mt-10 text-[20px] leading-snug opacity-85">
                      Мы позаботились о том,
                      <br />
                      чтобы Ваш опыт построения
                      <br />
                      ИИ-команды принёс
                      <br />
                      удовольствие.
                      <br />
                      <br />
                      Обучающие материалы
                      <br />
                      и подсказки будут рядом
                      <br />
                      на каждом этапе
                    </div>
                  </div>
                </motion.div>

                {/* Разделитель справа (блок 3) */}
                <motion.div
                  style={{ opacity: rightLineBOpacity, x: rightLineBX }}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <div className="h-px w-[240px] bg-text/15" />
                </motion.div>
              </div>
            </div>

            {/* Mobile fallback (без сложной анимации) */}
            <div className="md:hidden space-y-8">
              <div className="text-3xl font-extrabold leading-tight">
                Не знаете,
                <br />
                с чего начать?
              </div>

              <div className="aspect-video w-full rounded-[28px] bg-accent-3" />

              <div className="text-base leading-snug opacity-85">
                Представьте, что Вам необходимо составить вакансию - опишите именно те требования,
                которые для Вас важны. Встроенный помощник составит должностную инструкцию, а далее...
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
