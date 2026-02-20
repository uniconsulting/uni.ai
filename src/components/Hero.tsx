"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const WORDS = ["ИИ-агентов", "отдела продаж", "тех-поддержки", "администраторов", "мечты"] as const;
const WORD_CYCLE_MS = 4000;

function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), WORD_CYCLE_MS);
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

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });

  // маленькая карточка как в макете
  const BASE_W = 420;

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const cw = el.getBoundingClientRect().width;
      const target = (cw * 0.96) / BASE_W;
      setEndScale(Math.max(1, Math.min(3, target)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // рост начинается не сразу, дальше масштабируем и даем чуть "вниз",
  // чтобы при росте карточка перекрывала нижнюю композицию (как only.digital)
  const scale = useTransform(scrollYProgress, [0, 0.18, 1], [1, 1, endScale]);
  const y = useTransform(scrollYProgress, [0, 0.18, 1], [0, 0, 24]);

  const rOuter = useTransform(scrollYProgress, [0, 0.65, 1], [28, 24, 20]);
  const rInner = useTransform(rOuter, (v) => Math.max(0, v - 4));

  const topPad = useMemo(() => "pt-4 md:pt-8 lg:pt-10", []);

  return (
    <section id="hero" className="relative">
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
        <div className="sticky top-24 z-50">
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
        <div className="relative z-10">
          <Container className="py-10 md:py-12">
            <div className="relative px-1">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-text/10" />

              <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:items-stretch">
                {/* LEFT HALF */}
                <div className="relative md:pr-10">
                  <div className="grid h-full grid-cols-12 gap-6">
                    {/* храм: больше, смещен влево, строго клипается в своей колонке */}
                    <div className="col-span-12 md:col-span-7">
                      <div className="relative h-full min-h-48 md:min-h-56 lg:min-h-64 overflow-hidden">
                        {templeVisible ? (
                          <img
                            src={withBasePath("/hero/temple.svg")}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none select-none absolute bottom-0 left-0 h-auto w-[760px] lg:w-[860px] max-w-none -translate-x-16"
                            onError={() => setTempleVisible(false)}
                          />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                    </div>

                    {/* контакты: email прижат к низу (общая нижняя граница) */}
                    <div className="col-span-12 md:col-span-5 flex h-full flex-col">
                      <div className="pt-2">
                        <div className="text-lg font-normal leading-none opacity-40">
                          наш telegram
                        </div>
                        <div className="mt-3 text-3xl font-normal leading-none">@uni_smb</div>

                        <div className="my-8 h-px w-full bg-text/10" />
                      </div>

                      <div className="mt-auto">
                        <div className="text-lg font-normal leading-none opacity-40">
                          email для связи
                        </div>
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

                  {/* низ: плашки + подпись + CTA на одной "посадочной линии" */}
                  <div className="mt-auto pt-10 flex items-end justify-between gap-8">
                    <div className="flex items-end gap-4">
                      {/* плашки: без бордюра, с читаемым скруглением */}
                      <span className="inline-flex h-16 min-w-24 items-center justify-center rounded-[28px] bg-white/70 px-6 text-3xl font-normal shadow-[0_10px_28px_rgba(38,41,46,0.06)]">
                        道
                      </span>
                      <span className="inline-flex h-16 min-w-24 items-center justify-center rounded-[28px] bg-white/70 px-6 text-3xl font-normal shadow-[0_10px_28px_rgba(38,41,46,0.06)]">
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
                      className="rounded-full bg-accent-1 px-10 py-4 text-base font-semibold text-bg hover:bg-accent-1/90"
                    >
                      приступим
                    </a>
                  </div>
                </div>
              </div>

              {/* пространство, чтобы рост 16:9 “проигрался” и перекрыл нижний блок при скролле */}
              <div className="h-[110vh]" />
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
