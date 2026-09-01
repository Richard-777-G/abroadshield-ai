import { Shield } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--shield-border)] bg-[oklch(0.13_0.018_165/0.72)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.08)]">
            <Shield className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
          </span>
          <div>
            <div className="text-xs font-semibold text-[var(--shield-text)]">AbroadShield AI</div>
            <div className="text-[10px] text-[var(--shield-text-faint)]">One agent for the journey.</div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[var(--shield-text-dim)]" aria-label="Footer">
          <a href="#journey" className="transition hover:text-[var(--shield-text)]">Journey</a>
          <a href="#countries" className="transition hover:text-[var(--shield-text)]">Countries</a>
          <a href="#pricing" className="transition hover:text-[var(--shield-text)]">Pricing</a>
          <a href="#top" className="transition hover:text-[var(--shield-text)]">Back to top</a>
        </nav>
        <p className="text-[10px] text-[var(--shield-text-faint)]">© {new Date().getFullYear()} AbroadShield AI</p>
      </div>
    </footer>
  );
}
