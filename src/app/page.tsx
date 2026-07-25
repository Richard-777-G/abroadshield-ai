"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import type { ViewId } from "@/components/abroadshield/ViewSwitcher";

const VIEWS: { id: ViewId; label: string; component: React.ReactNode }[] = [
  {
    id: "journey",
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
    id: "agent",
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
    id: "countries",
    label: "Countries",
    component: <CountryRules />,
  },
  {
    id: "network",
    label: "Network & Jobs",
    component: <NetworkingJobs />,
  },
  {
    id: "connectors",
    label: "Connectors",
    component: <Connectors />,
  },
  {
    id: "pricing",
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

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("journey");

  // sync with URL hash on mount + hash changes (deep linking)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as ViewId;
      if (h && VIEWS.some((v) => v.id === h)) {
        setActiveView(h);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const activeViewData = VIEWS.find((v) => v.id === activeView) ?? VIEWS[0];

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <SiteHeader activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1">
        <Hero3D />

        {/* view renderer — no separate tab bar, header drives switching */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeViewData.component}
          </motion.div>
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}
