"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ViewId } from "./ViewSwitcher";

interface Props {
  views: { id: ViewId; label: string; component: React.ReactNode }[];
  activeView: ViewId;
  onViewChange?: (id: ViewId) => void;
}

/**
 * View renderer only. Navigation is owned by the site header;
 * this component intentionally contains no second tab/navigation system.
 */
export function ViewRenderer({ views, activeView }: Props) {
  const activeViewData = views.find((v) => v.id === activeView) ?? views[0];

  if (!activeViewData) return null;

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

export default ViewRenderer;
