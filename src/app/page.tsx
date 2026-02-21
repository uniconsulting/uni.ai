import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Container } from "@/components/Container";
import { BentoTile } from "@/components/BentoTile";
import { SectionTitle } from "@/components/SectionTitle";

export default function Page() {
  return (
    <div>
      <Header />

      <main className="pb-12 md:pb-20">
        {/* Hero сам управляет контейнером внутри себя */}
        <Hero />

        {/* Остальные секции: единый контейнер */}
        <Container className="mt-20 space-y-20">
          {/* 2. Главная страница-композиция */}
          <section id="composition" className="space-y-6">
            <BentoTile className="p-8 md:p-12">
              <div className="space-y-4">
                <div className="text-xs font-semibold tracking-[0.18em] opacity-70">
                  Bento UI • 5 colors • 4px grid
                </div>
                <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
                  ЮНИ: ИИ-инструменты, которые реально упрощают бизнес
                </h1>
                <p className="max-w-[72ch] text-base opacity-80 md:text-lg">
                  Это каркас проекта. Дальше по секциям: Header → Hero → 3 инфо-блока → ниши +
                  демо-чат → тарифы → ROI → японское качество → FAQ → CTA → Footer.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="#pricing"
                    className="rounded-full bg-accent-1 px-5 py-3 text-sm font-semibold text-bg"
                  >
                    Смотреть тарифы
                  </a>
                  <a
                    href="#roi"
                    className="rounded-full border border-text/15 px-5 py-3 text-sm font-semibold"
                  >
                    Посчитать ROI
                  </a>
                </div>
              </div>
            </BentoTile>
          </section>

          {/* 3. 3 инфо-блока с 16:9 окнами */}
          <section id="info" className="space-y-6">
            <SectionTitle overline="03" title="Инфо-блоки" description="Заглушка под 3 блока 16:9." />
            <div className="grid gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <BentoTile key={i} className="space-y-4">
                  <div className="aspect-video w-full rounded-md border border-text/10 bg-accent-3/70" />
                  <div className="space-y-2">
                    <div className="text-sm font-bold">Блок {i}</div>
                    <div className="text-sm opacity-75">Тут будет смысловой текст.</div>
                  </div>
                </BentoTile>
              ))}
            </div>
          </section>

          {/* 4. Блок ниш + демо-чат */}
          <section id="niches" className="space-y-6">
            <SectionTitle overline="04" title="Ниши + демо-чат" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          {/* 5. Планы/тарифы + доп-услуги */}
          <section id="pricing" className="space-y-6">
            <SectionTitle overline="05" title="Планы и тарифы" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          {/* 6. ROI-калькулятор */}
          <section id="roi" className="space-y-6">
            <SectionTitle overline="06" title="ROI-калькулятор" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          {/* 7. Японское качество */}
          <section id="quality" className="space-y-6">
            <SectionTitle overline="07" title="Японское качество" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          {/* 8. FAQ */}
          <section id="faq" className="space-y-6">
            <SectionTitle overline="08" title="FAQ" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          {/* 9. CTA */}
          <section id="cta" className="space-y-6">
            <SectionTitle overline="09" title="CTA" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          {/* 10. Footer */}
          <footer className="pt-8">
            <div className="text-xs opacity-70">© {new Date().getFullYear()} ЮНИ • foundation repo</div>
          </footer>
        </Container>
      </main>
    </div>
  );
}
