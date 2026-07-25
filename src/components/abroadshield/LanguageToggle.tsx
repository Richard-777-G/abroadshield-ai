"use client";

import { useState, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LOCALES, HERO_STRINGS, type LocaleId } from "./data";

interface Props {
  locale: LocaleId;
  onChange: (l: LocaleId) => void;
}

export default function LanguageToggle({ locale, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-lang-toggle]")) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <div className="relative" data-lang-toggle>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.72_0.15_165/0.4)] bg-[oklch(0.72_0.15_165/0.08)] px-3 py-1.5 text-xs font-medium text-[oklch(0.82_0.16_165)] backdrop-blur transition hover:border-[oklch(0.72_0.15_165/0.6)] hover:bg-[oklch(0.72_0.15_165/0.15)]"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.nativeLabel}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-[var(--shield-border)] as-glass-strong p-1 shadow-2xl">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                onChange(l.id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                l.id === locale
                  ? "bg-[oklch(0.72_0.15_165/0.15)] text-[oklch(0.82_0.16_165)]"
                  : "text-[var(--shield-text)] hover:bg-[oklch(0.24_0.03_220/0.6)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{l.flag}</span>
                <span className="font-medium">{l.nativeLabel}</span>
              </span>
              {l.id === locale && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
          <div className="mt-1 border-t border-[var(--shield-border)] px-3 py-1.5 text-[10px] text-[var(--shield-text-dim)]">
            The agent speaks your language
          </div>
        </div>
      )}
    </div>
  );
}

export { HERO_STRINGS };
