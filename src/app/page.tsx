"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import SiteHeader from "@/components/abroadshield/SiteHeader";
import SiteFooter from "@/components/abroadshield/SiteFooter";
import Hero3D from "@/components/abroadshield/Hero3D";
import AuthModal from "@/components/abroadshield/AuthModal";
import AppShell, { type WorkspaceView } from "@/components/abroadshield/AppShell";
import { useProfileStore } from "@/components/abroadshield/profileStore";

const ViewHero = dynamic(() => import("@/components/abroadshield/ViewHero"));
const JourneyExplorer = dynamic(() => import("@/components/abroadshield/JourneyExplorer"));
const CountryRules = dynamic(() => import("@/components/abroadshield/CountryRules"));
const Pillars = dynamic(() => import("@/components/abroadshield/Pillars"));
const AgentChat = dynamic(() => import("@/components/abroadshield/AgentChat"), { loading: () => <FeatureLoading label="Loading agent…" /> });
const NetworkingJobs = dynamic(() => import("@/components/abroadshield/NetworkingJobs"));
const Connectors = dynamic(() => import("@/components/abroadshield/Connectors"));
const PricingTiers = dynamic(() => import("@/components/abroadshield/PricingTiers"));
const VisionCTA = dynamic(() => import("@/components/abroadshield/VisionCTA"));
const DashboardView = dynamic(() => import("@/components/abroadshield/DashboardView"), { loading: () => <FeatureLoading label="Loading workspace…" /> });
const StageWorkspace = dynamic(() => import("@/components/abroadshield/StageWorkspace"));
const OnboardingWizard = dynamic(() => import("@/components/abroadshield/OnboardingWizard"), { ssr: false });

type View = "home" | "dashboard" | "journey" | "agent" | "countries" | "network" | "connectors" | "pricing";
const ALL_VIEWS: View[] = ["home", "dashboard", "journey", "agent", "countries", "network", "connectors", "pricing"];
const PUBLIC_VIEWS: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "journey", label: "How it works" },
  { id: "countries", label: "Countries" },
  { id: "pricing", label: "Pricing" },
];
const WORKSPACE_VIEWS: WorkspaceView[] = ["dashboard", "agent", "journey", "connectors", "network"];

