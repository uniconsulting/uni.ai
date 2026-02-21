"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/Container";

export function InfoBlocks() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const p = useSpring(scrollYProgress, { stiffness: 180, damping: 34, mass: 0.9 });

  // прогресс-окна: A(1) -> B(2) -> A(3)
  const t1a = 0.28;
  const t1b = 0.38;
  const t2a = 0.62;
  const t2b = 0.72;

  // левый текст #1 уезжает
  const left1Opacity = useTransform(p, [0, t1a, t1b], [1, 1, 0]);
  const left1X = useTransform(p, [0, t1a, t1b], [0, 0, -110]);

  // левый текст #3 приезжает
  const left3Opacity = useTransform(p, [t2a, t2b, 1], [0, 1, 1]);
  const left3X = useTransform(p, [t2a, t2b, 1], [-110, 0, 0]);

  // правый текст #2 появляется, потом исчезает
  const right2Opacity = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [0, 0, 1, 1, 0, 0]);
  const right2X = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [110, 110, 0, 0, 110, 110]);

  // разделитель справа: виден в #1 и #3
  const rightLineOpacity = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [1, 1, 0, 0, 1, 1]);
  const rightLineX = useTransform(p, [0, t1a, t1b], [0, 0, 80]);

  // разделитель слева: виден только в #2
  const leftLineOpacity = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [0, 0, 1, 1, 0, 0]);
  const leftLineX = useTransform(p, [0, t1a, t1b], [-80, -80, 0]);

  return (
    <section id="info" ref={sectionRef} className="relative mt-20 min-h-[320vh]">
      {/* MOBILE fallback */}
      <Container className="md:hidden py-10 space-y-10">
        <div className="space-y-6">
          <div className="text-4xl font-extrabold leading-[0.95]">
            Не знаете,
            <br />
            с чего начать?
          </div>
          <div className="text-base leading-relaxed opacity-70">
            Представьте, что Вам необходимо составить вакансию - опишите именно те требования, которые
            для Вас важны.
            <br />
            <br />
            Встроенный помощник составит должностную инструкцию, а далее...
          </div>
        </div>

        <div className="mx-auto w-full max-w-[580px]">
          <div className="aspect-video w-full rounded-[44px] bg-accent-3" />
        </div>

        <div className="space-y-6">
          <div className="text-3xl font-extrabold leading-[1.05]">
            Простые, понятные,
            <br />
            бесплатные уроки
          </div>
          <div className="text-base leading-relaxed opacity-70">
            Мы позаботились о том, чтобы Ваш опыт построения ИИ-команды принёс удовольствие.
            <br />
            <br />
            Обучающие материалы и подсказки будут рядом на каждом этапе
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-3xl font-extrabold leading-[1.05]">
            Больше, чем кабинет
            <br />
            Это - виртуальный офис
          </div>
          <div className="text-base leading-relaxed opacity-70">
            Управляйте ботами для Telegram, VK и Avito из единого интерфейса.
            <br />
            <br />
            Настраивайте поведение, подключайте базы знаний и анализируйте результаты.
          </div>
        </div>
      </Container>

      {/* DESKTOP stage */}
      <div className="hidden md:block sticky top-24 z-30">
        <Container>
          <div className="h-[calc(100vh-96px)] flex items-center">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_580px_minmax(0,1fr)] items-center gap-x-10">
              {/* LEFT */}
              <div className="relative flex items-center">
                <div className="relative w-full max-w-[520px] min-h-[360px]">
                  <motion.div
                    className="absolute inset-0"
                    style={{ opacity: left1Opacity, x: left1X }}
                  >
                    <div className="text-[56px] font-extrabold leading-[0.92] tracking-tight">
                      Не знаете,
                      <br />
                      с чего начать?
                    </div>

                    <div className="mt-10 text-lg leading-[1.6] opacity-70">
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
                  </motion.div>

                  <motion.div
                    className="absolute inset-0"
                    style={{ opacity: left3Opacity, x: left3X }}
                  >
                    <div className="text-[56px] font-extrabold leading-[0.92] tracking-tight">
                      Больше, чем кабинет
                      <br />
                      Это - виртуальный офис
                    </div>

                    <div className="mt-10 text-lg leading-[1.6] opacity-70">
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
                  </motion.div>
                </div>

                {/* LEFT LINE (только в состоянии #2) */}
                <motion.div
                  className="ml-auto mr-6 h-px w-44 bg-text/15"
                  style={{ opacity: leftLineOpacity, x: leftLineX }}
                />
              </div>

              {/* CENTER 16:9 */}
              <div className="flex justify-center">
                <div className="w-full max-w-[580px]">
                  <div className="aspect-video w-full rounded-[44px] bg-accent-3" />
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative flex items-center">
                {/* RIGHT LINE (в #1 и #3) */}
                <motion.div
                  className="mr-auto ml-6 h-px w-44 bg-text/15"
                  style={{ opacity: rightLineOpacity, x: rightLineX }}
                />

                {/* RIGHT TEXT #2 */}
                <div className="relative w-full max-w-[520px] min-h-[360px]">
                  <motion.div style={{ opacity: right2Opacity, x: right2X }}>
                    <div className="text-[48px] font-extrabold leading-[0.98] tracking-tight">
                      Простые, понятные,
                      <br />
                      бесплатные уроки
                    </div>

                    <div className="mt-10 text-lg leading-[1.6] opacity-70">
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
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
