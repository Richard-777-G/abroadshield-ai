"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewId } from "./ViewSwitcher";

interface Props {
  views: { id: ViewId; label: string; component: React.ReactNode }[];
  activeView: ViewId;
  onViewChange: (id: ViewId) => void;
}

/**
 * View renderer only — NO tab bar. The header nav drives view switching.
 * This component just renders the active view with a smooth transition.
 * Used internally by ViewSwitcher.
 */
export function ViewRenderer({ views, activeView }: Props) {
  const activeViewData = views.find((v) => v.id === activeView) ?? views[0];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {activeViewData.component}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Full view switcher with its own state — renders a tab bar.
 * NOT used anymore — the header nav drives switching. Kept for reference.
 */
export default function ViewSwitcher({ views, initialView = "journey" }: {
  views: { id: ViewId; label: string; component: React.ReactNode }[];
  initialView?: ViewId;
}) {
  const [active, setActive] = useState<ViewId>(initialView);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as ViewId;
      if (h && views.some((v) => v.id === h)) {
        setActive(h);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [views]);

  const switchView = useCallback((id: ViewId) => {
    setActive(id);
    if (typeof window !== "undefined") {
      history.replaceState(null, "", `#${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const activeView = views.find((v) => v.id === active) ?? views[0];

  return (
    <>
      {/* tab bar — sticky under the header */}
      <div className="sticky top-[68px] z-40 border-b border-[oklch(0.6_0.04_165/0.14)] bg-[oklch(0.14_0.018_165/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2 as-scroll">
          {views.map((v) => {
            const isActive = v.id === active;
            return (
              <button
                key={v.id}
                onClick={() => switchView(v.id)}
                className={`relative shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                  isActive
                    ? "text-[oklch(0.14_0.018_165)]"
                    : "text-[oklch(0.72_0.02_165)] hover:text-[oklch(0.98_0.005_160)]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-view-pill"
                    className="absolute inset-0 rounded-full bg-[oklch(0.74_0.17_162)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* active view — animated mount */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeView.component}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