export default function Home() {
  const { data: session, status } = useSession();
  const { profile, hydrateFromServer } = useProfileStore();
  const [activeView, setActiveView] = useState<View>("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { if (status === "authenticated") void hydrateFromServer(); }, [status, hydrateFromServer]);

  const navigateTo = useCallback((id: string) => {
    if (!ALL_VIEWS.includes(id as View)) return;
    const view = id as View;
    if (WORKSPACE_VIEWS.includes(view as WorkspaceView) && !session) {
      setShowAuth(true);
      return;
    }
    setActiveView(view);
    window.history.replaceState(null, "", view === "home" ? window.location.pathname : `#${view}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [session]);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as View;
      if (ALL_VIEWS.includes(h)) setActiveView(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const view = (e as CustomEvent<string>).detail;
      if (view) navigateTo(view);
    };
    window.addEventListener("abroadshield:navigate", handler);
    return () => window.removeEventListener("abroadshield:navigate", handler);
  }, [navigateTo]);

  useEffect(() => {
    if (status === "authenticated" && activeView === "home" && !window.location.hash) {
      setActiveView("dashboard");
    }
  }, [status, activeView]);

  const content = (
    <AnimatePresence mode="wait">
      <motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
        {activeView === "home" && <LandingPage onNavigate={navigateTo} />}
        {activeView === "dashboard" && (session ? <DashboardView onNavigate={navigateTo} /> : <SignInPanel onSignIn={() => setShowAuth(true)} />)}
        {activeView === "journey" && (session ? <StageWorkspace onNavigate={navigateTo} /> : <PublicHowItWorks />)}
        {activeView === "agent" && (session ? <AgentChat /> : <SignInPanel onSignIn={() => setShowAuth(true)} />)}
        {activeView === "countries" && <><ViewHero viewId="countries" /><CountryRules /></>}
        {activeView === "network" && (session ? <NetworkingJobs /> : <SignInPanel onSignIn={() => setShowAuth(true)} />)}
        {activeView === "connectors" && (session ? <Connectors /> : <SignInPanel onSignIn={() => setShowAuth(true)} />)}
        {activeView === "pricing" && <><ViewHero viewId="pricing" /><Pillars /><PricingTiers /><VisionCTA /></>}
      </motion.div>
    </AnimatePresence>
  );

  const isWorkspace = status === "authenticated" && WORKSPACE_VIEWS.includes(activeView as WorkspaceView);
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} mode="signup" />
      <AnimatePresence>{showOnboarding && <OnboardingWizard onComplete={() => { setShowOnboarding(false); navigateTo("dashboard"); }} />}</AnimatePresence>
      {isWorkspace ? (
        <AppShell activeView={activeView as WorkspaceView} onNavigate={navigateTo as (v: WorkspaceView) => void}>{content}</AppShell>
      ) : (
        <>
          <SiteHeader activeView={activeView} onViewChange={navigateTo} views={PUBLIC_VIEWS} onTryAgent={() => { if (session) setShowOnboarding(!profile.onboarded); else setShowAuth(true); }} />
          <main className="flex-1">{content}</main>
          <SiteFooter />
        </>
      )}
    </div>
  );
}

function LandingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <>
      <Hero3D onNavigate={onNavigate} />

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">The problem</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Going abroad is one journey spread across too many services.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--shield-text-dim)]">Visa requirements, documents, deadlines, housing, study, work and the first job are connected in real life — but usually managed separately.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Understand", "Know the rules, requirements and next steps for your country and stage."],
            ["02", "Prepare", "Turn requirements into documents, tasks, drafts and deadlines."],
            ["03", "Execute", "Use the agent to search, check, tailor and prepare real work."],
            ["04", "Continue", "Keep the same profile, memory and record from departure to career."],
          ].map(([n, title, text]) => (
            <div key={n} className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5">
              <div className="font-mono text-xs text-[oklch(0.74_0.17_162)]">{n}</div>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--shield-border)] bg-[var(--shield-ink-2)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">The product</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">One profile. One memory. One agent. Four phases.</h2>
            <p className="mt-5 text-base leading-7 text-[var(--shield-text-dim)]">AbroadShield connects the student's country rules, personal information, documents, tasks, approvals and career activity into one operating system.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <ProductCard number="01" title="Country-aware" text="Requirements and decisions are shaped by the destination and the student's current stage." />
            <ProductCard number="02" title="Action-first" text="The agent produces useful work — checks, drafts, searches, shortlists and next actions." />
            <ProductCard number="03" title="Human-controlled" text="Outbound actions require approval, and completed work becomes part of the journey record." />
          </div>
        </div>
      </section>

      <section id="journey" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">How it works</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">The journey does not reset when the student moves to the next stage.</h2>
            <p className="mt-5 text-base leading-7 text-[var(--shield-text-dim)]">Select a phase to understand the kind of work the platform performs there.</p>
          </div>
          <button onClick={() => onNavigate("journey")} className="rounded-xl border border-[var(--shield-border)] px-5 py-3 text-sm font-semibold transition hover:border-[oklch(0.74_0.17_162/0.5)]">Explore the journey</button>
        </div>
        <div className="mt-8"><JourneyExplorer /></div>
      </section>

      <section className="border-y border-[var(--shield-border)] bg-[var(--shield-ink-2)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">Country intelligence</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Rules change by country. The workflow should too.</h2>
            <p className="mt-5 text-base leading-7 text-[var(--shield-text-dim)]">Country profiles connect official sources, requirements and stage-specific actions so the agent has the right context before it acts.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => onNavigate("countries")} className="rounded-xl bg-[oklch(0.74_0.17_162)] px-5 py-3 text-sm font-semibold text-[oklch(0.12_0.016_165)]">Explore countries</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">Built for real life</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">The goal is not more information. It is fewer things left undone.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "One continuous student record",
              "Stage-specific requirements",
              "Action and approval history",
              "Career and job workflow",
              "Country-aware decisions",
              "Human control over outbound actions",
            ].map((item) => <div key={item} className="rounded-xl border border-[var(--shield-border)] px-4 py-3 text-sm text-[var(--shield-text-dim)]">{item}</div>)}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--shield-border)] bg-[var(--shield-ink-2)]">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">Start with the work</div>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold sm:text-5xl">Your journey is complicated. Your workspace should not be.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--shield-text-dim)]">Create your private workspace, choose your destination and let AbroadShield build the work around your actual journey.</p>
          <button onClick={() => onNavigate("dashboard")} className="mt-8 rounded-xl bg-[oklch(0.98_0.005_160)] px-6 py-3.5 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Get started</button>
        </div>
      </section>
    </>
  );
}

function PublicHowItWorks() {
  return <section className="mx-auto max-w-6xl px-5 pb-20 pt-32 sm:px-8"><div className="max-w-3xl"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">How it works</div><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Understand the journey. Then let the agent work it.</h1><p className="mt-5 text-base leading-7 text-[var(--shield-text-dim)]">Your authenticated Journey workspace turns these phases into requirements, tasks, documents, deadlines and actions.</p></div><div className="mt-10"><JourneyExplorer /></div></section>;
}

function ProductCard({ number, title, text }: { number: string; title: string; text: string }) { return <div className="rounded-2xl border border-[var(--shield-border)] p-6"><div className="font-mono text-xs text-[oklch(0.74_0.17_162)]">{number}</div><h3 className="mt-3 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">{text}</p></div>; }
function FeatureLoading({ label }: { label: string }) { return <div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-[var(--shield-text-dim)]">{label}</div>; }
function SignInPanel({ onSignIn }: { onSignIn: () => void }) { return <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"><div className="mb-6 text-4xl">🛡️</div><h2 className="text-2xl font-semibold">Sign in to access your workspace</h2><p className="mt-3 max-w-sm text-sm text-[var(--shield-text-dim)]">Your agent, journey, documents and tasks are private to your account.</p><button onClick={onSignIn} className="mt-6 rounded-full bg-[oklch(0.98_0.005_160)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Sign in / Create account</button></div>; }
