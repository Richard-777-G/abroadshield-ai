"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { WorkspaceHeader, WorkspaceMobileNav, WorkspaceSidebar } from "./WorkspaceNavigation";
import WorkstationArtifactPanel, { type ArtifactTab } from "./WorkstationArtifactPanel";
import type { WorkspaceView } from "./workspace-types";

export type { WorkspaceView } from "./workspace-types";

export default function AppShell({
  activeView,
  onNavigate,
  children,
}: {
  activeView: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "Student";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [artifactsOpen, setArtifactsOpen] = useState(false);
  const [artifactTab, setArtifactTab] = useState<ArtifactTab>("dossier");

  const navigate = (view: WorkspaceView) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleToggleArtifacts = () => setArtifactsOpen((prev) => !prev);
    const handleOpenArtifacts = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: ArtifactTab }>).detail;
      if (detail?.tab) setArtifactTab(detail.tab);
      setArtifactsOpen(true);
    };

    window.addEventListener("abroadshield:toggle-artifacts", handleToggleArtifacts);
    window.addEventListener("abroadshield:open-artifacts", handleOpenArtifacts);

    return () => {
      window.removeEventListener("abroadshield:toggle-artifacts", handleToggleArtifacts);
      window.removeEventListener("abroadshield:open-artifacts", handleOpenArtifacts);
    };
  }, []);

  const handleTriggerPrompt = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("abroadshield:prefill-chat", { detail: prompt }));
    if (activeView !== "agent") onNavigate("agent");
  };

  return (
    <div className="as-workstation-canvas text-[var(--shield-text)]">
      <div className="flex h-full w-full overflow-hidden">
        {/* Left Sidebar (ChatGPT / Claude style) */}
        <WorkspaceSidebar
          activeView={activeView}
          firstName={firstName}
          email={session?.user?.email}
          onNavigate={navigate}
        />
        <WorkspaceMobileNav
          activeView={activeView}
          mobileOpen={mobileOpen}
          onNavigate={navigate}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Center Canvas Stage */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-64">
          <WorkspaceHeader
            activeView={activeView}
            firstName={firstName}
            onOpenMobile={() => setMobileOpen(true)}
            onToggleArtifacts={() => setArtifactsOpen(!artifactsOpen)}
            artifactsOpen={artifactsOpen}
          />
          <div className="flex flex-1 overflow-hidden">
            <main className="relative flex-1 overflow-y-auto">
              {children}
            </main>

            {/* Right Side Artifact & Intelligence Inspector (Claude Artifacts style) */}
            <WorkstationArtifactPanel
              open={artifactsOpen}
              onClose={() => setArtifactsOpen(false)}
              activeTab={artifactTab}
              onTabChange={setArtifactTab}
              onTriggerPrompt={handleTriggerPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
