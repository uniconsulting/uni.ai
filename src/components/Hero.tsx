/* components/Hero.tsx */
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const WORDS = ["ИИ-агентов", "отдела продаж", "тех-поддержки", "администраторов", "мечты"] as const;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const word = WORDS[i];

  return (
    <span className="relative inline-flex align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="inline-block"
          initial={{ opacity: 0, filter: "blur(10px)", y: 2 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, filter: "blur(10px)", y: -2 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const [endScale, setEndScale] = useState(1);
  const [templeVisible, setTempleVisible] = useState(true);

  // sticky включаем только во время лок-анимации (и при схлопывании),
  // после прыжка на info выключаем, чтобы не было перекрытий
  const [pinEnabled, setPinEnabled] = useState(false);

  const BASE_W = 420;
  const MAX_W = 1080;

  const progressRaw = useMotionValue(0);
  const progress = useSpring(progressRaw, {
    stiffness: 260,
    damping: 38,
    mass: 0.7,
  });

  const scale = useTransform(progress, [0, 1], [1, endScale]);
  const y = useTransform(progress, [0, 1], [0, 0]); // движение по Y запрещено
  const rOuter = useTransform(progress, [0, 1], [28, 14]);

  // blur только внутри hero (кроме вставки)
  const bgBlurPx = useTransform(progress, [0, 1], [0, 12]);
  const bgFilter = useTransform(bgBlurPx, (v) => `blur(${v.toFixed(2)}px)`);
  const bgOpacity = useTransform(progress, [0, 1], [1, 0.75]);

  const topPad = useMemo(() => "pt-4 md:pt-8 lg:pt-10", []);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const cw = el.getBoundingClientRect().width;
      const targetW = Math.min(MAX_W, cw);
      const targetScale = targetW / BASE_W;
      setEndScale(Math.max(1, targetScale));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const LOCK_PX = 760;
    const EPS = 0.001;
    const STICKY_TOP = 96; // top-24

    const lockYRef = { current: null as number | null };
    const pushedToNextRef = { current: false };
    const jumpingRef = { current: false };

    let touchStartY = 0;
    let jumpT: number | null = null;

    const setHeaderHidden = (hidden: boolean) => {
      if (hidden) document.documentElement.dataset.headerHidden = "1";
      else delete document.documentElement.dataset.headerHidden;
    };

    const atPageTop = () => window.scrollY <= 4;

    const heroActive = () => {
      const el = stageRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.85 && r.bottom > 0;
    };

    const ensureLocked = () => {
      if (lockYRef.current == null) lockYRef.current = window.scrollY;
      window.scrollTo({ top: lockYRef.current });
    };

    const unlock = () => {
      lockYRef.current = null;
    };

    const computeTargetH = () => {
      const m = measureRef.current;
      if (!m) return (Math.min(MAX_W, window.innerWidth) * 9) / 16;

      const cw = m.getBoundingClientRect().width;
      const targetW = Math.min(MAX_W, cw);
      return (targetW * 9) / 16;
    };

    const resetHero = () => {
      progressRaw.set(0);
      pushedToNextRef.current = false;
      setHeaderHidden(false);
      setPinEnabled(false);
      unlock();
    };

    // ✅ главное: сбрасываем hero только если реально ушли вниз (scrollY изменился),
    // иначе получаем "микро-сброс" прямо в hero и повторный рост
    const deferResetAfterJump = (targetTop: number) => {
      let tries = 0;

      const tick = () => {
        tries += 1;
        const yNow = window.scrollY;

        // если не сдвинулись с места (остались на самом верху) — НЕ сбрасываем
        const moved = yNow > 8;

        // "долетели" до цели (или почти), и реально ушли вниз
        if (moved && yNow >= targetTop - 2) {
          resetHero();
          return;
        }

        // несколько кадров ждём, пока браузер применит scrollTo
        if (tries < 14) {
          requestAnimationFrame(tick);
          return;
        }

        // fallback: если мы всё же ушли вниз, сбросим; если нет — не трогаем
        if (moved) resetHero();
      };

      requestAnimationFrame(tick);
    };

    const jumpToInfoSafely = () => {
      if (jumpingRef.current) return;

      const next = document.getElementById("info");
      const stage = stageRef.current;
      if (!next || !stage) return;

      jumpingRef.current = true;
      pushedToNextRef.current = true;

      // sticky выключаем заранее, чтобы исключить перекрытия
      setPinEnabled(false);

      const infoAbsTop = next.getBoundingClientRect().top + window.scrollY;
      const stageAbsBottom = stage.getBoundingClientRect().bottom + window.scrollY;

      const targetH = computeTargetH();

      // хотим поставить info под header
      const desired = infoAbsTop - STICKY_TOP;

      // гарантируем, что область sticky уже "пройдена"
      const releaseY = stageAbsBottom - (STICKY_TOP + targetH) + 2;

      const top = Math.max(desired, releaseY);

      unlock();
      setHeaderHidden(false);

      // без smooth: иначе ловим "проезд"
      window.scrollTo({ top, behavior: "auto" });

      // ✅ сброс только после того, как реально улетели вниз
      deferResetAfterJump(top);

      if (jumpT) window.clearTimeout(jumpT);
      jumpT = window.setTimeout(() => {
        jumpingRef.current = false;
      }, 180);
    };

    const consume = (deltaY: number) => {
      const p = progressRaw.get();
      const next = clamp(p + deltaY / LOCK_PX, 0, 1);
      progressRaw.set(next);

      const atStart = next <= EPS;
      const atEnd = next >= 1 - EPS;

      if (deltaY > 0 && next > 0) setHeaderHidden(true);
      if (deltaY < 0) setHeaderHidden(false);
      if (atStart) setHeaderHidden(false);

      // в процессе анимации держим страницу и включаем sticky
      if (!atEnd) {
        setPinEnabled(true);
        ensureLocked();
        pushedToNextRef.current = false;
        return;
      }

      // дошли до конца
      unlock();
      setHeaderHidden(false);

      // если продолжают вниз, уходим к info (один раз)
      if (deltaY > 0 && !pushedToNextRef.current) {
        pushedToNextRef.current = true;
        requestAnimationFrame(jumpToInfoSafely);
      }

      // если пошли вверх от конца, разрешаем схлопывать (sticky нужен)
      if (deltaY < 0) setPinEnabled(true);
    };

    const onWheel = (e: WheelEvent) => {
      const p = progressRaw.get();
      const inAnim = p > EPS && p < 1 - EPS;
      const atStart = p <= EPS;
      const atEnd = p >= 1 - EPS;

      const down = e.deltaY > 0;
      const up = e.deltaY < 0;

      const active = heroActive();
      const top = atPageTop();

      // запуск анимации только с самого верха страницы
      if (!inAnim && !(top && active)) return;

      // если уже на конце и крутят вниз в зоне hero — прыгаем (и блокируем дефолт)
      if (active && atEnd && down) {
        e.preventDefault();
        jumpToInfoSafely();
        return;
      }

      // если в начале и крутят вверх — отдаём странице
      if (active && atStart && up) {
        unlock();
        setHeaderHidden(false);
        return;
      }

      e.preventDefault();
      consume(e.deltaY);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const p = progressRaw.get();
      const inAnim = p > EPS && p < 1 - EPS;
      const atStart = p <= EPS;
      const atEnd = p >= 1 - EPS;

      const yNow = e.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - yNow;
      touchStartY = yNow;

      const down = delta > 0;
      const up = delta < 0;

      const active = heroActive();
      const top = atPageTop();

      if (!inAnim && !(top && active)) return;

      if (active && atEnd && down) {
        e.preventDefault();
        jumpToInfoSafely();
        return;
      }

      if (active && atStart && up) {
        unlock();
        setHeaderHidden(false);
        return;
      }

      e.preventDefault();
      consume(delta);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      if (jumpT) window.clearTimeout(jumpT);
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("touchstart", onTouchStart as any);
      window.removeEventListener("touchmove", onTouchMove as any);
    };
  }, [progressRaw]);

  return (
    <section id="hero" className="relative overflow-x-clip">
      {/* TOP (блюрится) */}
      <motion.div className="relative will-change-[filter]" style={{ filter: bgFilter, opacity: bgOpacity }}>
        <Container className={`relative ${topPad}`}>
          <div className="relative px-1">
            <div className="pointer-events-none absolute right-0 top-8 hidden lg:block">
              <div className="jp-vertical text-[120px] font-normal leading-none hover-accent-2 opacity-90">精益生產</div>
            </div>

            <h1 className="text-focus-in max-w-[1416px] font-extrabold leading-[0.98] tracking-tight text-[44px] md:text-[60px] lg:text-[72px]">
              <span className="block">Кабинет твоей</span>
              <span className="block whitespace-nowrap">
                <span className="text-accent-1">команды</span>{" "}
                <span className="inline-block align-baseline">
                  <RotatingWord />
                </span>
              </span>
            </h1>
          </div>
        </Container>
      </motion.div>

      {/* STAGE */}
      <div ref={stageRef} className="relative mt-12">
        {/* 16:9 (НЕ блюрится) */}
        <div className={pinEnabled ? "sticky top-24 z-40" : "relative z-40"}>
          <Container>
            <div className="px-1">
              <div ref={measureRef} className="w-full">
                <div className="flex justify-center">
                  <motion.div
                    className="will-change-transform overflow-hidden bg-accent-3"
                    style={{
                      width: BASE_W,
                      borderRadius: rOuter,
                      scale,
                      y,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* VIDEO 16:9 */}
                    <div className="aspect-video w-full">
                      <video
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      >
                        <source src={withBasePath("/hero/IMG_6633.mp4")} type="video/mp4" />
                      </video>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* НИЗ (блюрится) */}
        <motion.div className="relative z-20 will-change-[filter]" style={{ filter: bgFilter, opacity: bgOpacity }}>
          <div className="relative">
            {templeVisible && (
              <img
                src={withBasePath("/hero/temple.svg")}
                alt=""
                aria-hidden="true"
                onError={() => setTempleVisible(false)}
                className="pointer-events-none select-none absolute bottom-6 right-1/2 z-10 h-auto w-[720px] max-w-none -translate-x-[50%]"
              />
            )}

            <Container className="py-10 md:py-12">
              <div className="relative px-1">
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-text/10" />

                <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:items-stretch">
                  <div className="relative md:pr-10">
                    <div className="relative z-10 grid h-full grid-cols-12 gap-6">
                      <div className="hidden md:block md:col-span-7" />

                      <div className="col-span-12 md:col-span-5 relative z-20 flex h-full flex-col">
                        <div className="pt-2">
                          <div className="text-lg font-normal leading-none opacity-40 hover-accent-2">наш telegram</div>
                          <div className="mt-3 text-3xl font-normal leading-none hover-accent">@uni_smb</div>
                        </div>

                        <div className="flex-1 flex items-center">
                          <div className="h-px w-full bg-text/10" />
                        </div>

                        <div>
                          <div className="text-lg font-normal leading-none opacity-40 hover-accent-2">email для связи</div>
                          <div className="mt-3 text-3xl font-normal leading-none hover-accent">uni.kit@mail.ru</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:pl-10 flex h-full flex-col">
                    <div className="text-lg leading-snug md:text-lg hover-accent-2">
                      ЮНИ.ai – интегратор ИИ-решений
                      <br />
                      в бизнес полного цикла. Строим решения,
                      <br />
                      основанные на ответственности перед
                      <br />
                      бизнесом и его клиентами.
                    </div>

                    <div className="mt-auto pt-10 flex items-end justify-between gap-8">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex h-14 min-w-24 items-center justify-center rounded-xl bg-accent-3 px-6 text-2xl font-normal hover-accent">
                          道
                        </span>
                        <span className="inline-flex h-14 min-w-24 items-center justify-center rounded-xl bg-accent-3 px-6 text-2xl font-normal hover-accent">
                          改善
                        </span>

                        <span className="text-lg font-normal leading-none opacity-50 hover-accent">
                          наши продукты
                          <br />
                          японского качества
                        </span>
                      </div>

                      <a
                        href="#cta"
                        className="btn-lift-accent1 rounded-xl bg-accent-1 px-10 py-4 text-xl font-semibold text-bg"
                      >
                        приступим
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
