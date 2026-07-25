"use client";

import { useEffect, useState } from "react";
import { Shield, Menu, X } from "lucide-react";

const NAV = [
  { label: "Journey", href: "#journey" },
  { label: "Agent", href: "#agent" },
  { label: "Memory", href: "#memory" },
  { label: "Countries", href: "#countries" },
  { label: "Pricing", href: "#pricing" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--shield-border)] bg-[oklch(0.16_0.02_220/0.85)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* brand */}
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-xl bg-[oklch(0.72_0.15_165/0.2)] blur-sm transition group-hover:bg-[oklch(0.72_0.15_165/0.35)]" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.72_0.15_165/0.5)] bg-[oklch(0.72_0.15_165/0.12)]">
              <Shield className="h-4.5 w-4.5 text-[oklch(0.82_0.16_165)]" />
            </span>
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-[var(--shield-text)]">
              AbroadShield
              <span className="ml-1 text-[oklch(0.72_0.15_165)]">AI</span>
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[oklch(0.6_0.02_200)]">
              One agent · four phases
            </div>
          </div>
        </a>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-[var(--shield-text-dim)] transition hover:bg-[oklch(0.24_0.03_220/0.6)] hover:text-[var(--shield-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* desktop cta */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#agent"
            className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] px-4 py-2 text-sm font-medium text-[var(--shield-text)] transition hover:border-[oklch(0.72_0.15_165/0.4)]"
          >
            Talk to the agent
          </a>
          <a
            href="#pricing"
            className="rounded-full bg-[oklch(0.72_0.15_165)] px-4 py-2 text-sm font-semibold text-[oklch(0.16_0.02_220)] transition hover:bg-[oklch(0.82_0.16_165)]"
          >
            Start free
          </a>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] text-[var(--shield-text)] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-[var(--shield-border)] bg-[oklch(0.16_0.02_220/0.95)] backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--shield-text-dim)] transition hover:bg-[oklch(0.24_0.03_220/0.6)] hover:text-[var(--shield-text)]"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <a
                href="#agent"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] px-4 py-2.5 text-center text-sm font-medium text-[var(--shield-text)]"
              >
                Talk to the agent
              </a>
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-[oklch(0.72_0.15_165)] px-4 py-2.5 text-center text-sm font-semibold text-[oklch(0.16_0.02_220)]"
              >
                Start free
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
