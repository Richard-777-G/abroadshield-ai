"use client";

import { useRouter } from "next/navigation";
import JourneyWorkspace from "@/components/abroadshield/JourneyWorkspace";

export default function JourneyPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "agent") router.push("/app/agent");
    else if (view === "network" || view === "opportunities") router.push("/app/opportunities");
    else if (view === "dashboard" || view === "limits") router.push("/app/limits");
    else if (view === "connectors") router.push("/app/connectors");
    else if (view === "settings") router.push("/app/settings");
    else router.push("/app/agent");
  };

  return <JourneyWorkspace onNavigate={handleNavigate} />;
}
