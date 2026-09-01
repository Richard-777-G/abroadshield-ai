"use client";

/**
 * Lightweight global background.
 * This component is mounted on every page, so it must not pull Framer Motion
 * or a large animation tree into the initial client experience.
 */
export default function ClientFloatingBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_70%_20%,oklch(0.18_0.025_165),oklch(0.13_0.018_165)_55%,oklch(0.11_0.015_165))]" />
      <div
        className="as-bg-grid absolute inset-0 opacity-20"
        style={{ backgroundSize: "64px 64px" }}
      />
      <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-[oklch(0.74_0.17_162/0.10)] blur-3xl" />
      <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-[oklch(0.86_0.20_135/0.07)] blur-3xl" />
      <div className="as-noise absolute inset-0 opacity-40" />
    </div>
  );
}
