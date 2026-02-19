import { Container } from "@/components/Container";
import { BentoTile } from "@/components/BentoTile";

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* верхняя часть hero */}
      <Container className="relative">
        <div className="relative flex min-h-[calc(100svh-64px)] flex-col pt-20">
          <h1 className="max-w-[920px] text-5xl font-extrabold leading-[1.02] md:text-6xl">
            Кабинет твоей
            <br />
            <span className="text-accent-1">команды</span> ИИ-агентов
          </h1>

          {/* декоративные иероглифы справа (пока текстом, потом заменим на SVG) */}
          <div className="pointer-events-none absolute right-0 top-24 hidden lg:block pr-2">
            <div className="select-none text-[110px] font-extrabold leading-[0.86] opacity-90">
              {"精益生产".split("").map((ch) => (
                <div key={ch}>{ch}</div>
              ))}
            </div>
          </div>

          {/* центральное окно 16:9 */}
          <div className="mx-auto mt-14 w-full max-w-[760px]">
            <BentoTile className="p-0">
              <div className="aspect-video w-full rounded-lg bg-accent-3/70" />
            </BentoTile>
          </div>

          <div className="mt-auto" />
        </div>
      </Container>

      {/* нижняя bento-полоса */}
      <div className="border-t border-text/10">
        <Container>
          <div className="grid gap-0 py-8 lg:grid-cols-12">
            {/* левый блок с храмом (пока заглушка) */}
            <div className="relative lg:col-span-5">
              <div className="h-48 w-full rounded-lg border border-text/10 bg-accent-3/40 md:h-56" />
            </div>

            {/* контакты */}
            <div className="mt-6 border-text/10 lg:col-span-3 lg:mt-0 lg:border-l lg:pl-8">
              <div className="text-xs font-semibold opacity-50">наш telegram</div>
              <div className="mt-2 text-2xl font-extrabold">@uni_smb</div>

              <div className="mt-6 h-px w-full bg-text/10" />

              <div className="mt-6 text-xs font-semibold opacity-50">email для связи</div>
              <div className="mt-2 text-2xl font-extrabold">uni.kit@mail.ru</div>
            </div>

            {/* описание + кнопка */}
            <div className="mt-6 border-text/10 lg:col-span-4 lg:mt-0 lg:border-l lg:pl-8">
              <div className="text-sm leading-relaxed opacity-85">
                ЮНИ.ai - интегратор ИИ-решений
                <br />
                в бизнесе полного цикла. Строим решения,
                основанные на ответственности перед
                бизнесом и его клиентами.
              </div>

              <div className="mt-5 flex items-center gap-3">
                <span className="rounded-md border border-text/10 bg-accent-3/70 px-3 py-2 text-sm font-extrabold">
                  道
                </span>
                <span className="rounded-md border border-text/10 bg-accent-3/70 px-3 py-2 text-sm font-extrabold">
                  改善
                </span>
                <span className="text-xs font-semibold opacity-50">
                  наши продукты
                  <br />
                  японского качества
                </span>
              </div>

              <div className="mt-6">
                <a
                  href="#cta"
                  className="inline-flex rounded-full bg-accent-1 px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-1/90"
                >
                  приступим
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
