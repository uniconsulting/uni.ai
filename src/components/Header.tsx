"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const NAV = [
  { href: "#product", label: "продукт" },
  { href: "#pricing", label: "стоимость" },
  { href: "https://t.me/uni_smb", label: "обновления" },
  { href: "#integrations", label: "о нас" },
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

function toMenuLabel(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function BurgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Закрыть меню" : "Открыть меню"}
      aria-expanded={open}
      aria-controls="mobile-header-menu"
      className="relative inline-flex appearance-none items-center justify-center border-0 bg-transparent p-0 text-text md:hidden"
    >
      <span className="relative block h-7 w-7">
        <motion.span
          aria-hidden
          className="absolute left-0 top-[4px] h-[2.5px] w-full rounded-full bg-current"
          animate={
            open
              ? { top: "12px", rotate: 45, scaleX: 1 }
              : { top: "4px", rotate: 0, scaleX: 1 }
          }
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.span
          aria-hidden
          className="absolute left-0 top-[12px] h-[2.5px] w-full rounded-full bg-current"
          animate={open ? { opacity: 0, scaleX: 0.65 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.span
          aria-hidden
          className="absolute left-0 top-[20px] h-[2.5px] w-full rounded-full bg-current"
          animate={
            open
              ? { top: "12px", rotate: -45, scaleX: 1 }
              : { top: "20px", rotate: 0, scaleX: 1 }
          }
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
    </button>
  );
}

export function Header() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const lastYRef = useRef(0);
  const marksRef = useRef<Marks>({
    hero: 0,
    info: INF,
    pricing: INF,
    faq: INF,
    footer: INF,
  });

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const HEADER_H = 64;

    const elHero = document.getElementById("hero");
    const elInfo = document.getElementById("info");
    const elPricing = document.getElementById("pricing");
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

      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
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

  // ВАЖНО: блокируем скролл только пока меню реально открыто
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyTouch = document.body.style.touchAction;
    const prevHtmlTouch = document.documentElement.style.touchAction;

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.touchAction = "none";
    } else {
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevHtmlOverflow || "";
      document.body.style.touchAction = prevBodyTouch || "";
      document.documentElement.style.touchAction = prevHtmlTouch || "";
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.touchAction = prevBodyTouch;
      document.documentElement.style.touchAction = prevHtmlTouch;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuVisible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuVisible]);

  const openMenu = () => {
    setMenuVisible(true);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  const itemVariants = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: reduceMotion
        ? { duration: 0 }
        : {
            duration: 0.38,
            delay: 0.06 + i * 0.045,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          },
    }),
    exit: {
      opacity: 0,
      y: 8,
      filter: "blur(4px)",
      transition: reduceMotion ? { duration: 0 } : { duration: 0.2 },
    },
  };

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 border-b border-text/10 bg-bg/90 backdrop-blur px-1"
        initial={false}
        animate={{ y: menuVisible ? 0 : hidden ? -80 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <Container>
          <div className="flex h-16 items-center">
            <Link href="#hero" className="flex items-center" onClick={closeMenu}>
              <img
                src={withBasePath("/brand/logo.svg")}
                alt="ЮНИ.ai"
                className="block h-9 w-auto"
              />
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

              <div className="hidden items-center gap-3 md:flex">
                <a
                  href="https://uni-ai.online/login"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-lift-outline rounded-sm border border-accent-1 px-4 py-2 text-sm font-semibold text-accent-1"
                >
                  войти
                </a>

                <a
                  href="https://uni-ai.online/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-lift-accent1 rounded-sm bg-accent-1 px-4 py-2 text-sm font-semibold text-bg"
                >
                  начать бесплатно
                </a>
              </div>

              <BurgerButton
                open={menuOpen}
                onClick={() => {
                  if (menuOpen) closeMenu();
                  else openMenu();
                }}
              />
            </div>
          </div>
        </Container>
      </motion.header>

      <AnimatePresence
        initial={false}
        onExitComplete={() => {
          setMenuVisible(false);
        }}
      >
        {menuVisible ? (
          <motion.div
            id="mobile-header-menu"
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-bg md:hidden"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : -14 }}
            exit={{ opacity: 0, y: -14 }}
            transition={panelTransition}
          >
            <div className="h-full overflow-y-auto">
              <Container className="h-full px-6">
                <div className="flex min-h-full flex-col py-6">
                  <motion.nav
                    className="grid gap-3"
                    initial="hidden"
                    animate={menuOpen ? "show" : "exit"}
                    exit="exit"
                  >
                    {NAV.map((item, i) => {
                      const ext = isExternal(item.href);

                      return (
                        <motion.a
                          key={item.href}
                          custom={i}
                          variants={itemVariants}
                          href={item.href}
                          target={ext ? "_blank" : undefined}
                          rel={ext ? "noreferrer" : undefined}
                          onClick={closeMenu}
                          className="block py-1 text-[32px] font-semibold leading-[0.95] tracking-tight text-text hover-accent"
                        >
                          {toMenuLabel(item.label)}
                        </motion.a>
                      );
                    })}
                  </motion.nav>

                  <motion.div
                    custom={4}
                    variants={itemVariants}
                    initial="hidden"
                    animate={menuOpen ? "show" : "exit"}
                    exit="exit"
                    className="mt-8"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 min-w-[52px] items-center justify-center rounded-sm bg-accent-3 px-3 text-[18px] font-normal hover-accent">
                        道
                      </span>
                      <span className="inline-flex h-10 min-w-[52px] items-center justify-center rounded-sm bg-accent-3 px-3 text-[18px] font-normal hover-accent">
                        改善
                      </span>

                      <div className="text-[14px] font-medium leading-snug text-text/65">
                        наши продукты
                        <br />
                        японского качества
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    custom={5}
                    variants={itemVariants}
                    initial="hidden"
                    animate={menuOpen ? "show" : "exit"}
                    exit="exit"
                    className="mt-8 grid gap-6"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-text/45">наш telegram</div>
                      <a
                        href="https://t.me/uni_smb"
                        target="_blank"
                        rel="noreferrer"
                        onClick={closeMenu}
                        className="mt-2 block text-[32px] font-semibold leading-[0.95] hover-accent"
                      >
                        @uni_smb
                      </a>
                    </div>

                    <div>
                      <div className="text-[13px] font-medium text-text/45">email для связи</div>
                      <a
                        href="mailto:uni.kit@mail.ru"
                        onClick={closeMenu}
                        className="mt-2 block break-all text-[32px] font-semibold leading-[0.95] hover-accent"
                      >
                        uni.kit@mail.ru
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    custom={6}
                    variants={itemVariants}
                    initial="hidden"
                    animate={menuOpen ? "show" : "exit"}
                    exit="exit"
                    className="mt-8 grid grid-cols-[108px_minmax(0,1fr)] gap-3"
                  >
                    <a
                      href="https://uni-ai.online/login"
                      target="_blank"
                      rel="noreferrer"
                      onClick={closeMenu}
                      className="btn-lift-outline inline-flex h-16 items-center justify-center rounded-xl border border-accent-1 px-4 text-[14px] font-semibold text-accent-1"
                    >
                      войти
                    </a>

                    <a
                      href="https://uni-ai.online/"
                      target="_blank"
                      rel="noreferrer"
                      onClick={closeMenu}
                      className="btn-lift-accent1 inline-flex h-16 items-center justify-center rounded-xl bg-accent-1 px-5 text-[14px] font-semibold text-bg whitespace-nowrap"
                    >
                      начать бесплатно
                    </a>
                  </motion.div>

                  <motion.div
                    custom={7}
                    variants={itemVariants}
                    initial="hidden"
                    animate={menuOpen ? "show" : "exit"}
                    exit="exit"
                    className="mt-auto pt-8"
                  >
                    <div className="h-px w-screen -translate-x-6 bg-text/10" />
                    <div className="flex items-center justify-between gap-4 pt-5 text-[12px] font-medium text-text/55">
                      <span>© 2026 (ООО "БЭНИФИТ")</span>
                      <span>Сделано ЮНИ.ai</span>
                    </div>
                  </motion.div>
                </div>
              </Container>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
