"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/Container";

export function InfoBlocks() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // сглаживаем, чтобы всё было “как масло”
  const p = useSpring(scrollYProgress, { stiffness: 180, damping: 34, mass: 0.9 });

  // тайминг переходов
  const t1a = 0.22; // начало перехода 1
  const t1b = 0.34; // конец перехода 1
  const t2a = 0.66; // начало перехода 2
  const t2b = 0.78; // конец перехода 2

  // Левый текст #1 -> уезжает влево и исчезает
  const left1Opacity = useTransform(p, [0, t1a, t1b], [1, 1, 0]);
  const left1X = useTransform(p, [0, t1a, t1b], [0, 0, -90]);

  // Левый текст #3 -> появляется после 2-го перехода
  const left3Opacity = useTransform(p, [t2a, t2b, 1], [0, 1, 1]);
  const left3X = useTransform(p, [t2a, t2b, 1], [-90, 0, 0]);

  // Разделитель справа: виден в #1 и #3, исчезает в #2
  const rightDivOpacity = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [1, 1, 0, 0, 1, 1]);
  const rightDivX = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [0, 0, 80, 80, 0, 0]);

  // Разделитель слева: виден только в #2
  const leftDivOpacity = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [0, 0, 1, 1, 0, 0]);
  const leftDivX = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [-80, -80, 0, 0, -80, -80]);

  // Правый текст #2: появляется в #2, исчезает в #3
  const right2Opacity = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [0, 0, 1, 1, 0, 0]);
  const right2X = useTransform(p, [0, t1a, t1b, t2a, t2b, 1], [90, 90, 0, 0, 90, 90]);

  return (
    <section id="info" ref={sectionRef} className="relative mt-20">
      {/* MOBILE fallback (без sticky-анимации) */}
      <div className="md:hidden">
        <Container>
          <div className="space-y-10 px-1">
            <div className="aspect-video w-full rounded-[28px] bg-accent-3" />
            <div className="space-y-10">
              <div>
                <div className="text-3xl font-extrabold leading-tight">
                  Не знаете,
                  <br />
                  с чего начать?
                </div>
                <div className="mt-6 text-base leading-relaxed opacity-80">
                  Представьте, что Вам необходимо составить вакансию - опишите именно те требования, которые для Вас
                  важны.
                  <br />
                  <br />
                  Встроенный помощник составит должностную инструкцию, а далее...
                </div>
              </div>

              <div>
                <div className="text-3xl font-extrabold leading-tight">
                  Простые, понятные,
                  <br />
                  бесплатные уроки
                </div>
                <div className="mt-6 text-base leading-relaxed opacity-80">
                  Мы позаботились о том, чтобы Ваш опыт построения ИИ-команды принёс удовольствие.
                  <br />
                  <br />
                  Обучающие материалы и подсказки будут рядом на каждом этапе
                </div>
              </div>

              <div>
                <div className="text-3xl font-extrabold leading-tight">
                  Больше, чем кабинет
                  <br />
                  Это - виртуальный офис
                </div>
                <div className="mt-6 text-base leading-relaxed opacity-80">
                  Управляйте ботами для Telegram, VK и Avito из единого интерфейса.
                  <br />
                  <br />
                  Настраивайте поведение, подключайте базы знаний и анализируйте результаты.
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* DESKTOP stage */}
      <div className="relative hidden md:block h-[260vh]">
        <div className="sticky top-24 h-[calc(100vh-96px)]">
          <Container className="h-full">
            <div className="relative h-full px-1">
              {/* Центральная вставка 16:9 (580px), без бордюров */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="aspect-video w-[580px] rounded-[28px] bg-accent-3" />
              </div>

              {/* ЛЕВЫЙ ТЕКСТ #1 */}
              <motion.div
                className="absolute left-0 top-14 max-w-[360px]"
                style={{ opacity: left1Opacity, x: left1X }}
              >
                <div className="text-4xl font-extrabold leading-[1.05] tracking-tight">
                  Не знаете,
                  <br />
                  с чего начать?
                </div>

                <div className="mt-10 text-lg leading-relaxed opacity-80">
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

              {/* ЛЕВЫЙ ТЕКСТ #3 */}
              <motion.div
                className="absolute left-0 top-14 max-w-[380px]"
                style={{ opacity: left3Opacity, x: left3X }}
              >
                <div className="text-4xl font-extrabold leading-[1.05] tracking-tight">
                  Больше, чем кабинет
                  <br />
                  Это - виртуальный офис
                </div>

                <div className="mt-10 text-lg leading-relaxed opacity-80">
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

              {/* ПРАВЫЙ ТЕКСТ #2 */}
              <motion.div
                className="absolute right-0 top-14 max-w-[420px] text-right"
                style={{ opacity: right2Opacity, x: right2X }}
              >
                <div className="text-4xl font-extrabold leading-[1.05] tracking-tight">
                  Простые, понятные,
                  <br />
                  бесплатные уроки
                </div>

                <div className="mt-10 text-lg leading-relaxed opacity-80">
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

              {/* РАЗДЕЛИТЕЛЬ СПРАВА (по центру вставки) */}
              <motion.div
                className="absolute right-0 top-1/2 h-px w-52 -translate-y-1/2 bg-text/10"
                style={{ opacity: rightDivOpacity, x: rightDivX }}
              />

              {/* РАЗДЕЛИТЕЛЬ СЛЕВА (по центру вставки) */}
              <motion.div
                className="absolute left-0 top-1/2 h-px w-52 -translate-y-1/2 bg-text/10"
                style={{ opacity: leftDivOpacity, x: leftDivX }}
              />
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
