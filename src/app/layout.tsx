import type { Metadata } from 'next';
import '@/styles/globals.css';
import { withBasePath } from '@/lib/basePath';

export const metadata: Metadata = {
  title: 'ЮНИ — ИИ в каждый бизнес',
  description: 'Landing foundation: Bento UI, Garet, 5-color palette, 4px grid.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontBook = withBasePath('/fonts/Garet-Book.woff2');
  const fontHeavy = withBasePath('/fonts/Garet-Heavy.woff2');

  return (
    <html
      lang="ru"
      style={
        {
          '--font-garet-book': fontBook,
          '--font-garet-heavy': fontHeavy
        } as React.CSSProperties
      }
    >
      <body>{children}</body>
    </html>
  );
}
