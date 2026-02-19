'use client';

import Link from 'next/link';
import { Container } from '@/components/Container';
import { withBasePath } from '@/lib/basePath';

const NAV = [
  { href: '#product', label: 'продукт' },
  { href: '#pricing', label: 'стоимость' },
  { href: '#updates', label: 'обновления' },
  { href: '#about', label: 'о нас' }
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-text/10 bg-bg/90 backdrop-blur">
      <Container className="flex h-16 items-center">
        {/* Left: logo zone (SVG icon + text) */}
        <Link href="#hero" className="flex items-center gap-3">
          {/* положишь SVG в public/brand/logo.svg */}
          <img
            src={withBasePath('/brand/logo.svg')}
            alt="ЮНИ.ai"
            className="h-8 w-8"
            onError={(e) => {
              // fallback, если svg пока нет
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="leading-none">
            <div className="text-sm font-extrabold tracking-wide">ЮНИ.ai</div>
            <div className="mt-1 text-[10px] opacity-60">Системы для SMB</div>
          </div>
        </Link>

        {/* Right: nav + auth buttons (right-aligned) */}
        <div className="ml-auto flex items-center justify-end gap-6">
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm opacity-70 hover:opacity-100"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="#login"
            className="rounded-full border border-accent-1 px-4 py-2 text-sm text-accent-1 hover:bg-accent-1/10"
          >
            войти
          </a>

          <a
            href="#cta"
            className="rounded-full bg-accent-1 px-4 py-2 text-sm text-bg hover:bg-accent-1/90"
          >
            начать бесплатно
          </a>
        </div>
      </Container>
    </header>
  );
}
