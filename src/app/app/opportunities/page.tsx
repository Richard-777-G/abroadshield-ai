"use client";

import { useRouter } from "next/navigation";
import NetworkingJobs from "@/components/abroadshield/NetworkingJobs";

export default function OpportunitiesPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "agent") router.push("/app/agent");
    else if (view === "dashboard" || view === "limits") router.push("/app/limits");
    else if (view === "journey") router.push("/app/journey");
    else if (view === "connectors") router.push("/app/connectors");
    else if (view === "settings") router.push("/app/settings");
    else router.push("/app/agent");
  };

  return <NetworkingJobs onNavigate={handleNavigate} />;
}
