"use client";

import { ArrowUpRight, Shield } from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

export default function SiteFooter({ onNavigate }: Props) {
  return (
    <footer className="border-t border-[var(--shield-border)] bg-[var(--shield-ink)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto_auto] md:items-start md:gap-14">
          <div>
            <button type="button" onClick={() => onNavigate("home")} className="group flex items-center gap-3 text-left">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.32)] bg-[oklch(0.74_0.17_162/0.07)]">
                <Shield className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-[var(--shield-text)]">AbroadShield AI</span>
                <span className="mt-0.5 block text-[10px] text-[var(--shield-text-faint)]">One context layer from study to career.</span>
              </span>
            </button>
            <p className="mt-4 max-w-sm text-[11px] leading-5 text-[var(--shield-text-faint)]">A product concept built around continuity, evidence and controlled agent workflows for international students.</p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px]" aria-label="Footer navigation">
            <button type="button" onClick={() => onNavigate("journey")} className="text-left text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]">How it works</button>
            <button type="button" onClick={() => onNavigate("countries")} className="text-left text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]">Country intelligence</button>
            <button type="button" onClick={() => onNavigate("pricing")} className="text-left text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]">Pricing direction</button>
            <button type="button" onClick={() => onNavigate("agent")} className="flex items-center gap-1 text-left text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]">Start with the agent <ArrowUpRight className="h-3 w-3" /></button>
          </nav>

          <div className="md:text-right">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Product status</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[oklch(0.12_0.015_165/.72)] px-3 py-1.5 text-[9px] font-semibold text-[var(--shield-text-dim)]"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />Building in public</div>
            <div className="mt-4 text-[10px] text-[var(--shield-text-faint)]">© {new Date().getFullYear()} AbroadShield AI</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
