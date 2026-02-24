"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const NAV = [
  { href: "#product", label: "продукт" }, // DemoChat
  { href: "#pricing", label: "стоимость" }, // Packages
  { href: "https://t.me/uni_smb", label: "обновления" }, // external
  { href: "#about", label: "о нас" }, // ServicesIntegrations
] as const;

type Marks = {
  hero: number;
  info: number;
  pricing: number;
  faq: number;
  footer: number;
};

const INF = Number.POSITIVE_INFINITY;

function topOf(el: HTMLElement | null) {
  return el ? el.getBoundingClientRect().top + window.scrollY : INF;
}

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

export function Header() {
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const marksRef = useRef<Marks>({ hero: 0, info: INF, pricing: INF, faq: INF, footer: INF });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const HEADER_H = 64;

    const elHero = document.getElementById("hero");
    const elInfo = document.getElementById("info"); // InfoBlocks (точка появления)
    const elPricing = document.getElementById("pricing"); // Packages
    const elFaq = document.getElementById("faq");
    const elFooter = document.getElementById("footer");

    const recalc = () => {
      marksRef.current = {
        hero: topOf(elHero),
        info: topOf(elInfo),
        pricing: topOf(elPricing),
        faq: topOf(elFaq),
        footer: topOf(elFooter),
      };
    };

    const setHiddenSafe = (next: boolean) => {
      setHidden((prev) => (prev === next ? prev : next));
    };

    let raf = 0;

    const decide = () => {
      raf = 0;

      const y = window.scrollY || 0;
      const prevY = lastYRef.current || 0;

      const goingUp = y < prevY - 6;
      const goingDown = y > prevY + 2;

      if (y <= 2) {
        setHiddenSafe(false);
        lastYRef.current = y;
        return;
      }

      if (goingUp) {
        setHiddenSafe(false);
        lastYRef.current = y;
        return;
      }

      if (!goingDown) {
        lastYRef.current = y;
        return;
      }

      const anchor = y + HEADER_H + 1;
      const m = marksRef.current;

      const inHero = anchor < m.info;
      const inInfo = anchor >= m.info && anchor < m.pricing;
      const inPricing = anchor >= m.pricing && anchor < m.faq;
      const inFaq = anchor >= m.faq && anchor < m.footer;
      const inFooter = anchor >= m.footer;

      if (inHero) setHiddenSafe(true);
      else if (inInfo) setHiddenSafe(false);
      else if (inPricing) setHiddenSafe(true);
      else if (inFaq) setHiddenSafe(false);
      else if (inFooter) setHiddenSafe(true);

      lastYRef.current = y;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(decide);
    };

    const onResize = () => {
      recalc();
      onScroll();
    };

    recalc();
    decide();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        recalc();
        onScroll();
      });
      ro.observe(document.body);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) window.cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-text/10 bg-bg/90 backdrop-blur px-1"
      initial={false}
      animate={{ y: hidden ? -80 : 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Container>
        <div className="flex h-16 items-center">
          <Link href="#hero" className="flex items-center">
            <img src={withBasePath("/brand/logo.svg")} alt="ЮНИ.ai" className="block h-9 w-auto" />
          </Link>

          <div className="ml-auto flex items-center justify-end gap-6">
            <nav className="hidden items-center gap-6 md:flex">
              {NAV.map((item) => {
                const ext = isExternal(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noreferrer" : undefined}
                    className="text-sm opacity-70 hover-accent"
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <a
              href="https://uni-ai.online/login"
              className="btn-lift-outline rounded-sm border border-accent-1 px-4 py-2 text-sm font-semibold text-accent-1"
            >
              войти
            </a>

            <a
              href="https://uni-ai.online/"
              className="btn-lift-accent1 rounded-sm bg-accent-1 px-4 py-2 text-sm font-semibold text-bg"
            >
              начать бесплатно
            </a>
          </div>
        </div>
      </Container>
    </motion.header>
  );
}