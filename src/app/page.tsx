/* app/page.tsx */
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InfoBlocks } from "@/components/InfoBlocks";
import { DemoChat } from "@/components/DemoChat";
import { Packages } from "@/components/Packages";
import { Container } from "@/components/Container";
import { BentoTile } from "@/components/BentoTile";
import { SectionTitle } from "@/components/SectionTitle";

export default function Page() {
  return (
    <div>
      <Header />

      <main className="pb-12 md:pb-20">
        <Hero />
        <InfoBlocks />
        <DemoChat />
        <Packages />

        <Container className="mt-20 space-y-20">
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
                  Это каркас проекта. Дальше по секциям: Header → Hero → 3 инфо-блока → ниши + демо-чат → тарифы → ROI →
                  японское качество → FAQ → CTA → Footer.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a href="#pricing" className="rounded-full bg-accent-1 px-5 py-3 text-sm font-semibold text-bg">
                    Смотреть тарифы
                  </a>
                  <a href="#roi" className="rounded-full border border-text/15 px-5 py-3 text-sm font-semibold">
                    Посчитать ROI
                  </a>
                </div>
              </div>
            </BentoTile>
          </section>

          <section id="niches" className="space-y-6">
            <SectionTitle overline="04" title="Ниши + демо-чат" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          <section id="pricing" className="space-y-6">
            <SectionTitle overline="05" title="Планы и тарифы" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          <section id="roi" className="space-y-6">
            <SectionTitle overline="06" title="ROI-калькулятор" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          <section id="quality" className="space-y-6">
            <SectionTitle overline="07" title="Японское качество" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          <section id="faq" className="space-y-6">
            <SectionTitle overline="08" title="FAQ" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          <section id="cta" className="space-y-6">
            <SectionTitle overline="09" title="CTA" />
            <BentoTile>
              <div className="text-sm opacity-80">Секция будет сделана отдельным этапом.</div>
            </BentoTile>
          </section>

          <footer className="pt-8">
            <div className="text-xs opacity-70">© {new Date().getFullYear()} ЮНИ • foundation repo</div>
          </footer>
        </Container>
      </main>
    </div>
  );
}
