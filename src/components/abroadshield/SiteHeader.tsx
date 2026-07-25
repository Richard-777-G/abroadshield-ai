"use client";

import { useEffect, useState } from "react";
import { Shield, Menu, X, Zap, Globe, LogIn } from "lucide-react";
import AuthModal from "./AuthModal";

const NAV = [
  { label: "Journey", href: "#journey" },
  { label: "Agent", href: "#agent" },
  { label: "Countries", href: "#countries" },
  { label: "Network", href: "#network" },
  { label: "Connect", href: "#connectors" },
  { label: "Pricing", href: "#pricing" },
];

export default function SiteHeader() {
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <div
        className={`flex h-14 w-full max-w-5xl items-center justify-between rounded-2xl border px-3 transition-all duration-300 sm:px-4 ${
          scrolled
            ? "border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.14_0.018_165/0.85)] shadow-[0_8px_32px_-12px_oklch(0_0_0/0.5)] backdrop-blur-xl"
            : "border-[oklch(0.6_0.04_165/0.1)] bg-[oklch(0.14_0.018_165/0.5)] backdrop-blur-md"
        }`}
      >
        {/* brand — compact + credible */}
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inset-0 rounded-lg bg-[oklch(0.74_0.17_162/0.2)] blur-md transition group-hover:bg-[oklch(0.74_0.17_162/0.35)]" />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]">
              <Shield className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
            </span>
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--shield-text)]">
            AbroadShield<span className="ml-0.5 text-[oklch(0.74_0.17_162)]">AI</span>
          </span>
        </a>

        {/* desktop nav — pill style */}
        <nav className="hidden items-center gap-0.5 rounded-full border border-[oklch(0.6_0.04_165/0.12)] bg-[oklch(0.22_0.025_165/0.4)] p-0.5 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-[oklch(0.72_0.02_165)] transition hover:bg-[oklch(0.74_0.17_162/0.12)] hover:text-[oklch(0.98_0.005_160)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* right side — agent status + CTA */}
        <div className="flex items-center gap-2">
          {/* live agent status badge */}
          <span className="hidden items-center gap-1.5 rounded-full border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)] sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.74_0.17_162)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />
            </span>
            Agent live
          </span>
          {/* sign in link */}
          <button
            onClick={() => { setAuthMode("login"); setAuthOpen(true); }}
            className="hidden items-center gap-1.5 rounded-full border border-[var(--shield-border)] px-3 py-1.5 text-[12.5px] font-medium text-[oklch(0.9_0.01_160)] transition hover:border-[oklch(0.74_0.17_162/0.4)] hover:bg-[oklch(0.24_0.028_165/0.5)] sm:inline-flex"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </button>
          {/* primary CTA — opens signup modal */}
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.24_0.028_165/0.5)] text-[var(--shield-text)] md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* mobile menu — sliding panel */}
      {open && (
        <div className="absolute inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.14_0.018_165/0.96)] shadow-2xl backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 p-3">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[oklch(0.72_0.02_165)] transition hover:bg-[oklch(0.74_0.17_162/0.1)] hover:text-[oklch(0.98_0.005_160)]"
              >
                <Globe className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                {item.label}
              </a>
            ))}
            <a
              href="#agent"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.98_0.005_160)] px-4 py-2.5 text-sm font-semibold text-[oklch(0.14_0.018_165)]"
            >
              <Zap className="h-4 w-4" />
              Try the agent
            </a>
            <button
              onClick={() => { setOpen(false); setAuthMode("login"); setAuthOpen(true); }}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--shield-border)] px-4 py-2.5 text-sm font-medium text-[oklch(0.9_0.01_160)]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
          </nav>
        </div>
      )}

      {/* auth modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} />
    </header>
  );
}
