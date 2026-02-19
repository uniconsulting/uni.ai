import Link from "next/link";
import { Container } from "@/components/Container";

const NAV = [
  { href: "#product", label: "продукт" },
  { href: "#pricing", label: "стоимость" },
  { href: "#updates", label: "обновления" },
  { href: "#about", label: "о нас" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-text/10 bg-bg/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="#hero" className="flex items-center gap-3">
          {/* Вместо этого блока подключим твой SVG-логотип, когда положишь в public */}
          <div className="h-8 w-8 rounded-full border border-text/10 bg-accent-3/70" />
          <div className="leading-none">
            <div className="text-sm font-extrabold tracking-wide">ЮНИ.ai</div>
            <div className="mt-1 text-[10px] font-semibold opacity-60">
              Системы для SMB
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold opacity-70 hover:opacity-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#login"
            className="rounded-full border border-accent-1 px-4 py-2 text-sm font-semibold text-accent-1 hover:bg-accent-1/10"
          >
            войти
          </a>
          <a
            href="#cta"
            className="rounded-full bg-accent-1 px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-1/90"
          >
            начать бесплатно
          </a>
        </div>
      </Container>
    </header>
  );
}
