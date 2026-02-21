"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const WORDS = ["ИИ-агентов", "отдела продаж", "тех-поддержки", "администраторов", "мечты"] as const;

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
  // pinned stage
  const stageRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const [endScale, setEndScale] = useState(1);
  const [templeVisible, setTempleVisible] = useState(true);

  // global scroll (for header direction)
  const { scrollY } = useScroll();

  // local progress inside stage (for scaling timeline)
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });

  // базовая ширина "контентной" части карточки
  const BASE_W = 420;

  // ВНЕШНИЕ габариты карточки учитывают padding и border:
  // wrapper: p-1 (4px*2) + border (1px*2) => +10px к ширине
  const FRAME_PAD = 4;
  const FRAME_BORDER = 1;
  const BASE_OUTER_W = BASE_W + 2 * (FRAME_PAD + FRAME_BORDER);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const cw = el.getBoundingClientRect().width;
      // хотим, чтобы ВНЕШНЯЯ ширина карточки в max совпала с cw
      const target = cw / BASE_OUTER_W;
      setEndScale(Math.max(1, Math.min(4, target)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // таймлайн роста: растём сразу, без “предскролла”
  const GROW_END = 0.78;

  const scale = useTransform(scrollYProgress, [0, GROW_END, 1], [1, endScale, endScale]);
  const y = useTransform(scrollYProgress, [0, GROW_END, 1], [0, -48, -48]); // кратно 4

  // радиусы уменьшаются по мере роста
  const rOuter = useTransform(scrollYProgress, [0, GROW_END, 1], [28, 20, 20]);
  const rInner = useTransform(rOuter, (v) => Math.max(0, v - 4));

  // header: вниз -> скрыть, вверх -> показать
  const lastY = useRef(0);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastY.current;
    lastY.current = latest;

    const dy = latest - prev;

    // всегда показываем у самого верха страницы
    if (latest <= 2) {
      document.documentElement.dataset.headerHidden = "0";
      return;
    }

    if (dy < 0) {
      // вверх
      document.documentElement.dataset.headerHidden = "0";
      return;
    }

    if (dy > 0) {
      // вниз
      document.documentElement.dataset.headerHidden = "1";
    }
  });

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.headerHidden;
    };
  }, []);

  const topPad = useMemo(() => "pt-4 md:pt-8 lg:pt-10", []);

  return (
    <section id="hero" className="relative overflow-x-clip">
      {/* ВАЖНО: stage высокий, внутри sticky. Пока идёт рост, “сцена” не едет. */}
      <div ref={stageRef} className="relative h-[260vh]">
        <div className="sticky top-0 h-[100svh]">
          {/* ХРАМ: вне Container, режется вьюпортом (overflow-x-clip у section) */}
          {templeVisible && (
            <img
              src={withBasePath("/hero/temple.svg")}
              alt=""
              aria-hidden="true"
              onError={() => setTempleVisible(false)}
              className="pointer-events-none select-none absolute bottom-0 right-1/2 z-10 h-auto w-[980px] max-w-none -translate-x-[30%]"
            />
          )}

          <div className="relative z-20 h-full">
            <Container className={`relative h-full ${topPad}`}>
              {/* measureRef должен совпадать с шириной “контейнера страницы” */}
              <div ref={measureRef} className="relative h-full px-1 flex flex-col">
                {/* японский вертикальный текст */}
                <div className="pointer-events-none absolute right-1 top-8 hidden lg:block">
                  <div className="jp-vertical text-[120px] font-normal leading-none opacity-90">
                    精益生產
                  </div>
                </div>

                {/* заголовок */}
                <h1 className="text-focus-in max-w-[1416px] font-extrabold leading-[0.98] tracking-tight text-[44px] md:text-[60px] lg:text-[72px]">
                  <span className="block">Кабинет твоей</span>
                  <span className="block whitespace-nowrap">
                    <span className="text-accent-1">команды</span>{" "}
                    <span className="inline-block align-baseline">
                      <RotatingWord />
                    </span>
                  </span>
                </h1>

                {/* 16:9 карточка */}
                <div className="mt-10 md:mt-12 flex justify-center">
                  <motion.div
                    className="bg-accent-3/70 p-1 will-change-transform"
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

                {/* низ pinned-сцены */}
                <div className="mt-auto pb-8 md:pb-12">
                  <div className="relative">
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-text/10" />

                    <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:items-stretch">
                      {/* LEFT */}
                      <div className="relative md:pr-10">
                        <div className="grid grid-cols-12 gap-6">
                          <div className="hidden md:block md:col-span-7" />

                          <div className="col-span-12 md:col-span-5 flex h-full flex-col">
                            <div className="pt-2">
                              <div className="text-lg font-normal leading-none opacity-40">
                                наш telegram
                              </div>
                              <div className="mt-3 text-3xl font-normal leading-none">@uni_smb</div>
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

                      {/* RIGHT */}
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
                  </div>
                </div>
                {/* /низ */}
              </div>
            </Container>
          </div>
        </div>
      </div>
    </section>
  );
}

