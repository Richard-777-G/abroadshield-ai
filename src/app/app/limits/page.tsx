"use client";

import { useRouter } from "next/navigation";
import DashboardView from "@/components/abroadshield/DashboardView";

export default function LimitsPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "agent") router.push("/app/agent");
    else if (view === "network" || view === "opportunities") router.push("/app/opportunities");
    else if (view === "journey") router.push("/app/journey");
    else if (view === "connectors") router.push("/app/connectors");
    else if (view === "settings") router.push("/app/settings");
    else router.push("/app/agent");
  };

  return <DashboardView onNavigate={handleNavigate} />;
}
