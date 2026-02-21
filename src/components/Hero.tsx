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
  const LOCK_PX = 520; // скорость: меньше = быстрее (попробуй 420–650)
  let touchStartY = 0;

  const lockYRef = { current: null as number | null };

  const setHeaderHidden = (hidden: boolean) => {
    if (hidden) document.documentElement.dataset.headerHidden = "1";
    else delete document.documentElement.dataset.headerHidden;
  };

  const heroActive = () => {
    const el = stageRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    // hero "активен", пока стейдж на экране (с запасом)
    return r.top < window.innerHeight * 0.8 && r.bottom > 0;
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

    if (next > 0) setHeaderHidden(true);
    if (next === 0) setHeaderHidden(false);
  };

  const onWheel = (e: WheelEvent) => {
    const p = progressRaw.get();
    const down = e.deltaY > 0;
    const up = e.deltaY < 0;

    // Лочим, если:
    // 1) прогресс в процессе (0..1)
    // 2) мы в hero и начинаем скроллить вниз при p===0 (старт разворота)
    // 3) мы в hero и скроллим вверх при p===1 (старт сворачивания назад)
    const shouldLock =
      (p > 0 && p < 1) ||
      (heroActive() && p === 0 && down) ||
      (heroActive() && p === 1 && up);

    if (!shouldLock) {
      lockYRef.current = null; // отпускаем якорь, если вышли из режима
      return;
    }

    e.preventDefault();
    consume(e.deltaY);

    // если дошли до края прогресса, отпускать якорь можно,
    // но только когда пользователь продолжит скроллить "в ту же сторону"
    if (progressRaw.get() === 1 && down) lockYRef.current = null;
    if (progressRaw.get() === 0 && up) lockYRef.current = null;
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartY = e.touches[0]?.clientY ?? 0;
  };

  const onTouchMove = (e: TouchEvent) => {
    const p = progressRaw.get();
    const yNow = e.touches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - yNow; // свайп вверх = delta>0 (как scroll down)
    touchStartY = yNow;

    const down = delta > 0;
    const up = delta < 0;

    const shouldLock =
      (p > 0 && p < 1) ||
      (heroActive() && p === 0 && down) ||
      (heroActive() && p === 1 && up);

    if (!shouldLock) {
      lockYRef.current = null;
      return;
    }

    e.preventDefault();
    consume(delta);

    if (progressRaw.get() === 1 && down) lockYRef.current = null;
    if (progressRaw.get() === 0 && up) lockYRef.current = null;
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
              <div ref={measureRef} className="flex justify-center">
                <motion.div
                  className="border border-text/10 bg-accent-3/70 p-1 will-change-transform"
                  style={{
                    width: BASE_W,
                    borderRadius: rOuter,
                    scale,
                    y,
                    transformOrigin: "center top",
                  }}
                >
                  <motion.div
                    className="aspect-video w-full bg-accent-3"
                    style={{ borderRadius: rInner }}
                  />
                </motion.div>
              </div>
            </div>
          </Container>
        </div>

        {/* низ */}
        <div className="relative">
          {templeVisible && (
            <img
              src={withBasePath("/hero/temple.svg")}
              alt=""
              aria-hidden="true"
              onError={() => setTempleVisible(false)}
              className="pointer-events-none select-none absolute bottom-0 right-1/2 z-10 h-auto w-[980px] max-w-none -translate-x-[30%]"
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
                          <div className="text-lg font-normal leading-none opacity-40">наш telegram</div>
                          <div className="mt-3 text-3xl font-normal leading-none">@uni_smb</div>
                        </div>

                        <div className="flex-1 flex items-center">
                          <div className="h-px w-full bg-text/10" />
                        </div>

                        <div>
                          <div className="text-lg font-normal leading-none opacity-40">email для связи</div>
                          <div className="mt-3 text-3xl font-normal leading-none">uni.kit@mail.ru</div>
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
                      <div className="flex items-end gap-4">
                        <span className="inline-flex h-16 min-w-24 items-center justify-center rounded-xl bg-white px-6 text-3xl font-normal">
                          道
                        </span>
                        <span className="inline-flex h-16 min-w-24 items-center justify-center rounded-xl bg-white px-6 text-3xl font-normal">
                          改善
                        </span>

                        <span className="text-lg font-normal leading-tight opacity-50">
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

                {/* пространство для дальнейшего скролла после того, как “лок” отпустит */}
                <div className="h-[110vh]" />
              </div>
            </Container>
          </div>
        </div>
      </div>
    </section>
  );
}
