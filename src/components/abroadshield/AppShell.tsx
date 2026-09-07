"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { WorkspaceHeader, WorkspaceMobileNav, WorkspaceSidebar } from "./WorkspaceNavigation";
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

  const navigate = (view: WorkspaceView) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--shield-ink)] text-[var(--shield-text)]">
      <div className="flex min-h-screen">
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
        <div className="min-w-0 flex-1 lg:pl-64">
          <WorkspaceHeader
            activeView={activeView}
            firstName={firstName}
            onOpenMobile={() => setMobileOpen(true)}
          />
          <main className="min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
