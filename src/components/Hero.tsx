"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/Container";

const WORDS = ["ИИ-агентов","отдела продаж","тех-поддержки","администраторов","мечты"] as const;

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 4000);
    return () => clearInterval(t);
  }, []);
  const word = WORDS[i];

  return (
    <span className="relative inline-block align-baseline min-w-[14ch]">
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="inline-block will-change-transform"
          initial={{ opacity: 0, filter: "blur(8px)", clipPath: "inset(0 100% 0 0)" }}
          animate={{ opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }}
          exit={{ opacity: 0, filter: "blur(8px)", clipPath: "inset(0 0% 0 100%)" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const stageRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });

  // рост: ширина и лёгкий подъём, чтобы ощущалось как “становится секцией”
  const w = useTransform(scrollYProgress, [0, 1], ["520px", "100%"]);
  const y = useTransform(scrollYProgress, [0, 1], [96, 0]); // 96px = кратно 4
  const r = useTransform(scrollYProgress, [0, 1], [28, 20]);

  return (
    <section id="hero" className="relative">
      <Container className="relative pt-20 md:pt-24">
        {/* японская фраза справа */}
        <div className="pointer-events-none absolute right-0 top-20 hidden lg:block">
          <div className="jp-vertical text-[120px] font-normal leading-none opacity-90">
            精益生產
          </div>
        </div>

        {/* заголовок */}
        <h1 className="text-focus-in max-w-[980px] text-[56px] font-extrabold leading-[0.98] md:text-[72px] lg:text-[80px]">
          Кабинет твоей
          <br />
          <span className="text-accent-1">команды</span>{" "}
          <RotatingWord />
        </h1>
      </Container>

      {/* stage: sticky media + контент, который едет под него */}
      <div ref={stageRef} className="relative mt-10">
        {/* sticky media */}
        <div className="sticky top-24 z-30">
          <Container className="flex justify-center">
            <motion.div
              style={{ width: w, y, ["--r" as any]: r }}
              className="w-full max-w-full border border-text/10 bg-accent-3/80 p-1 shadow-[0_16px_48px_rgba(38,41,46,0.10)] rounded-[var(--r)]"
            >
              <div className="aspect-video w-full bg-accent-3 rounded-[calc(var(--r)-4px)]" />
            </motion.div>
          </Container>
        </div>

        {/* горизонтальный разделитель между 16:9 и нижней частью */}
        <div className="mt-12 border-t border-text/10" />

        {/* нижняя часть (она поедет под sticky media, т.к. внутри stage и z ниже) */}
        <div className="relative z-0">
          <Container className="py-10 md:py-12">
            <div className="relative md:grid md:grid-cols-2 md:gap-0">
              {/* вертикальный разделитель по центру */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-text/10" />

              {/* LEFT: место под рисунок + контакты (контакты НЕ липнут к левому краю) */}
              <div className="md:pr-10">
                <div className="grid grid-cols-12 gap-6">
                  {/* зона под SVG/PNG рисунок */}
                  <div className="col-span-12 md:col-span-7">
                    <div className="h-40 md:h-56 lg:h-64">
                      {/* сюда вставишь SVG/PNG */}
                      {/* <img src="/hero/temple.svg" className="h-full w-full object-contain" alt="" /> */}
                    </div>
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

                {/* плашки + подпись слева, CTA справа, на одной линии */}
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

            {/* даём stage запас по высоте, чтобы рост вставки реально “жил” и перекрывал низ */}
            <div className="h-96 md:h-[28rem]" />
          </Container>
        </div>
      </div>
    </section>
  );
}
