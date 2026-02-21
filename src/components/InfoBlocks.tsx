"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/Container";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function InfoBlocks() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const sectionTopRef = useRef(0);

  // 0..2 (три состояния)
  const pRaw = useMotionValue(0);
  const p = useSpring(pRaw, { stiffness: 260, damping: 38, mass: 0.7 });

  // 1) Текст слева (карточка №1) уезжает влево к p=1
  const left1X = useTransform(p, [0, 0.9, 1], [0, -120, -160]);
  const left1O = useTransform(p, [0, 0.75, 1], [1, 1, 0]);

  // 2) Разделитель справа (для карточки №1/№3) исчезает к p=1 и возвращается после p~1.2
  const rightLineX = useTransform(p, [0, 0.85, 1, 1.2, 2], [0, 0, 80, 0, 0]);
  const rightLineO = useTransform(p, [0, 0.85, 1, 1.2, 2], [1, 1, 0, 1, 1]);

  // 3) Разделитель слева появляется на p=1 и пропадает к p=2
  const leftLineX = useTransform(p, [0, 0.85, 1, 1.15, 2], [-80, -80, 0, 0, -80]);
  const leftLineO = useTransform(p, [0, 0.85, 1, 1.15, 2], [0, 0, 1, 1, 0]);

  // 4) Текст справа (карточка №2) появляется на p=1, исчезает к p=2
  const right2X = useTransform(p, [0, 0.85, 1, 1.15, 2], [160, 160, 0, 0, 160]);
  const right2O = useTransform(p, [0, 0.85, 1, 1.15, 2], [0, 0, 1, 1, 0]);

  // 5) Текст слева (карточка №3) появляется после p~1.2
  const left3X = useTransform(p, [0, 1, 1.2, 2], [-160, -160, 0, 0]);
  const left3O = useTransform(p, [0, 1, 1.2, 2], [0, 0, 1, 1]);

  useLayoutEffect(() => {
    const calc = () => {
      const el = sectionRef.current;
      if (!el) return;
      sectionTopRef.current = el.getBoundingClientRect().top + window.scrollY;
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    // на мобильных лучше не лочить, там свайпы + браузерная прокрутка
    const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop()) return;

    const LOCK_PX = 1100; // “длина” скролла на всю секцию (0..2)
    const lockYRef = { current: null as number | null };
    let touchStartY = 0;

    const active = () => {
      const el = sectionRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      // начинаем “перехват” когда секция уже на экране и близко к верху
      return r.top <= 120 && r.bottom >= window.innerHeight * 0.6;
    };

    const ensureLocked = () => {
      if (lockYRef.current == null) lockYRef.current = sectionTopRef.current;
      window.scrollTo({ top: lockYRef.current });
    };

    const consume = (deltaY: number) => {
      const cur = pRaw.get();
      const next = clamp(cur + (deltaY / LOCK_PX) * 2, 0, 2);
      pRaw.set(next);
      ensureLocked();
    };

    const onWheel = (e: WheelEvent) => {
      const cur = pRaw.get();
      const down = e.deltaY > 0;
      const up = e.deltaY < 0;

      // отпускаем наружу только на границах
      if (cur === 2 && down) {
        lockYRef.current = null;
        return;
      }
      if (cur === 0 && up) {
        lockYRef.current = null;
        return;
      }

      const shouldLock = (cur > 0 && cur < 2) || active();
      if (!shouldLock) {
        lockYRef.current = null;
        return;
      }

      e.preventDefault();
      consume(e.deltaY);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const cur = pRaw.get();
      const yNow = e.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - yNow;
      touchStartY = yNow;

      const down = delta > 0;
      const up = delta < 0;

      if (cur === 2 && down) {
        lockYRef.current = null;
        return;
      }
      if (cur === 0 && up) {
        lockYRef.current = null;
        return;
      }

      const shouldLock = (cur > 0 && cur < 2) || active();
      if (!shouldLock) {
        lockYRef.current = null;
        return;
      }

      e.preventDefault();
      consume(delta);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("touchstart", onTouchStart as any);
      window.removeEventListener("touchmove", onTouchMove as any);
    };
  }, [pRaw]);

  // Вставка по ТЗ
  const INSERT_W = 580;
  const INSERT_H = 326.25; // 580 * 9/16

  return (
    <section id="info" ref={sectionRef} className="relative overflow-x-clip">
      <Container className="pt-12 md:pt-14 pb-14">
        {/* ВАЖНО: без лишних px-1, чтобы совпадали отступы контейнера */}
        <div className="grid items-start gap-10 md:grid-cols-[minmax(320px,420px)_minmax(0,1fr)_580px_minmax(0,1fr)_minmax(320px,420px)]">
          {/* LEFT TEXT SLOT */}
          <div className="relative">
            {/* Блок 1 */}
            <motion.div style={{ x: left1X, opacity: left1O }} className="absolute inset-0">
              <h2 className="font-extrabold tracking-tight leading-[0.92] text-[54px] md:text-[64px]">
                Не знаете,
                <br />
                с чего начать?
              </h2>

              <div className="mt-10 space-y-8 text-[22px] leading-snug opacity-70">
                <p>
                  Представьте, что Вам
                  <br />
                  необходимо составить
                  <br />
                  вакансию - опишите
                  <br />
                  именно те требования,
                  <br />
                  которые для Вас важны.
                </p>
                <p>
                  Встроенный помощник
                  <br />
                  составит должностную
                  <br />
                  инструкцию, а далее...
                </p>
              </div>
            </motion.div>

            {/* Блок 3 */}
            <motion.div style={{ x: left3X, opacity: left3O }} className="absolute inset-0">
              <h2 className="font-extrabold tracking-tight leading-[0.92] text-[54px] md:text-[64px]">
                Больше, чем кабинет
                <br />
                Это - виртуальный офис
              </h2>

              <div className="mt-10 space-y-8 text-[22px] leading-snug opacity-70">
                <p>
                  Управляйте ботами для
                  <br />
                  Telegram, VK и Avito из
                  <br />
                  единого интерфейса.
                </p>
                <p>
                  Настраивайте поведение,
                  <br />
                  подключайте базы знаний
                  <br />
                  и анализируйте результаты.
                </p>
              </div>
            </motion.div>

            {/* чтобы колонка не схлопнулась из-за absolute */}
            <div className="invisible">
              <h2 className="font-extrabold tracking-tight leading-[0.92] text-[54px] md:text-[64px]">
                Не знаете,
                <br />
                с чего начать?
              </h2>
              <div className="mt-10 text-[22px] leading-snug">.</div>
            </div>
          </div>

          {/* LEFT DIVIDER SLOT (между левым текстом и вставкой) */}
          <div className="hidden md:flex" style={{ height: INSERT_H }}>
            <motion.div
              style={{ x: leftLineX, opacity: leftLineO }}
              className="w-full self-center"
            >
              <div className="h-px w-full bg-text/10" />
            </motion.div>
          </div>

          {/* CENTER INSERT */}
          <div className="flex justify-center">
            <div
              className="w-[580px] max-w-full overflow-hidden bg-accent-3"
              style={{ borderRadius: 44 }}
            >
              <div className="aspect-video w-full" />
            </div>
          </div>

          {/* RIGHT DIVIDER SLOT (между вставкой и правым текстом) */}
          <div className="hidden md:flex" style={{ height: INSERT_H }}>
            <motion.div
              style={{ x: rightLineX, opacity: rightLineO }}
              className="w-full self-center"
            >
              <div className="h-px w-full bg-text/10" />
            </motion.div>
          </div>

          {/* RIGHT TEXT SLOT (карточка №2) */}
          <div className="relative hidden md:block">
            <motion.div style={{ x: right2X, opacity: right2O }}>
              <h2 className="font-extrabold tracking-tight leading-[0.92] text-[54px] md:text-[64px]">
                Простые, понятные,
                <br />
                бесплатные уроки
              </h2>

              <div className="mt-10 space-y-7 text-[22px] leading-snug opacity-70">
                <p>
                  Мы позаботились о том,
                  <br />
                  чтобы Ваш опыт построения
                  <br />
                  ИИ-команды принёс
                  <br />
                  удовольствие.
                </p>
                <p>
                  Обучающие материалы
                  <br />
                  и подсказки будут рядом
                  <br />
                  на каждом этапе
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Мобилка: просто статикой (чтобы не ломать UX) */}
        <div className="mt-10 space-y-12 md:hidden">
          <div className="space-y-5">
            <div className="w-full overflow-hidden bg-accent-3" style={{ borderRadius: 36 }}>
              <div className="aspect-video w-full" />
            </div>
            <div className="text-3xl font-extrabold leading-tight">
              Не знаете,
              <br />
              с чего начать?
            </div>
            <div className="text-base opacity-70 leading-relaxed">
              Представьте, что Вам необходимо составить вакансию - опишите именно те требования,
              которые для Вас важны. Встроенный помощник составит должностную инструкцию, а далее...
            </div>
          </div>

          <div className="space-y-5">
            <div className="w-full overflow-hidden bg-accent-3" style={{ borderRadius: 36 }}>
              <div className="aspect-video w-full" />
            </div>
            <div className="text-3xl font-extrabold leading-tight">
              Простые, понятные,
              <br />
              бесплатные уроки
            </div>
            <div className="text-base opacity-70 leading-relaxed">
              Мы позаботились о том, чтобы Ваш опыт построения ИИ-команды принёс удовольствие.
              Обучающие материалы и подсказки будут рядом на каждом этапе.
            </div>
          </div>

          <div className="space-y-5">
            <div className="w-full overflow-hidden bg-accent-3" style={{ borderRadius: 36 }}>
              <div className="aspect-video w-full" />
            </div>
            <div className="text-3xl font-extrabold leading-tight">
              Больше, чем кабинет
              <br />
              Это - виртуальный офис
            </div>
            <div className="text-base opacity-70 leading-relaxed">
              Управляйте ботами для Telegram, VK и Avito из единого интерфейса. Настраивайте
              поведение, подключайте базы знаний и анализируйте результаты.
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
