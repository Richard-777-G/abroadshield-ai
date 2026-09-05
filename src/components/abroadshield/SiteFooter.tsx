"use client";

import { ArrowUpRight, Shield } from "lucide-react";

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
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start md:gap-12">
          <div className="max-w-md">
            <button type="button" onClick={() => onNavigate("home")} className="group flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.74_0.17_162/.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--shield-ink)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/.26)] bg-[oklch(0.74_0.17_162/.06)]">
                <Shield className="h-4 w-4 text-[oklch(0.85_0.19_158)]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-[var(--shield-text)]">AbroadShield AI</span>
                <span className="mt-0.5 block text-[10px] text-[var(--shield-text-faint)]">One context layer from study to career.</span>
              </span>
            </button>
            <p className="mt-3 text-[11px] leading-5 text-[var(--shield-text-faint)]">A product concept built around continuity, evidence and controlled agent workflows for international students.</p>
          </div>

          <nav className="grid grid-cols-2 gap-x-7 gap-y-2 text-[11px]" aria-label="Footer navigation">
            {LINKS.map(([route, label]) => (
              <button key={route} type="button" onClick={() => onNavigate(route)} className="text-left text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)] focus-visible:outline-none focus-visible:text-[var(--shield-text)]">
                {label}
              </button>
            ))}
            <button type="button" onClick={() => onNavigate("agent")} className="flex items-center gap-1 text-left text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)] focus-visible:outline-none focus-visible:text-[var(--shield-text)]">
              Start with the agent <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </nav>

          <div className="md:text-right">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Product status</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[oklch(0.12_0.015_165/.72)] px-3 py-1.5 text-[9px] font-semibold text-[var(--shield-text-dim)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" aria-hidden="true" />
              Building in public
            </div>
            <div className="mt-3 text-[10px] text-[var(--shield-text-faint)]">© {new Date().getFullYear()} AbroadShield AI</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
