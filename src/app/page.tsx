import SiteHeader from "@/components/abroadshield/SiteHeader";
import SiteFooter from "@/components/abroadshield/SiteFooter";
import Hero3D from "@/components/abroadshield/Hero3D";
import JourneyExplorer from "@/components/abroadshield/JourneyExplorer";
import AgentActivityPanel from "@/components/abroadshield/AgentActivityPanel";
import DeadlineTimeline from "@/components/abroadshield/DeadlineTimeline";
import MemoryVault from "@/components/abroadshield/MemoryVault";
import CountryRules from "@/components/abroadshield/CountryRules";
import Pillars from "@/components/abroadshield/Pillars";
import AgentChat from "@/components/abroadshield/AgentChat";
import PricingTiers from "@/components/abroadshield/PricingTiers";
import VisionCTA from "@/components/abroadshield/VisionCTA";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--shield-ink)]">
      <SiteHeader />

      <main className="flex-1">
        <Hero3D />
        <JourneyExplorer />
        <AgentActivityPanel />
        <DeadlineTimeline />
        <div id="memory" className="scroll-mt-20">
          <MemoryVault />
        </div>
        <div id="countries" className="scroll-mt-20">
          <CountryRules />
        </div>
        <Pillars />
        <AgentChat />
        <PricingTiers />
        <VisionCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
