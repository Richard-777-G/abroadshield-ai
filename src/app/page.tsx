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
import ApprovalsHistory from "@/components/abroadshield/ApprovalsHistory";
import NetworkingJobs from "@/components/abroadshield/NetworkingJobs";
import Connectors from "@/components/abroadshield/Connectors";
import PricingTiers from "@/components/abroadshield/PricingTiers";
import VisionCTA from "@/components/abroadshield/VisionCTA";
import ViewSwitcher from "@/components/abroadshield/ViewSwitcher";

export default function Home() {
  // Each view bundles related sections into one focused experience.
  const views = [
    {
      id: "journey" as const,
      label: "Journey",
      component: (
        <>
          <JourneyExplorer />
          <DeadlineTimeline />
          <MemoryVault />
        </>
      ),
    },
    {
      id: "agent" as const,
      label: "Agent",
      component: (
        <>
          <AgentActivityPanel />
          <AgentChat />
          <ApprovalsHistory />
        </>
      ),
    },
    {
      id: "countries" as const,
      label: "Countries",
      component: <CountryRules />,
    },
    {
      id: "network" as const,
      label: "Network & Jobs",
      component: <NetworkingJobs />,
    },
    {
      id: "connectors" as const,
      label: "Connectors",
      component: <Connectors />,
    },
    {
      id: "pricing" as const,
      label: "Pricing",
      component: (
        <>
          <Pillars />
          <PricingTiers />
          <VisionCTA />
        </>
      ),
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <SiteHeader />

      <main className="flex-1">
        <Hero3D />
        <ViewSwitcher views={views} initialView="journey" />
      </main>

      <SiteFooter />
    </div>
  );
}
