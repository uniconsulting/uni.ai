import Link from "next/link";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const NAV = [
  { href: "#product", label: "продукт" },
  { href: "#pricing", label: "стоимость" },
  { href: "#updates", label: "обновления" },
  { href: "#about", label: "о нас" },
] as const;

export function Header() {
  return (
    <header className="sticky site-header top-0 z-50 border-b border-text/10 bg-bg/90 backdrop-blur px-1">
      <Container>
        <div className="flex h-16 items-center">
          <Link href="#hero" className="flex items-center">
            <img
              src={withBasePath("/brand/logo.svg")}
              alt="ЮНИ.ai"
              className="block h-9 w-auto"
            />
          </Link>

          <div className="ml-auto flex items-center justify-end gap-6">
            <nav className="hidden items-center gap-6 md:flex">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="text-sm opacity-70 hover-accent">
                  {item.label}
                </a>
              ))}
            </nav>

            <a href="#login" className="rounded-sm border border-accent-1 px-4 py-2 text-sm font-semibold text-accent-1 hover:bg-accent-1/10">
              войти
            </a>

            <a href="#cta" className="rounded-sm bg-accent-1 px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-1/90">
              начать бесплатно
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
