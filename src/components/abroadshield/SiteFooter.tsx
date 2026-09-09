"use client";

import { ArrowUpRight, Shield, ShieldCheck } from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

const LINKS = [
  ["journey", "How it works"],
  ["countries", "Country intelligence"],
  ["pricing", "Pricing direction"],
] as const;

export default function SiteFooter({ onNavigate }: Props) {
  return (
    <footer className="border-t border-[var(--shield-border)] bg-[var(--shield-ink)]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_auto_auto] md:items-start md:gap-14">
          <div className="max-w-md">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="group flex items-center gap-3 text-left focus-visible:outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.1)]">
                <Shield className="h-4 w-4 text-[var(--shield-emerald-bright)]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[var(--shield-text)]">
                  AbroadShield<span className="text-[var(--shield-emerald-bright)]"> AI</span>
                </span>
                <span className="mt-0.5 block text-xs text-[var(--shield-text-faint)]">
                  Autonomous 360° international student co-pilot.
                </span>
              </span>
            </button>
            <p className="mt-4 text-xs leading-relaxed text-[var(--shield-text-dim)]">
              Designed for the generation of students navigating an AI-driven global transition. Built with deterministic statutory policy verification and zero hallucinations.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs" aria-label="Footer navigation">
            {LINKS.map(([route, label]) => (
              <button
                key={route}
                type="button"
                onClick={() => onNavigate(route)}
                className="text-left text-[var(--shield-text-dim)] transition hover:text-white"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onNavigate("agent")}
              className="flex items-center gap-1 text-left font-semibold text-[var(--shield-emerald-bright)] transition hover:underline"
            >
              <span>Launch AI Agent</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </nav>

          <div className="md:text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--shield-text-faint)]">
              Product Integrity
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3.5 py-1.5 text-xs font-semibold text-[var(--shield-emerald-bright)]">
              <ShieldCheck className="h-4 w-4" />
              <span>Deterministic Statutory Engine</span>
            </div>
            <div className="mt-3 text-[11px] text-[var(--shield-text-faint)]">
              © {new Date().getFullYear()} AbroadShield AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
