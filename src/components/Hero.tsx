"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
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

  const BASE_W = 420;

  const progressRaw = useMotionValue(0);
  const progress = useSpring(progressRaw, { stiffness: 260, damping: 38, mass: 0.7 });

  const scale = useTransform(progress, [0, 1], [1, endScale]);

  // УБРАЛ y-смещение: чтобы рост был равномерным без “уезда”
  const y = useTransform(progress, [0, 1], [0, 0]);

  // радиусы уменьшаем по мере роста
  const rOuter = useTransform(progress, [0, 1], [28, 14]);

  const topPad = useMemo(() => "pt-4 md:pt-8 lg:pt-10", []);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const cw = el.getBoundingClientRect().width;
      const target = cw / BASE_W; // упираемся в границы контейнера
      setEndScale(Math.max(1, target));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const LOCK_PX = 760;
    const lockYRef = { current: null as number | null };
    let touchStartY = 0;

    const setHeaderHidden = (hidden: boolean) => {
      if (hidden) document.documentElement.dataset.headerHidden = "1";
      else delete document.documentElement.dataset.headerHidden;
    };

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

    const consume = (deltaY: number) => {
      const p = progressRaw.get();
      const next = clamp(p + deltaY / LOCK_PX, 0, 1);
      progressRaw.set(next);

      ensureLocked();

      if (deltaY > 0 && next > 0) setHeaderHidden(true);
      if (deltaY < 0) setHeaderHidden(false);
      if (next === 0) setHeaderHidden(false);
    };

    const onWheel = (e: WheelEvent) => {
      const p = progressRaw.get();
      const down = e.deltaY > 0;
      const up = e.deltaY < 0;

      if (p === 1 && down) {
        lockYRef.current = null;
        return;
      }
      if (p === 0 && up) {
        lockYRef.current = null;
        setHeaderHidden(false);
        return;
      }

      const shouldLock = (p > 0 && p < 1) || heroActive();
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
      const p = progressRaw.get();
      const yNow = e.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - yNow;
      touchStartY = yNow;

      const down = delta > 0;
      const up = delta < 0;

      if (p === 1 && down) {
        lockYRef.current = null;
        return;
      }
      if (p === 0 && up) {
        lockYRef.current = null;
        setHeaderHidden(false);
        return;
      }

      const shouldLock = (p > 0 && p < 1) || heroActive();
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
  }, [progressRaw]);

  return (
    <section id="hero" className="relative overflow-x-clip">
      {/* TOP */}
      <Container className={`relative ${topPad}`}>
        <div className="relative px-1">
          <div className="pointer-events-none absolute right-0 top-8 hidden lg:block">
            <div className="jp-vertical text-[120px] font-normal leading-none opacity-90">
              精益生產
            </div>
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

      {/* STAGE */}
      <div ref={stageRef} className="relative mt-12">
        {/* 16:9 */}
        <div className="sticky top-24 z-40">
          <Container>
            <div className="px-1">
              <div ref={measureRef} className="w-full">
                <div className="flex justify-center">
                  {/* УБРАЛ фон/бордер/паддинг. Оставил чистую “вставку”. */}
                  <motion.div
                    className="will-change-transform overflow-hidden bg-accent-3"
                    style={{
                      width: BASE_W,
                      borderRadius: rOuter,
                      scale,
                      y,
                      transformOrigin: "center center", // ключ: рост равномерно во все стороны
                    }}
                  >
                    <div className="aspect-video w-full" />
                  </motion.div>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* НИЗ: храм должен быть привязан к низу композиции, НЕ к спейсеру */}
        <div className="relative">
          {templeVisible && (
            <img
              src={withBasePath("/hero/temple.svg")}
              alt=""
              aria-hidden="true"
              onError={() => setTempleVisible(false)}
              className="pointer-events-none select-none absolute bottom-0 right-1/2 z-10 h-auto w-[720px] max-w-none -translate-x-[30%]"
            />
          )}

          <div className="relative z-20">
            <Container className="py-10 md:py-12">
              <div className="relative px-1">
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-text/10" />

                <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:items-stretch">
                  {/* LEFT HALF */}
                  <div className="relative md:pr-10">
                    <div className="relative z-10 grid h-full grid-cols-12 gap-6">
                      <div className="hidden md:block md:col-span-7" />

                      <div className="col-span-12 md:col-span-5 relative z-20 flex h-full flex-col">
                        <div className="pt-2">
                          <div className="text-lg font-normal leading-none opacity-40">
                            наш telegram
                          </div>
                          <div className="mt-3 text-3xl font-normal leading-none">
                            @uni_smb
                          </div>
                        </div>

                        <div className="flex-1 flex items-center">
                          <div className="h-px w-full bg-text/10" />
                        </div>

                        <div>
                          <div className="text-lg font-normal leading-none opacity-40">
                            email для связи
                          </div>
                          <div className="mt-3 text-3xl font-normal leading-none">
                            uni.kit@mail.ru
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT HALF */}
                  <div className="md:pl-10 flex h-full flex-col">
                    <div className="text-lg leading-snug md:text-lg">
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
                        <span className="inline-flex h-16 min-w-24 items-center justify-center rounded-xl bg-white px-6 text-3xl font-normal">
                          道
                        </span>
                        <span className="inline-flex h-16 min-w-24 items-center justify-center rounded-xl bg-white px-6 text-3xl font-normal">
                          改善
                        </span>

                        <span className="text-lg font-normal leading-none opacity-50">
                          наши продукты
                          <br />
                          японского качества
                        </span>
                      </div>

                      <a
                        href="#cta"
                        className="rounded-2xl bg-accent-1 px-10 py-4 text-base font-semibold text-bg hover:bg-accent-1/90"
                      >
                        приступим
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </div>

        {/* Спейсер вынесен отдельно: больше не двигает “нижнюю границу” для храма */}
        <div className="h-[32vh] md:h-[44vh]" />
      </div>
    </section>
  );
}
