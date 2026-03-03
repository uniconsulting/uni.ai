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

  const p = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 34,
    mass: 0.7,
  });

  // Карточки прокручиваются чуть раньше, чтобы 3-я успевала "постоять"
  const a = useMemo(
    () => ({ s1: 0.22, t12: 0.38, s2: 0.5, t23: 0.66 }),
    [],
  );

  // DESKTOP
  // LEFT: блок 1
  const left1Opacity = useTransform(p, [0, a.s1, a.t12], [1, 1, 0]);
  const left1X = useTransform(p, [0, a.t12], [0, -140]);

  // LEFT: разделитель (блок 2)
  const leftLineOpacity = useTransform(
    p,
    [a.s1, a.t12, a.s2, a.t23],
    [0, 1, 1, 0],
  );
  const leftLineX = useTransform(p, [a.s1, a.t12], [-80, 0]);

  // LEFT: блок 3
  const left3Opacity = useTransform(p, [a.s2, a.t23, 1], [0, 1, 1]);
  const left3X = useTransform(p, [a.s2, a.t23], [-140, 0]);

  // RIGHT: разделитель (блок 1)
  const rightLineAOpacity = useTransform(p, [0, a.s1, a.t12], [1, 1, 0]);
  const rightLineAX = useTransform(p, [a.s1, a.t12], [0, 80]);

  // RIGHT: блок 2
  const right2Opacity = useTransform(
    p,
    [a.s1, a.t12, a.s2, a.t23],
    [0, 1, 1, 0],
  );
  const right2X = useTransform(
    p,
    [a.s1, a.t12, a.s2, a.t23],
    [140, 0, 0, 140],
  );

  // RIGHT: разделитель (блок 3)
  const rightLineBOpacity = useTransform(p, [a.s2, a.t23, 1], [0, 1, 1]);
  const rightLineBX = useTransform(p, [a.s2, a.t23], [-80, 0]);

  // MOBILE
  // Делаем диапазоны видимости без наложения текстов
  const m1Opacity = useTransform(p, [0, 0.24, 0.3], [1, 1, 0]);
  const m1X = useTransform(p, [0, 0.3], [0, -160]);

  const m2Opacity = useTransform(p, [0.34, 0.42, 0.58, 0.64], [0, 1, 1, 0]);
  const m2X = useTransform(p, [0.34, 0.44, 0.58, 0.68], [160, 0, 0, 160]);

  const m3Opacity = useTransform(p, [0.72, 0.8, 1], [0, 1, 1]);
  const m3X = useTransform(p, [0.72, 0.82], [-160, 0]);

  const mobileMotion =
    "will-change-[opacity,transform] transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  return (
    <section
      id="info"
      ref={sectionRef}
      className="relative overflow-x-clip"
      aria-label="Инфо-блоки"
    >
      <div className="relative h-[300vh]">
        <div className="sticky top-24 z-20">
          <Container className="py-12 md:py-16">
            {/* Desktop */}
            <div className="hidden md:block">
              <div className="relative h-[326px]">
                {/* Линии-разделители */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 w-screen -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    style={{
                      opacity: leftLineOpacity,
                      x: leftLineX,
                      left: 0,
                      right: "calc(50% + 290px)",
                    }}
                    className="absolute top-0 h-px bg-text/15"
                  />

                  <motion.div
                    style={{
                      opacity: rightLineAOpacity,
                      x: rightLineAX,
                      left: "calc(50% + 290px)",
                      right: 0,
                    }}
                    className="absolute top-0 h-px bg-text/15"
                  />

                  <motion.div
                    style={{
                      opacity: rightLineBOpacity,
                      x: rightLineBX,
                      left: "calc(50% + 290px)",
                      right: 0,
                    }}
                    className="absolute top-0 h-px bg-text/15"
                  />
                </div>

                <div className="grid h-full grid-cols-[minmax(0,1fr)_580px_minmax(0,1fr)]">
                  {/* LEFT COLUMN */}
                  <div className="relative h-full px-6 lg:px-10">
                    <motion.div
                      style={{ opacity: left1Opacity, x: left1X }}
                      className="absolute inset-0"
                    >
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

                    <motion.div
                      style={{ opacity: left3Opacity, x: left3X }}
                      className="absolute inset-0"
                    >
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
                      <video
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      >
                        <source
                          src={withBasePath("/info/IMG_6634.mp4")}
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="relative h-full px-6 lg:px-10">
                    <motion.div
                      style={{ opacity: right2Opacity, x: right2X }}
                      className="absolute inset-0"
                    >
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

            {/* Mobile */}
            <div className="md:hidden">
              {/* Отступ от разделителя Hero */}
              <div className="mt-6" />

              {/* Заголовок */}
              <div className="relative h-[66px] overflow-hidden">
                <motion.div
                  style={{ opacity: m1Opacity, x: m1X }}
                  className={`absolute inset-0 ${mobileMotion}`}
                >
                  <div className="text-left text-2xl font-extrabold leading-tight tracking-tight hover-accent">
                    Не знаете,
                    <br />
                    с чего начать?
                  </div>
                </motion.div>

                <motion.div
                  style={{ opacity: m2Opacity, x: m2X }}
                  className={`absolute inset-0 ${mobileMotion}`}
                >
                  <div className="text-right text-2xl font-extrabold leading-tight tracking-tight hover-accent">
                    Простые, понятные,
                    <br />
                    бесплатные уроки
                  </div>
                </motion.div>

                <motion.div
                  style={{ opacity: m3Opacity, x: m3X }}
                  className={`absolute inset-0 ${mobileMotion}`}
                >
                  <div className="text-left text-2xl font-extrabold leading-tight tracking-tight hover-accent">
                    Больше, чем кабинет
                    <br />
                    Это - виртуальный офис
                  </div>
                </motion.div>
              </div>

              {/* Видео */}
              <div className="mt-8 aspect-video w-full overflow-hidden rounded-[28px] bg-accent-3">
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source
                    src={withBasePath("/info/IMG_6634.mp4")}
                    type="video/mp4"
                  />
                </video>
              </div>

              {/* Описание */}
              <div className="relative mt-8 h-[146px] overflow-hidden">
                <motion.div
                  style={{ opacity: m1Opacity, x: m1X }}
                  className={`absolute inset-0 ${mobileMotion}`}
                >
                  <div className="text-left text-base leading-snug opacity-85">
                    Представьте, что Вам необходимо составить вакансию - опишите
                    именно те требования, которые для Вас важны. Встроенный
                    помощник составит должностную инструкцию, а далее...
                  </div>
                </motion.div>

                <motion.div
                  style={{ opacity: m2Opacity, x: m2X }}
                  className={`absolute inset-0 ${mobileMotion}`}
                >
                  <div className="text-right text-base leading-snug opacity-85">
                    Мы позаботились о том, чтобы Ваш опыт построения ИИ-команды
                    принёс удовольствие. Обучающие материалы и подсказки будут
                    рядом на каждом этапе.
                  </div>
                </motion.div>

                <motion.div
                  style={{ opacity: m3Opacity, x: m3X }}
                  className={`absolute inset-0 ${mobileMotion}`}
                >
                  <div className="text-left text-base leading-snug opacity-85">
                    Управляйте ботами для Telegram, VK и Avito из единого
                    интерфейса. Настраивайте поведение, подключайте базы знаний
                    и анализируйте результаты.
                  </div>
                </motion.div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
