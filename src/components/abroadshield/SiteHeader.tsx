"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface NavItem { id: string; label: string; }
type AuthMode = "login" | "signup";
interface Props {
  activeView: string;
  onViewChange: (id: string) => void;
  views: NavItem[];
  onTryAgent?: () => void;
  onAuthRequest?: (mode: AuthMode) => void;
}

export default function SiteHeader({ activeView, onViewChange, views, onTryAgent, onAuthRequest }: Props) {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = useCallback((id: string) => {
    onViewChange(id);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [onViewChange]);

  const requestAuth = useCallback((mode: AuthMode) => {
    setOpen(false);
    onAuthRequest?.(mode);
  }, [onAuthRequest]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setSigningOut(false);
    }
  }, []);

  const publicNav = views.filter((item) => ["home", "journey", "agent", "countries", "pricing"].includes(item.id));
  const authenticated = status === "authenticated" && Boolean(session?.user);
  const sessionLoading = status === "loading";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className={`mx-auto flex h-[56px] max-w-6xl items-center rounded-full border px-2.5 transition-all duration-500 sm:h-[60px] sm:px-4 ${scrolled ? "border-[var(--shield-border)] bg-[oklch(0.11_0.015_165/0.95)] shadow-[0_18px_60px_-28px_oklch(0_0_0/0.9)] backdrop-blur-2xl" : "border-white/10 bg-[oklch(0.11_0.015_165/0.72)] backdrop-blur-xl"}`}>
          <button type="button" onClick={() => handleNav("home")} className="group flex shrink-0 items-center gap-2.5" aria-label="AbroadShield home">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.45)] bg-[oklch(0.74_0.17_162/0.1)] sm:h-9 sm:w-9"><span className="absolute inset-0 rounded-xl bg-[oklch(0.74_0.17_162/0.18)] blur-lg" /><Shield className="relative h-4 w-4 text-[oklch(0.85_0.19_158)]" /></span>
            <span className="text-[14px] font-semibold tracking-tight text-[var(--shield-text)] sm:text-[15px]">AbroadShield<span className="text-[oklch(0.74_0.17_162)]"> AI</span></span>
          </button>

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
            {publicNav.map((item) => (
              <button type="button" key={item.id} onClick={() => handleNav(item.id)} className={`rounded-full px-3 py-2 text-[12px] font-medium transition ${activeView === item.id ? "bg-white/5 text-[var(--shield-text)]" : "text-[var(--shield-text-dim)] hover:bg-white/5 hover:text-[var(--shield-text)]"}`}>{item.label}</button>
            ))}
          </nav>

          <div className="ml-2 hidden items-center gap-2 lg:flex">
            {sessionLoading ? (
              <div className="h-8 w-24 animate-pulse rounded-full border border-[var(--shield-border)] bg-white/5" aria-label="Checking account status" />
            ) : authenticated ? (
              <>
                <button type="button" onClick={() => handleNav("dashboard")} className="rounded-full border border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.74_0.17_162/0.08)] px-3.5 py-2 text-[12px] font-semibold text-[oklch(0.85_0.19_158)]">Workspace</button>
                <button type="button" disabled={signingOut} onClick={handleSignOut} className="rounded-full border border-[var(--shield-border)] px-3.5 py-2 text-[12px] font-medium text-[var(--shield-text-dim)] hover:text-[var(--shield-text)] disabled:cursor-wait disabled:opacity-60">{signingOut ? "Signing out…" : "Sign out"}</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => requestAuth("login")} className="rounded-full px-3.5 py-2 text-[12px] font-medium text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]">Sign in</button>
                <button type="button" onClick={() => onTryAgent ? onTryAgent() : requestAuth("signup")} className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.98_0.005_160)] px-4 py-2 text-[12px] font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"><Zap className="h-3.5 w-3.5" />Start with the agent</button>
              </>
            )}
          </div>

          <button type="button" onClick={() => setOpen((v) => !v)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shield-border)] text-[var(--shield-text)] lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
      </header>

      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-x-3 top-[68px] z-50 rounded-3xl border border-[var(--shield-border)] bg-[oklch(0.11_0.015_165/0.98)] p-3 shadow-2xl backdrop-blur-2xl sm:inset-x-5 sm:top-20 lg:hidden">
          <nav className="space-y-1">
            {publicNav.map((item) => <button type="button" key={item.id} onClick={() => handleNav(item.id)} className="block w-full rounded-xl px-3 py-3 text-left text-sm text-[var(--shield-text-dim)] hover:bg-white/5 hover:text-[var(--shield-text)]">{item.label}</button>)}
            {!sessionLoading && authenticated ? (
              <div className="grid grid-cols-2 gap-2 border-t border-[var(--shield-border)] pt-3">
                <button type="button" onClick={() => handleNav("dashboard")} className="rounded-xl border border-[var(--shield-border)] px-4 py-3 text-sm font-medium">Workspace</button>
                <button type="button" disabled={signingOut} onClick={handleSignOut} className="rounded-xl border border-[var(--shield-border)] px-4 py-3 text-sm font-medium disabled:opacity-60">{signingOut ? "Signing out…" : "Sign out"}</button>
              </div>
            ) : !sessionLoading ? (
              <div className="grid grid-cols-2 gap-2 border-t border-[var(--shield-border)] pt-3">
                <button type="button" onClick={() => requestAuth("login")} className="rounded-xl border border-[var(--shield-border)] px-4 py-3 text-sm font-medium">Sign in</button>
                <button type="button" onClick={() => onTryAgent ? onTryAgent() : requestAuth("signup")} className="rounded-xl bg-[oklch(0.98_0.005_160)] px-4 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Start with the agent</button>
              </div>
            ) : <div className="mt-2 h-10 animate-pulse rounded-xl border border-[var(--shield-border)] bg-white/5" aria-label="Checking account status" />}
          </nav>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}
