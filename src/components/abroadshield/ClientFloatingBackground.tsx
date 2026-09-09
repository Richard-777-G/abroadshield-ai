"use client";

/**
 * High-performance global obsidian canvas background.
 * Free of random glowing blobs; uses clean geometric grid lines and subtle ambient depth.
 */
export default function ClientFloatingBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--shield-ink)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_-10%,oklch(0.18_0.022_255/0.8),transparent_70%)]" />
      <div
        className="as-bg-grid absolute inset-0 opacity-25"
        style={{ backgroundSize: "56px 56px" }}
      />
      <div className="as-noise absolute inset-0 opacity-25" />
    </div>
  );
}
