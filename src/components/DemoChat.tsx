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
      {/* горизонтальный разделитель во всю ширину */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-text/10"
      />

      {/* вертикальный разделитель ровно по центру страницы */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-text/10"
      />

      <Container className="relative z-10 py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 md:gap-0">
          {/* LEFT */}
          <div className="md:pr-12">
            <div className="flex items-start gap-6">
              <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E24B4B]">
                <Settings className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>

              <h2 className="font-extrabold leading-[0.95] tracking-tight text-[44px] md:text-[56px] lg:text-[64px]">
                <span className="block">Готовые настройки</span>
                <span className="block">для многих направлений</span>
              </h2>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              {PILLS.map((t) => (
                <div
                  key={t}
                  className="rounded-lg bg-white px-8 py-5 text-[16px] font-semibold leading-snug text-text"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:pl-12">
            <div className="flex items-start justify-end">
              <div className="text-xl font-medium opacity-70">demo-чат</div>
            </div>

            {/* место под этап 2 (сам демо-чат) */}
            <div className="mt-10 min-h-[260px]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
