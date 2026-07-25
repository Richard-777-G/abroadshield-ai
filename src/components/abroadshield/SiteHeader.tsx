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
          ? "border-b border-[oklch(0.6_0.04_165/0.14)] bg-[oklch(0.145_0.012_235/0.8)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        {/* brand */}
        <a href="#top" className="group flex items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inset-0 rounded-lg bg-[oklch(0.74_0.17_162/0.16)] blur-md transition group-hover:bg-[oklch(0.74_0.17_162/0.28)]" />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)]">
              <Shield className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
            </span>
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-[var(--shield-text)]">
              AbroadShield
              <span className="ml-1 text-[oklch(0.74_0.17_162)]">AI</span>
            </div>
          </div>
        </a>

        {/* desktop nav — muted, recedes */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-[oklch(0.72_0.02_165)] transition hover:text-[oklch(0.98_0.005_160)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* desktop cta — ghost primary, discoverable not shouted */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#agent"
            className="rounded-full border border-[oklch(0.6_0.04_165/0.2)] px-4 py-2 text-[13px] font-medium text-[oklch(0.9_0.01_160)] transition hover:border-[oklch(0.55_0.02_235/0.35)] hover:bg-[oklch(0.24_0.028_165/0.5)]"
          >
            Talk to the agent
          </a>
          <a
            href="#pricing"
            className="rounded-full bg-[oklch(0.98_0.005_160)] px-4 py-2 text-[13px] font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-white"
          >
            Start free
          </a>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.24_0.028_165/0.5)] text-[var(--shield-text)] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-[oklch(0.6_0.04_165/0.14)] bg-[oklch(0.145_0.012_235/0.96)] backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[oklch(0.72_0.02_165)] transition hover:bg-[oklch(0.24_0.028_165/0.5)] hover:text-[oklch(0.98_0.005_160)]"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <a
                href="#agent"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-[oklch(0.6_0.04_165/0.2)] px-4 py-2.5 text-center text-sm font-medium text-[oklch(0.9_0.01_160)]"
              >
                Talk to the agent
              </a>
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-[oklch(0.98_0.005_160)] px-4 py-2.5 text-center text-sm font-semibold text-[oklch(0.14_0.018_165)]"
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
