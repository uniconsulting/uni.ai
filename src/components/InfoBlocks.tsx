"use client";

import { useMemo, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

export function InfoBlocks() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.7 });

  const a = useMemo(() => ({ s1: 0.28, t12: 0.46, s2: 0.62, t23: 0.8 }), []);

  // LEFT: блок 1
  const left1Opacity = useTransform(p, [0, a.s1, a.t12], [1, 1, 0]);
  const left1X = useTransform(p, [0, a.t12], [0, -140]);

  // LEFT: разделитель (блок 2)
  const leftLineOpacity = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [0, 1, 1, 0]);
  const leftLineX = useTransform(p, [a.s1, a.t12], [-80, 0]);

  // LEFT: блок 3
  const left3Opacity = useTransform(p, [a.s2, a.t23, 1], [0, 1, 1]);
  const left3X = useTransform(p, [a.s2, a.t23], [-140, 0]);

  // RIGHT: разделитель (блок 1)
  const rightLineAOpacity = useTransform(p, [0, a.s1, a.t12], [1, 1, 0]);
  const rightLineAX = useTransform(p, [a.s1, a.t12], [0, 80]);

  // RIGHT: блок 2
  const right2Opacity = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [0, 1, 1, 0]);
  const right2X = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [140, 0, 0, 140]);

  // RIGHT: разделитель (блок 3)
  const rightLineBOpacity = useTransform(p, [a.s2, a.t23, 1], [0, 1, 1]);
  const rightLineBX = useTransform(p, [a.s2, a.t23], [-80, 0]);

  // ---- Mobile card transitions (новая логика) ----
  const m1Opacity = useTransform(p, [0, a.s1, a.t12], [1, 1, 0]);
  const m1X = useTransform(p, [0, a.t12], [0, -180]);

  const m2Opacity = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [0, 1, 1, 0]);
  const m2X = useTransform(p, [a.s1, a.t12, a.s2, a.t23], [180, 0, 0, 180]);

  const m3Opacity = useTransform(p, [a.s2, a.t23, 1], [0, 1, 1]);
  const m3X = useTransform(p, [a.s2, a.t23], [-180, 0]);

  const mobileCardMotion =
    "will-change-[opacity,transform,filter] transition-[opacity,transform,filter] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  return (
    <section id="info" ref={sectionRef} className="relative overflow-x-clip" aria-label="Инфо-блоки">
      <div className="relative h-[300vh]">
        <div className="sticky top-24 z-20">
          <Container className="py-12 md:py-16">
            {/* Desktop */}
            <div className="hidden md:block">
              {/* фиксируем высоту ровно под вставку (580 * 9 / 16 = 326.25) */}
              <div className="relative h-[326px]">
                {/* Линии-разделители: слой w-screen, чтобы тянуть до краёв экрана */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 w-screen -translate-x-1/2 -translate-y-1/2">
                  {/* левый разделитель (в блоке 2): от левого края экрана до левого края вставки */}
                  <motion.div
                    style={{ opacity: leftLineOpacity, x: leftLineX, left: 0, right: "calc(50% + 290px)" }}
                    className="absolute top-0 h-px bg-text/15"
                  />
                  {/* правый разделитель (в блоке 1): от правого края вставки до правого края экрана */}
                  <motion.div
                    style={{ opacity: rightLineAOpacity, x: rightLineAX, left: "calc(50% + 290px)", right: 0 }}
                    className="absolute top-0 h-px bg-text/15"
                  />
                  {/* правый разделитель (в блоке 3) */}
                  <motion.div
                    style={{ opacity: rightLineBOpacity, x: rightLineBX, left: "calc(50% + 290px)", right: 0 }}
                    className="absolute top-0 h-px bg-text/15"
                  />
                </div>

                {/* Сетка без gap: именно так получается “край → текст” == “текст → вставка” */}
                <div className="grid h-full grid-cols-[minmax(0,1fr)_580px_minmax(0,1fr)]">
                  {/* LEFT COLUMN */}
                  <div className="relative h-full px-6 lg:px-10">
                    {/* блок 1 */}
                    <motion.div style={{ opacity: left1Opacity, x: left1X }} className="absolute inset-0">
                      <div className="flex h-full items-start justify-center">
                        <div className="w-full max-w-[360px] text-left">
                          <div className="hover-accent text-[32px] font-extrabold leading-[1.08] tracking-tight">
                            Не знаете,
                            <br />
                            с чего начать?
                          </div>

                          <div className="hover-accent mt-9 text-[18px] leading-snug opacity-85">
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
                      </div>
                    </motion.div>

                    {/* блок 3 */}
                    <motion.div style={{ opacity: left3Opacity, x: left3X }} className="absolute inset-0">
                      <div className="flex h-full items-start justify-center">
                        <div className="w-full max-w-[380px] text-left">
                          <div className="hover-accent text-[32px] font-extrabold leading-[1.08] tracking-tight">
                            Больше, чем кабинет
                            <br />
                            Это - виртуальный офис
                          </div>

                          <div className="hover-accent mt-9 text-[18px] leading-snug opacity-85">
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
                      </div>
                    </motion.div>
                  </div>

                  {/* CENTER INSERT */}
                  <div className="h-full w-[580px]">
                    <div className="h-full w-full overflow-hidden rounded-[44px] bg-accent-3">
                      <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata">
                        <source src={withBasePath("/info/IMG_6634.mp4")} type="video/mp4" />
                      </video>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="relative h-full px-6 lg:px-10">
                    <motion.div style={{ opacity: right2Opacity, x: right2X }} className="absolute inset-0">
                      <div className="flex h-full items-start justify-center">
                        <div className="w-full max-w-[360px] text-right">
                          <div className="hover-accent text-[32px] font-extrabold leading-[1.08] tracking-tight">
                            Простые, понятные,
                            <br />
                            бесплатные уроки
                          </div>

                          <div className="hover-accent mt-9 text-[18px] leading-snug opacity-85">
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
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: scroll-driven cards */}
            <div className="md:hidden">
              {/* 1) Отступ от Hero-разделителя до заголовка == от кнопки до разделителя (24px) */}
              <div className="mt-6" />

              <div className="relative">
                {/* TITLE area (stacked) */}
                <div className="relative min-h-[76px] overflow-hidden">
                  <motion.div
                    className={`${mobileCardMotion} absolute inset-0`}
                    style={{ opacity: m1Opacity, x: m1X }}
                  >
                    <div className="text-left text-[24px] font-extrabold leading-tight tracking-tight hover-accent">
                      Не знаете,
                      <br />
                      с чего начать?
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${mobileCardMotion} absolute inset-0`}
                    style={{ opacity: m2Opacity, x: m2X }}
                  >
                    <div className="text-left text-[24px] font-extrabold leading-tight tracking-tight hover-accent">
                      Простые, понятные,
                      <br />
                      бесплатные уроки
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${mobileCardMotion} absolute inset-0`}
                    style={{ opacity: m3Opacity, x: m3X }}
                  >
                    <div className="text-left text-[24px] font-extrabold leading-tight tracking-tight hover-accent">
                      Больше, чем кабинет
                      <br />
                      Это - виртуальный офис
                    </div>
                  </motion.div>
                </div>

                {/* VIDEO 16:9 всегда max size */}
                <div className="mt-8 aspect-video w-full overflow-hidden rounded-[28px] bg-accent-3">
                  <video className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata">
                    <source src={withBasePath("/info/IMG_6634.mp4")} type="video/mp4" />
                  </video>
                </div>

                {/* DESCRIPTION area (stacked) */}
                <div className="relative mt-8 min-h-[120px] overflow-hidden">
                  <motion.div
                    className={`${mobileCardMotion} absolute inset-0`}
                    style={{ opacity: m1Opacity, x: m1X }}
                  >
                    <div className="text-left text-[16px] leading-snug text-text/85">
                      Представьте, что вам нужно составить вакансию. Опишите именно те требования,
                      которые для вас важны. Встроенный помощник составит должностную инструкцию, а далее...
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${mobileCardMotion} absolute inset-0`}
                    style={{ opacity: m2Opacity, x: m2X }}
                  >
                    <div className="text-left text-[16px] leading-snug text-text/85">
                      Мы сделали обучение простым: материалы и подсказки всегда рядом.
                      Вы выстраиваете ИИ-команду спокойно, шаг за шагом, без перегруза.
                    </div>
                  </motion.div>

                  <motion.div
                    className={`${mobileCardMotion} absolute inset-0`}
                    style={{ opacity: m3Opacity, x: m3X }}
                  >
                    <div className="text-left text-[16px] leading-snug text-text/85">
                      Управляйте ботами для Telegram, VK и Avito из одного интерфейса.
                      Настраивайте поведение, подключайте базы знаний и анализируйте результаты.
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
