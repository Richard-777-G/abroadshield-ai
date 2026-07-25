"use client";

import dynamic from "next/dynamic";

/**
 * Client-only loader for FloatingBackground — avoids SSR hydration mismatch
 * caused by useReducedMotion() (which reads prefers-reduced-motion and
 * returns null on the server). The background renders only on the client.
 */
const FloatingBackground = dynamic(() => import("./FloatingBackground"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(120% 100% at 70% 20%, oklch(0.18 0.025 165), oklch(0.13 0.018 165) 55%, oklch(0.11 0.015 165))",
      }}
    />
  ),
});

export default function ClientFloatingBackground() {
  return <FloatingBackground />;
}
