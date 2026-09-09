"use client";

import { useRouter } from "next/navigation";
import SettingsView from "@/components/abroadshield/SettingsView";

export default function SettingsPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "agent") router.push("/app/agent");
    else if (view === "network" || view === "opportunities") router.push("/app/opportunities");
    else if (view === "dashboard" || view === "limits") router.push("/app/limits");
    else if (view === "journey") router.push("/app/journey");
    else if (view === "connectors") router.push("/app/connectors");
    else router.push("/app/agent");
  };

  return <SettingsView onNavigate={handleNavigate as any} />;
}
