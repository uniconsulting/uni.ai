"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/Container";

export function InfoBlocks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const insetRef = useRef<HTMLDivElement | null>(null);

  // чтобы разделители всегда попадали ровно в “центральную линию” вставки
  const [insetH, setInsetH] = useState(0);

  useLayoutEffect(() => {
    const el = insetRef.current;
    if (!el) return;

    const update = () => setInsetH(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // sticky-stage: пока скроллим внутри секции, меняем состояния блоков
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 42, mass: 0.85 });

  // Таймлайн (0..1):
  // A (блок 1) -> B (блок 2) -> C (блок 3)
  // 0..0.28 держим A
  // 0.28..0.40 A уезжает, линии/текст B въезжают
  // 0.40..0.62 держим B
  // 0.62..0.78 B уезжает, линии/текст C въезжают
  // 0.78..1 держим C

  // LEFT TEXT 1 (A)
  const left1Opacity = useTransform(p, [0, 0.28, 0.40], [1, 1, 0]);
  const left1X = useTransform(p, [0.28, 0.40], [0, -160]);

  // LEFT TEXT 3 (C)
  const left3Opacity = useTransform(p, [0.62, 0.78, 1], [0, 1, 1]);
  const left3X = useTransform(p, [0.62, 0.78], [-160, 0]);

  // RIGHT TEXT 2 (B)
  const right2Opacity = useTransform(p, [0.28, 0.40, 0.62, 0.78], [0, 1, 1, 0]);
  const right2X = useTransform(p, [0.28, 0.40, 0.62, 0.78], [160, 0, 0, 160]);

  // LEFT DIVIDER (виден только в B)
  const leftLineOpacity = useTransform(p, [0.28, 0.40, 0.62, 0.78], [0, 1, 1, 0]);
  const leftLineX = useTransform(p, [0.28, 0.40, 0.62, 0.78], [-120, 0, 0, -120]);

  // RIGHT DIVIDER (виден в A и C)
  const rightLineOpacity = useTransform(p, [0, 0.28, 0.40, 0.62, 0.78, 1], [1, 1, 0, 0, 1, 1]);
  const rightLineX = useTransform(p, [0, 0.28, 0.40, 0.62, 0.78], [0, 0, 120, 120, 0]);

  const dividerTop = insetH ? insetH / 2 : 163; // fallback ~ (580*9/16)/2

  return (
    <section
      id="info"
      ref={sectionRef as any}
      className="relative overflow-x-clip bg-bg"
    >
      {/* ВАЖНО: высокий “коридор” скролла, чтобы 3-й блок 100% успевал закончить до следующей секции */}
      <div className="relative h-[340vh]">
        <div className="sticky top-24 z-30">
          <Container className="py-16 md:py-20">
            {/* как в Hero: чуть “жирнее” внутренний отступ */}
            <div className="relative px-1">
              {/* DESKTOP */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_580px_1fr] lg:gap-14">
                {/* LEFT */}
                <div className="relative">
                  <motion.div
                    className="max-w-[520px]"
                    style={{ opacity: left1Opacity, x: left1X }}
                  >
                    <h2 className="text-[64px] font-extrabold leading-[0.95] tracking-tight">
                      Не знаете,
                      <br />
                      с чего начать?
                    </h2>

                    <div className="mt-12 text-[22px] leading-[1.55] opacity-70">
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
                    className="max-w-[520px]"
                    style={{ opacity: left3Opacity, x: left3X }}
                  >
                    <h2 className="text-[64px] font-extrabold leading-[0.95] tracking-tight">
                      Больше, чем кабинет
                      <br />
                      Это — виртуальный офис
                    </h2>

                    <div className="mt-12 text-[22px] leading-[1.55] opacity-70">
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

                  {/* LEFT divider (только на втором состоянии) */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute left-0 h-px w-[260px] bg-text/15"
                    style={{
                      top: dividerTop,
                      opacity: leftLineOpacity,
                      x: leftLineX,
                      translateY: "-50%",
                    }}
                  />
                </div>

                {/* CENTER 16:9 (580px) */}
                <div className="flex justify-center">
                  <div
                    ref={insetRef}
                    className="w-full max-w-[580px] overflow-hidden rounded-[56px] bg-accent-3"
                  >
                    <div className="aspect-video w-full" />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="relative">
                  {/* RIGHT divider (состояния 1 и 3) */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute left-0 h-px w-[260px] bg-text/15"
                    style={{
                      top: dividerTop,
                      opacity: rightLineOpacity,
                      x: rightLineX,
                      translateY: "-50%",
                    }}
                  />

                  {/* RIGHT text (состояние 2) */}
                  <motion.div
                    className="max-w-[520px]"
                    style={{ opacity: right2Opacity, x: right2X }}
                  >
                    <h2 className="text-[64px] font-extrabold leading-[0.95] tracking-tight">
                      Простые, понятные,
                      <br />
                      бесплатные уроки
                    </h2>

                    <div className="mt-12 text-[22px] leading-[1.55] opacity-70">
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

              {/* MOBILE / TABLET fallback: без sticky-магии, просто 3 блока */}
              <div className="lg:hidden space-y-10">
                <div className="space-y-5">
                  <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Не знаете,
                    <br />
                    с чего начать?
                  </h2>
                  <div className="text-lg leading-relaxed opacity-70">
                    Представьте, что Вам необходимо составить вакансию - опишите именно те требования,
                    которые для Вас важны. Встроенный помощник составит должностную инструкцию, а далее...
                  </div>
                </div>

                <div className="w-full overflow-hidden rounded-[40px] bg-accent-3">
                  <div className="aspect-video w-full" />
                </div>

                <div className="space-y-5">
                  <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Простые, понятные,
                    <br />
                    бесплатные уроки
                  </h2>
                  <div className="text-lg leading-relaxed opacity-70">
                    Мы позаботились о том, чтобы Ваш опыт построения ИИ-команды принёс удовольствие.
                    Обучающие материалы и подсказки будут рядом на каждом этапе.
                  </div>
                </div>

                <div className="space-y-5">
                  <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Больше, чем кабинет
                    <br />
                    Это — виртуальный офис
                  </h2>
                  <div className="text-lg leading-relaxed opacity-70">
                    Управляйте ботами для Telegram, VK и Avito из единого интерфейса.
                    Настраивайте поведение, подключайте базы знаний и анализируйте результаты.
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
