import Link from 'next/link';
import { Container } from '@/components/Container';

const NAV = [
  { href: '#hero', label: 'Главная' },
  { href: '#info', label: 'Инфо' },
  { href: '#niches', label: 'Ниши' },
  { href: '#pricing', label: 'Тарифы' },
  { href: '#roi', label: 'ROI' },
  { href: '#faq', label: 'FAQ' }
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-text/10 bg-bg/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="#hero" className="text-sm font-extrabold tracking-wide">
          ЮНИ
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm opacity-80 hover:opacity-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#cta"
            className="rounded-full bg-accent-1 px-4 py-2 text-sm font-semibold text-bg"
          >
            Связаться
          </a>
        </div>
      </Container>
    </header>
  );
}
