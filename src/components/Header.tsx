"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const NAV = [
  { href: "#product", label: "продукт" },
  { href: "#pricing", label: "стоимость" },
  { href: "#updates", label: "обновления" },
  { href: "#about", label: "о нас" },
] as const;

export function Header() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const section = document.getElementById("pricing");
    if (!section) return;

    const HEADER_H = 64; // h-16 (подстрой если поменяешь высоту)
    let raf = 0;

    const check = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();

      // скрываем, когда секция дошла до верхней зоны (под хедером)
      // и показываем, когда секция закончилась (низ ушёл выше этой зоны)
      const shouldHide = rect.top <= HEADER_H && rect.bottom > HEADER_H;
      setHidden(shouldHide);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={[
        "sticky site-header top-0 z-50 border-b border-text/10 bg-bg/90 backdrop-blur px-1",
        "transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        hidden ? "-translate-y-[110%]" : "translate-y-0",
      ].join(" ")}
    >
      <Container>
        <div className="flex h-16 items-center">
          <Link href="#hero" className="flex items-center">
            <img src={withBasePath("/brand/logo.svg")} alt="ЮНИ.ai" className="block h-9 w-auto" />
          </Link>

          <div className="ml-auto flex items-center justify-end gap-6">
            <nav className="hidden items-center gap-6 md:flex">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="text-sm opacity-70 hover-accent">
                  {item.label}
                </a>
              ))}
            </nav>

            <a
              href="#login"
              className="btn-lift-outline rounded-sm border border-accent-1 px-4 py-2 text-sm font-semibold text-accent-1"
            >
              войти
            </a>

            <a href="#cta" className="btn-lift-accent1 rounded-sm bg-accent-1 px-4 py-2 text-sm font-semibold text-bg">
              начать бесплатно
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
