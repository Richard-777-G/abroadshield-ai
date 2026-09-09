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
    const onScroll = () => setScrolled(window.scrollY > 24);
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
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        <div
          className={`mx-auto flex h-[58px] max-w-6xl items-center rounded-full border px-3 transition-all duration-300 sm:h-[62px] sm:px-5 ${
            scrolled
              ? "as-dock border-[oklch(0.35_0.03_255/0.5)] shadow-2xl"
              : "border-white/10 bg-[oklch(0.12_0.015_255/0.75)] backdrop-blur-xl"
          }`}
        >
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="AbroadShield home"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] sm:h-9 sm:w-9">
              <span className="absolute inset-0 rounded-xl bg-[oklch(0.76_0.18_160/0.15)] blur-md" />
              <Shield className="relative h-4 w-4 text-[var(--shield-emerald-bright)]" />
            </span>
            <span className="text-[14px] font-bold tracking-tight text-[var(--shield-text)] sm:text-[15px]">
              AbroadShield<span className="text-[var(--shield-emerald-bright)]"> AI</span>
            </span>
          </button>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                  activeView === item.id
                    ? "bg-white/10 text-white"
                    : "text-[var(--shield-text-dim)] hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-3 hidden items-center gap-2 lg:flex">
            {sessionLoading ? (
              <div
                className="h-8 w-24 animate-pulse rounded-full border border-[var(--shield-border)] bg-white/5"
                aria-label="Checking account status"
              />
            ) : authenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNav("agent")}
                  className="rounded-full border border-[var(--shield-emerald)]/40 bg-[var(--shield-emerald)]/10 px-4 py-2 text-[12px] font-bold text-[var(--shield-emerald-bright)] shadow-sm transition hover:bg-[var(--shield-emerald)]/20"
                >
                  Open AI Co-Pilot
                </button>
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={handleSignOut}
                  className="rounded-full border border-[var(--shield-border)] px-3.5 py-2 text-[12px] font-medium text-[var(--shield-text-dim)] hover:text-white disabled:opacity-60"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => requestAuth("login")}
                  className="rounded-full px-3.5 py-2 text-[12px] font-medium text-[var(--shield-text-dim)] hover:text-white"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => (onTryAgent ? onTryAgent() : requestAuth("signup"))}
                  className="as-public-button-primary rounded-full px-4 py-2 text-[12px]"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>Start with Agent</span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shield-border)] text-[var(--shield-text)] lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-3 top-[68px] z-50 rounded-3xl border border-[var(--shield-border)] as-dock p-4 shadow-2xl sm:inset-x-5 sm:top-20 lg:hidden"
          >
            <nav className="space-y-1">
              {publicNav.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm text-[var(--shield-text-dim)] hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
              {!sessionLoading && authenticated ? (
                <div className="grid grid-cols-2 gap-2 border-t border-[var(--shield-border)] pt-3">
                  <button
                    type="button"
                    onClick={() => handleNav("dashboard")}
                    className="as-public-button-primary rounded-xl px-4 py-2.5 text-xs font-semibold"
                  >
                    AI Workspace
                  </button>
                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    className="as-public-button-secondary rounded-xl px-4 py-2.5 text-xs font-semibold"
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              ) : !sessionLoading ? (
                <div className="grid grid-cols-2 gap-2 border-t border-[var(--shield-border)] pt-3">
                  <button
                    type="button"
                    onClick={() => requestAuth("login")}
                    className="as-public-button-secondary rounded-xl px-4 py-2.5 text-xs font-semibold"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => (onTryAgent ? onTryAgent() : requestAuth("signup"))}
                    className="as-public-button-primary rounded-xl px-4 py-2.5 text-xs font-semibold"
                  >
                    Start with Agent
                  </button>
                </div>
              ) : null}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
