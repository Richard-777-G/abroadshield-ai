"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import AppShell from "@/components/abroadshield/AppShell";
import { useProfileStore } from "@/components/abroadshield/profileStore";

const OnboardingWizard = dynamic(
  () => import("@/components/abroadshield/OnboardingWizard"),
  { ssr: false }
);

function FeatureLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-xs text-[var(--shield-text-dim)]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--shield-border)] border-t-[var(--shield-emerald-bright)]" />
      <span className="font-mono">{label}</span>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
      <div className="as-dock max-w-md rounded-3xl p-8 shadow-2xl border border-[var(--shield-border)] bg-[rgba(12,14,20,0.95)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[var(--shield-emerald-bright)]">
          <span className="text-2xl">🛡️</span>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-white">Private Co-Pilot Workspace</h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
          Your AI agent, journey vector, statutory checklists, and saved opportunities are securely associated with your student account.
        </p>
        <button
          type="button"
          onClick={() => void signIn()}
          className="as-public-button-primary mt-6 w-full rounded-xl py-3 text-xs font-bold shadow-lg"
        >
          Sign In to Access Workspace
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const { hydrated, hydrateFromServer, resetProfile } = useProfileStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      void hydrateFromServer();
    } else if (status === "unauthenticated") {
      resetProfile();
    }
  }, [status, hydrateFromServer, resetProfile]);

  useEffect(() => {
    const onboardingHandler = () => setShowOnboarding(true);
    window.addEventListener("abroadshield:open-onboarding", onboardingHandler);
    return () => {
      window.removeEventListener("abroadshield:open-onboarding", onboardingHandler);
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="as-workstation-canvas text-[var(--shield-text)]">
        <FeatureLoading label="Verifying authenticated session…" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="as-workstation-canvas text-[var(--shield-text)]">
        <SignInPrompt />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard
            onComplete={() => {
              setShowOnboarding(false);
            }}
          />
        )}
      </AnimatePresence>
      <AppShell>
        {hydrated ? children : <FeatureLoading label="Preparing your private workspace…" />}
      </AppShell>
    </>
  );
}
