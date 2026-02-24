/* app/page.tsx */
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InfoBlocks } from "@/components/InfoBlocks";
import { DemoChat } from "@/components/DemoChat";
import { Packages } from "@/components/Packages";
import { ServicesIntegrations } from "@/components/ServicesIntegrations";
import { RoiCalculator } from "@/components/RoiCalculator";

export default function Page() {
  return (
    <div>
      <Header />

      <main className="pb-12 md:pb-20">
        <Hero />
        <InfoBlocks />
        <DemoChat />
        <Packages />
        <ServicesIntegrations />
        <RoiCalculator />
      </main>
    </div>
  );
}
