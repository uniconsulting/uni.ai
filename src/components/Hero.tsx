'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Container } from '@/components/Container';
import { innerRadiusPx } from '@/lib/radius';

const WORDS = [
  'ИИ-агентов',
  'отдела продаж',
  'тех-поддержки',
  'администраторов',
  'мечты'
] as const;

function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  const word = WORDS[i];

  return (
    <span className="relative inline-block align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="inline-block"
          initial={{ opacity: 0, filter: 'blur(10px)', clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)' }}
          exit={{ opacity: 0, filter: 'blur(10px)', clipPath: 'inset(0 0% 0 100%)' }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const growRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: growRef,
    offset: ['start start', 'end start']
  });

  // 16:9 вставка: растёт по скроллу как у only.digital (маленькая -> большая)
  const maxW = useTransform(scrollYProgress, [0, 1], ['520px', '1240px']);
  const radius = useTransform(scrollYProgress, [0, 1], [28, 20]); // внешняя
  const inset = 4; // p-1 = 4px (по сетке)
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [0.85, 0.95]);

  const cardStyle = useMemo(
    () => ({
      maxWidth: maxW
    }),
    [maxW]
  );

  return (
    <section id="hero" className="relative">
      {/* верхняя часть */}
      <Container className="relative pt-20 md:pt-24">
        {/* Японская фраза справа */}
        <div className="pointer-events-none absolute right-1 top-20 hidden lg:block">
          <div className="jp-vertical text-[120px] font-normal leading-none opacity-90">
            精益生產
          </div>
        </div>

        <h1 className="text-focus-in max-w-[980px] text-[56px] font-extrabold leading-[0.98] md:text-[72px] lg:text-[80px]">
          Кабинет твоей
          <br />
          <span className="text-accent-1">команды</span>{' '}
          <RotatingWord />
        </h1>
      </Container>

      {/* зона роста 16:9 (внутри hero, но превращается в секцию при скролле) */}
      <div ref={growRef} className="relative mt-10 h-[160vh]">
        <div className="sticky top-24 md:top-28 lg:top-32">
          <Container className="flex justify-center">
            <motion.div
              className="bento-tile p-1 w-full"
              style={{
                ...cardStyle,
                borderRadius: radius,
                background: `color-mix(in oklab, var(--color-accent-3) ${Math.round(
                  (bgOpacity.get?.() ?? 0.9) * 100
                )}%, transparent)`
              }}
            >
              <motion.div
                className="aspect-video w-full bg-accent-3"
                style={{
                  borderRadius: innerRadiusPx(Math.round((radius as any).get?.() ?? 28), inset)
                }}
              />
            </motion.div>
          </Container>
        </div>
      </div>

      {/* нижняя часть */}
      <div className="border-t border-text/10">
        <Container className="relative py-10 md:py-12">
          {/* вертикальный разделитель строго по центру */}
          <div className="relative md:grid md:grid-cols-2 md:gap-0">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-text/10" />

            {/* LEFT */}
            <div className="md:pr-10">
              <div className="text-base opacity-40">наш telegram</div>
              <div className="mt-2 text-base">@uni_smb</div>

              <div className="my-6 h-px w-full bg-text/10" />

              <div className="text-base opacity-40">email для связи</div>
              <div className="mt-2 text-base">uni.kit@mail.ru</div>

              {/* место под SVG рисунок */}
              <div className="mt-10">
                {/* положишь SVG в public/hero/temple.svg */}
                <img
                  src="/hero/temple.svg"
                  alt=""
                  className="h-auto w-full max-w-[520px] opacity-95"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
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

              <div className="mt-8 flex items-center justify-between">
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
        </Container>
      </div>
    </section>
  );
}
