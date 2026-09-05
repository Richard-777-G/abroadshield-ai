"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, BrainCircuit, BriefcaseBusiness, FileText, Globe2, Layers3, LockKeyhole, Network, Route, ShieldCheck } from "lucide-react";
import { useRef } from "react";

const STREAMS = [
  { label: "Profile", sub: "Student context", icon: FileText, depth: 0 },
  { label: "Destination", sub: "Country + study fit", icon: Globe2, depth: 1 },
  { label: "Evidence", sub: "Documents + signals", icon: ShieldCheck, depth: 2 },
  { label: "Career", sub: "Skills + roles", icon: BriefcaseBusiness, depth: 3 },
];

const STEPS = ["Understand", "Sequence", "Act", "Learn"];

export default function JourneyEngine3D() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 90, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), { stiffness: 90, damping: 18 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative min-h-[560px] overflow-hidden rounded-[34px] border border-[oklch(0.74_0.17_162/.17)] bg-[radial-gradient(circle_at_50%_35%,oklch(0.28_0.035_165/.48),oklch(0.10_0.013_165/.96)_62%)] p-4 sm:min-h-[640px] sm:p-7"
      style={{ perspective: 1400 }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(oklch(0.98_0.005_160/.035)_1px,transparent_1px),linear-gradient(90deg,oklch(0.98_0.005_160/.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_82%)]" />
      <motion.div aria-hidden className="pointer-events-none absolute -left-24 top-1/3 h-56 w-56 rounded-full bg-[oklch(0.74_0.17_162/.12)] blur-3xl" animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="pointer-events-none absolute -right-16 bottom-10 h-52 w-52 rounded-full bg-[oklch(0.82_0.13_210/.08)] blur-3xl" animate={{ x: [0, -26, 0], y: [0, 18, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative z-10 flex items-center justify-between px-2 py-1 sm:px-3">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[.22em] text-[oklch(0.85_0.19_158)]">Journey engine</div>
          <div className="mt-1 text-xs text-[var(--shield-text-faint)]">Context becomes an operating system.</div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.08_0.012_165/.62)] px-3 py-1.5 text-[9px] font-semibold text-[var(--shield-text-dim)] backdrop-blur-xl">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.74_0.17_162)]" />
          live concept
        </div>
      </div>

      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative mx-auto mt-8 h-[420px] max-w-[590px] sm:mt-10 sm:h-[500px]">
        <motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.74_0.17_162/.11)] [transform:translateZ(-90px)] sm:h-[410px] sm:w-[410px]" animate={{ rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }} />
        <motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[oklch(0.82_0.13_210/.12)] [transform:translateZ(-40px)] sm:h-[320px] sm:w-[320px]" animate={{ rotate: -360 }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} />

        {STREAMS.map(({ label, sub, icon: Icon, depth }, index) => (
          <motion.div
            key={label}
            className={`absolute ${index === 0 ? "left-[2%] top-[14%]" : index === 1 ? "right-[2%] top-[23%]" : index === 2 ? "left-[6%] bottom-[11%]" : "right-[6%] bottom-[6%]"} w-[160px] rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.09_0.012_165/.78)] p-3 shadow-2xl backdrop-blur-xl sm:w-[182px]`}
            style={{ transform: `translateZ(${70 + depth * 25}px)` }}
            animate={{ y: [0, index % 2 ? -8 : 7, 0] }}
            transition={{ duration: 4.6 + index * .4, repeat: Infinity, ease: "easeInOut", delay: index * .15 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/.22)] bg-[oklch(0.74_0.17_162/.07)]"><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /></div>
              <div><div className="text-[10px] font-semibold">{label}</div><div className="text-[8px] text-[var(--shield-text-faint)]">{sub}</div></div>
            </div>
          </motion.div>
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]">
          <motion.div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-[oklch(0.85_0.19_158/.22)] bg-[radial-gradient(circle_at_35%_30%,oklch(0.85_0.19_158/.20),oklch(0.74_0.17_162/.08)_46%,transparent_72%)] [transform:translateZ(40px)]" animate={{ scale: [1, 1.025, 1] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="absolute inset-[15%] rounded-full border border-[oklch(0.74_0.17_162/.26)]" />
            <div className="absolute inset-[23%] rounded-full border border-dashed border-[oklch(0.82_0.13_210/.16)]" />
            <motion.div className="absolute h-16 w-16 rounded-2xl bg-[oklch(0.85_0.19_158/.12)] blur-xl" animate={{ scale: [0.9, 1.25, 0.9], opacity: [.55, .9, .55] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
            <div className="relative z-10 flex h-[124px] w-[124px] flex-col items-center justify-center rounded-[30px] border border-[oklch(0.98_0.005_160/.16)] bg-[oklch(0.06_0.01_165/.84)] p-4 shadow-[0_30px_90px_oklch(0.05_0.02_165/.72)] backdrop-blur-2xl">
              <BrainCircuit className="h-7 w-7 text-[oklch(0.85_0.19_158)]" />
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[.18em]">AbroadShield</div>
              <div className="mt-1 text-center text-[8px] leading-4 text-[var(--shield-text-faint)]">Reason across the whole route</div>
            </div>
          </motion.div>
        </div>

        <motion.div className="absolute left-1/2 top-[9%] h-[76%] w-px origin-top bg-gradient-to-b from-transparent via-[oklch(0.85_0.19_158/.28)] to-transparent [transform:translateX(-50%)_rotate(34deg)_translateZ(20px)]" animate={{ opacity: [.18, .75, .18] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute left-1/2 top-[10%] h-[76%] w-px origin-top bg-gradient-to-b from-transparent via-[oklch(0.82_0.13_210/.2)] to-transparent [transform:translateX(-50%)_rotate(-34deg)_translateZ(20px)]" animate={{ opacity: [.55, .12, .55] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>

      <div className="relative z-10 mt-1 grid gap-3 sm:mt-0 sm:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.07_0.011_165/.62)] p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-[var(--shield-text-faint)]"><Route className="h-3.5 w-3.5" />Operating loop</div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">{STEPS.map((step, index) => <motion.div key={step} className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/.66)] p-2 text-center" whileHover={{ y: -3 }}><div className="text-[8px] font-bold text-[oklch(0.85_0.19_158)]">0{index + 1}</div><div className="mt-1 text-[8px] text-[var(--shield-text-dim)]">{step}</div></motion.div>)}</div>
        </div>
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.07_0.011_165/.62)] p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-[var(--shield-text-faint)]"><LockKeyhole className="h-3.5 w-3.5" />Control layer</div>
          <p className="mt-3 text-[9px] leading-5 text-[var(--shield-text-dim)]">The agent can reason, prepare and recommend. External actions remain gated until permission is explicit.</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[8px] font-semibold text-[oklch(0.85_0.19_158)]">Human in the loop <ArrowUpRight className="h-3 w-3" /></div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[.22em] text-[var(--shield-text-faint)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">move your pointer to explore the system</div>
    </div>
  );
}
