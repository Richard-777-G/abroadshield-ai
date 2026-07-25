"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ViewId =
  | "journey"
  | "agent"
  | "countries"
  | "network"
  | "connectors"
  | "pricing";

interface Props {
  views: { id: ViewId; label: string; component: React.ReactNode }[];
  initialView?: ViewId;
}

/**
 * Header-driven view switcher — replaces the long vertical scroll with a
 * tabbed architecture. Clicking a header nav item mounts that specific
 * section view with a smooth directional cross-fade + slide.
 *
 * Supports deep-linking via the URL hash (#journey, #agent, etc.) so views
 * can be shared and bookmarked.
 */
export default function ViewSwitcher({ views, initialView = "journey" }: Props) {
  const [active, setActive] = useState<ViewId>(initialView);

  // sync with URL hash on mount + hash changes
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

  const switchView = useCallback(
    (id: ViewId) => {
      setActive(id);
      // update URL hash without jumping scroll
      if (typeof window !== "undefined") {
        history.replaceState(null, "", `#${id}`);
        // scroll to top of the view container
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    []
  );

  const activeView = views.find((v) => v.id === active) ?? views[0];
  const activeIndex = views.findIndex((v) => v.id === active);

  return (
    <>
      {/* tab bar — sticky under the header */}
      <div className="sticky top-16 z-40 border-b border-[oklch(0.6_0.04_165/0.14)] bg-[oklch(0.14_0.018_165/0.8)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-5 py-2 sm:px-8 as-scroll">
          {views.map((v, i) => {
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeView.component}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
