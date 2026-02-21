/* components/DemoChat.tsx */
import { Container } from "@/components/Container";
import { Settings } from "lucide-react";

const PILLS = [
  "Ремонт коммерческих помещений",
  "Автосервис",
  "Обслуживание мобильных устройств",
  "Стоматологическая клиника",
  "Груминг",
  "Производство (b2b)",
  "Онлайн-школа",
] as const;

export function DemoChat() {
  return (
    <section id="demo-chat" className="relative">
      {/* horizontal divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10"
      />

      {/* vertical divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-text/10"
      />

      <Container className="relative z-10 py-12 md:py-14 px-6 md:px-10 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          {/* LEFT */}
          <div className="md:pr-12">
            <div className="flex items-start gap-5">
              {/* icon = height of heading block (2 lines) */}
              <div className="shrink-0">
                <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-accent-1">
                  <Settings className="h-10 w-10 text-bg" strokeWidth={2.2} />
                </div>
              </div>

              <h2 className="font-extrabold leading-[0.95] tracking-tight text-[34px] md:text-[40px] lg:text-[44px]">
                <span className="block">Готовые настройки</span>
                <span className="block">для многих направлений</span>
              </h2>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {PILLS.map((t) => (
                <div
                  key={t}
                  className="rounded-lg bg-accent-3 px-7 py-4 text-[14px] font-semibold leading-snug text-text"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:pl-12">
            <div className="flex items-start justify-end">
              <div className="text-[14px] font-medium opacity-70">demo-чат</div>
            </div>

            {/* place for stage 2 */}
            <div className="mt-10 min-h-[260px]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
