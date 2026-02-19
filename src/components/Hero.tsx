"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/Container";

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
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
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

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });

  // Базовый (маленький) размер как в макете
  const BASE_W = 520; // px

  // Считаем конечный scale от ширины контейнера (как у only.digital: рост через transform)
  const [endScale, setEndScale] = useState(1);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const cw = el.getBoundingClientRect().width;
      // небольшой воздух по краям, чтобы было “дороже”
      const target = (cw * 0.94) / BASE_W;
      setEndScale(Math.max(1, Math.min(3, target)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Рост + лёгкий подъём (перекрытие низа)
  const scale = useTransform(scrollYProgress, [0, 1], [1, endScale]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -64]); // кратно 4

  // Радиусы: аккуратно уменьшаем на росте
  const rOuter = useTransform(scrollYProgress, [0, 1], [28, 20]);
  const rInner = useTransform(rOuter, (v) => Math.max(0, v - 4)); // inset = 4 (p-1)

  return (
    <section id="hero" className="relative">
      <Container className="relative pt-10 md:pt-12 lg:pt-14">
        {/* Японская фраза справа */}
        <div className="pointer-events-none absolute right-0 top-20 hidden lg:block">
          <div className="jp-vertical text-[120px] font-normal leading-none opacity-90">
            精益生產
          </div>
        </div>

        {/* Заголовок: строго 2 строки */}
        <h1 className="text-focus-in max-w-[1200px] font-extrabold leading-[0.98] tracking-tight text-[44px] md:text-[60px] lg:text-[72px]">
          <span className="block">Кабинет твоей</span>
          <span className="block whitespace-nowrap">
            <span className="text-accent-1">команды</span>{" "}
            <span className="inline-block align-baseline text-[0.92em] md:text-[0.90em]">
              <RotatingWord />
            </span>
          </span>
        </h1>
      </Container>

      {/* stage: sticky media + нижний контент (будет “заезжать” под вставку за счёт scale) */}
      <div ref={stageRef} className="relative mt-10">
        <div className="sticky top-24 z-40">
          <Container>
            <div ref={measureRef} className="flex justify-center">
              <motion.div
                className="border border-text/10 bg-accent-3/80 p-1 shadow-[0_16px_48px_rgba(38,41,46,0.10)] will-change-transform"
                style={{
                  width: BASE_W,
                  borderRadius: rOuter,
                  scale,
                  y,
                }}
              >
                <motion.div
                  className="aspect-video w-full bg-accent-3"
                  style={{ borderRadius: rInner }}
                />
              </motion.div>
            </div>
          </Container>
        </div>

        {/* Горизонтальный разделитель (между 16:9 и нижней частью) */}
        <div className="mt-12 border-t border-text/10" />

        {/* Нижняя часть */}
        <div className="relative z-10">
          <Container className="py-10 md:py-12">
            <div className="relative md:grid md:grid-cols-2 md:gap-0">
              {/* вертикальный разделитель строго по центру */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-text/10" />

              {/* LEFT */}
              <div className="md:pr-10">
                <div className="grid grid-cols-12 gap-6">
                  {/* зона под SVG/PNG (чтобы контакты не липли к левой границе) */}
                  <div className="col-span-12 md:col-span-7">
                    <div className="h-40 md:h-56 lg:h-64 rounded-lg border border-text/10 bg-accent-3/40" />
                  </div>

                  {/* контакты */}
                  <div className="col-span-12 md:col-span-5">
                    <div className="text-base opacity-40">наш telegram</div>
                    <div className="mt-2 text-base">@uni_smb</div>

                    <div className="my-6 h-px w-full bg-text/10" />

                    <div className="text-base opacity-40">email для связи</div>
                    <div className="mt-2 text-base">uni.kit@mail.ru</div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="mt-10 md:mt-0 md:pl-10">
                <div className="text-base leading-relaxed">
                  ЮНИ.ai – интегратор ИИ-решений
                  <br />
                  в бизнес полного цикла. Строим решения,
                  <br />
                  основанные на ответственности перед
                  <br />
                  бизнесом и его клиентами.
                </div>

                <div className="mt-8 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md border border-text/10 bg-accent-3/80 px-3 py-2 text-sm font-normal">
                      道
                    </span>
                    <span className="rounded-md border border-text/10 bg-accent-3/80 px-3 py-2 text-sm font-normal">
                      改善
                    </span>

                    <span className="text-sm opacity-50 leading-tight">
                      наши продукты
                      <br />
                      японского качества
                    </span>
                  </div>

                  <a
                    href="#cta"
                    className="rounded-full bg-accent-1 px-8 py-3 text-sm font-semibold text-bg hover:bg-accent-1/90"
                  >
                    приступим
                  </a>
                </div>
              </div>
            </div>

            {/* запас по высоте, чтобы рост реально “проигрался” и перекрытие было заметным */}
            <div className="h-[120vh]" />
          </Container>
        </div>
      </div>
    </section>
  );
}
