"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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
  const stageRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const [endScale, setEndScale] = useState(1);
  const [templeVisible, setTempleVisible] = useState(true);

  // ВАЖНО: stageRef теперь включает ВСЁ (TOP + 16:9 + низ).
  // Поэтому анимация стартует сразу, без “первого сдвига страницы”.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });

  // базовая “маленькая” карточка
  const BASE_W = 420;

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const cw = el.getBoundingClientRect().width;

      // Максимум = упереться в ширину контейнера (без запасов 0.96).
      // Если хочется микрозазор, можно поставить 0.995.
      const target = (cw * 1.0) / BASE_W;

      // верхний clamp на всякий случай, чтобы не улетело на ультрашироких
      setEndScale(Math.max(1, Math.min(8, target)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Масштаб и лёгкий подъём (можно убрать y, если не нужно смещение)
  const scale = useTransform(scrollYProgress, [0, 1], [1, endScale]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -64]);

  // Динамическое уменьшение радиуса по мере увеличения
  const rOuter = useTransform(scrollYProgress, [0, 1], [28, 16]);
  const rInner = useTransform(rOuter, (v) => Math.max(0, v - 4));

  // Длина “пин-сцены”. Чем больше endScale, тем больше даём “ход” скроллу,
  // чтобы анимация не была резкой.
  const stageHeight = useMemo(() => {
    const extraVh = Math.max(90, Math.min(160, Math.round((endScale - 1) * 30)));
    return `calc(100svh + ${extraVh}svh)`;
  }, [endScale]);

  const topPad = useMemo(() => "pt-4 md:pt-8 lg:pt-10", []);

  return (
    <section id="hero" className="relative overflow-x-clip">
      <div ref={stageRef} className="relative" style={{ height: stageHeight }}>
        <div className="sticky top-0 h-[100svh]">
          {/* TOP (внутри sticky сцены) */}
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

          {/* 16:9 (тоже внутри sticky сцены) */}
          <div className="relative mt-12 z-30">
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

          {/* НИЗ: закрепляем как “нижнюю композицию” внутри этой же сцены */}
          <div className="absolute inset-x-0 bottom-0 z-20">
            {/* ХРАМ: вне Container, режется вьюпортом (section overflow-x-clip) */}
            {templeVisible && (
              <img
                src={withBasePath("/hero/temple.svg")}
                alt=""
                aria-hidden="true"
                onError={() => setTempleVisible(false)}
                className="pointer-events-none select-none absolute bottom-0 right-1/2 z-10 h-auto w-[980px] max-w-none -translate-x-[30%]"
              />
            )}

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
                        {/* плашки: чистый белый, без бордеров, rounded-xl */}
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

                      {/* кнопка: rounded-2xl */}
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
      </div>
    </section>
  );
}
