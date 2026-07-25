"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Zap, LogIn, type LucideIcon } from "lucide-react";
import AuthModal from "./AuthModal";
import type { ViewId } from "./ViewSwitcher";

interface NavItem {
  id: ViewId;
  label: string;
}

const NAV: NavItem[] = [
  { id: "journey", label: "Journey" },
  { id: "agent", label: "Agent" },
  { id: "countries", label: "Countries" },
  { id: "network", label: "Network" },
  { id: "connectors", label: "Connect" },
  { id: "pricing", label: "Pricing" },
];

interface Props {
  activeView: ViewId;
  onViewChange: (id: ViewId) => void;
}

export default function SiteHeader({ activeView, onViewChange }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = useCallback(
    (id: ViewId) => {
      onViewChange(id);
      setOpen(false);
      if (typeof window !== "undefined") {
        history.replaceState(null, "", `#${id}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [onViewChange]
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
        <div
          className={`flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl border px-3 transition-all duration-300 sm:px-4 ${
            scrolled
              ? "border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.14_0.018_165/0.9)] shadow-[0_8px_32px_-12px_oklch(0_0_0/0.6)] backdrop-blur-xl"
              : "border-[oklch(0.6_0.04_165/0.12)] bg-[oklch(0.14_0.018_165/0.6)] backdrop-blur-md"
          }`}
        >
          {/* brand */}
          <button
            onClick={() => handleNav("journey")}
            className="group flex items-center gap-2.5"
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute inset-0 rounded-lg bg-[oklch(0.74_0.17_162/0.25)] blur-md transition group-hover:bg-[oklch(0.74_0.17_162/0.4)]" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]">
                <Shield className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
              </span>
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--shield-text)]">
              AbroadShield<span className="ml-0.5 text-[oklch(0.74_0.17_162)]">AI</span>
            </span>
          </button>

          {/* desktop nav — view switcher pills */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-[oklch(0.6_0.04_165/0.12)] bg-[oklch(0.22_0.025_165/0.4)] p-0.5 lg:flex">
            {NAV.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                    isActive
                      ? "text-[oklch(0.14_0.018_165)]"
                      : "text-[oklch(0.72_0.02_165)] hover:text-[oklch(0.98_0.005_160)]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-pill"
                      className="absolute inset-0 rounded-full bg-[oklch(0.74_0.17_162)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* right side */}
          <div className="flex items-center gap-2">
            {/* agent status */}
            <span className="hidden items-center gap-1.5 rounded-full border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)] sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.74_0.17_162)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />
              </span>
              Agent live
            </span>
            {/* sign in */}
            <button
              onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
              className="hidden items-center gap-1.5 rounded-full border border-[var(--shield-border)] px-3 py-1.5 text-[12.5px] font-medium text-[oklch(0.9_0.01_160)] transition hover:border-[oklch(0.74_0.17_162/0.4)] hover:bg-[oklch(0.24_0.028_165/0.5)] sm:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </button>
            {/* primary CTA */}
            <button
              onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}
              className="hidden items-center gap-1.5 rounded-full bg-[oklch(0.98_0.005_160)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-white sm:inline-flex"
            >
              <Zap className="h-3.5 w-3.5" />
              Try the agent
            </button>
            {/* mobile toggle */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.24_0.028_165/0.5)] text-[var(--shield-text)] lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.14_0.018_165/0.96)] shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col gap-1 p-3">
              {NAV.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[oklch(0.74_0.17_162/0.15)] text-[oklch(0.85_0.19_158)]"
                        : "text-[oklch(0.72_0.02_165)] hover:bg-[oklch(0.74_0.17_162/0.08)] hover:text-[oklch(0.98_0.005_160)]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setOpen(false); setAuthMode("login"); setAuthOpen(true); }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--shield-border)] px-4 py-2.5 text-sm font-medium text-[oklch(0.9_0.01_160)]"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </button>
                <button
                  onClick={() => { setOpen(false); setAuthMode("signup"); setAuthOpen(true); }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.98_0.005_160)] px-4 py-2.5 text-sm font-semibold text-[oklch(0.14_0.018_165)]"
                >
                  <Zap className="h-4 w-4" />
                  Try agent
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* auth modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} />
    </>
  );
}
