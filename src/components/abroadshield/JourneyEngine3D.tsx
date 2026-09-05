"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BrainCircuit, BriefcaseBusiness, FileText, Globe2, ShieldCheck } from "lucide-react";
import { useRef } from "react";

const STREAMS = [
  { label: "Profile", sub: "Student context", icon: FileText, depth: 0 },
  { label: "Destination", sub: "Country + study fit", icon: Globe2, depth: 1 },
  { label: "Evidence", sub: "Documents + signals", icon: ShieldCheck, depth: 2 },
  { label: "Career", sub: "Skills + roles", icon: BriefcaseBusiness, depth: 3 },
];

export default function JourneyEngine3D() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 100, damping: 20 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <div ref={ref} onPointerMove={handlePointerMove} onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }} className="relative overflow-hidden rounded-[26px] border border-[oklch(0.74_0.17_162/.16)] bg-[radial-gradient(circle_at_50%_42%,oklch(0.25_0.03_165/.5),oklch(0.10_0.013_165/.96)_68%)] p-4 sm:p-5" style={{ perspective: 1200 }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(oklch(0.98_0.005_160/.025)_1px,transparent_1px),linear-gradient(90deg,oklch(0.98_0.005_160/.025)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_82%)]" />

      <div className="relative z-10 flex items-center justify-between px-1">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[.2em] text-[oklch(0.85_0.19_158)]">Journey engine</div>
          <div className="mt-1 text-[11px] text-[var(--shield-text-faint)]">One context layer connecting the route.</div>
        </div>
        <div className="hidden rounded-full border border-[var(--shield-border)] bg-[oklch(0.08_0.012_165/.7)] px-2.5 py-1 text-[8px] font-semibold text-[var(--shield-text-faint)] sm:block">product concept</div>
      </div>

      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative mx-auto mt-3 h-[300px] max-w-[620px] sm:h-[330px]">
        <motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.74_0.17_162/.10)] [transform:translateZ(-40px)] sm:h-[240px] sm:w-[240px]" animate={{ rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }} />
        <motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[168px] w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[oklch(0.82_0.13_210/.10)] [transform:translateZ(-20px)] sm:h-[190px] sm:w-[190px]" animate={{ rotate: -360 }} transition={{ duration: 27, repeat: Infinity, ease: "linear" }} />

        {STREAMS.map(({ label, sub, icon: Icon, depth }, index) => (
          <motion.div key={label} className={`absolute z-20 ${index === 0 ? "left-[1%] top-[8%]" : index === 1 ? "right-[1%] top-[16%]" : index === 2 ? "left-[3%] bottom-[9%]" : "right-[3%] bottom-[2%]"} w-[145px] rounded-xl border border-[var(--shield-border)] bg-[oklch(0.08_0.012_165/.82)] p-2.5 shadow-[0_18px_60px_oklch(0.04_0.01_165/.4)] backdrop-blur-xl sm:w-[160px]`} style={{ transform: `translateZ(${30 + depth * 10}px)` }} animate={{ y: [0, index % 2 ? -4 : 4, 0] }} transition={{ duration: 4.5 + index * .35, repeat: Infinity, ease: "easeInOut", delay: index * .12 }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/.20)] bg-[oklch(0.74_0.17_162/.06)]"><Icon className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" /></div>
              <div className="min-w-0"><div className="truncate text-[9px] font-semibold">{label}</div><div className="truncate text-[8px] text-[var(--shield-text-faint)]">{sub}</div></div>
            </div>
          </motion.div>
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]">
          <motion.div className="relative flex h-[168px] w-[168px] items-center justify-center rounded-full border border-[oklch(0.85_0.19_158/.18)] bg-[radial-gradient(circle_at_35%_30%,oklch(0.85_0.19_158/.15),oklch(0.74_0.17_162/.05)_52%,transparent_72%)] [transform:translateZ(28px)] sm:h-[190px] sm:w-[190px]" animate={{ scale: [1, 1.018, 1] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
            <div className="absolute inset-[15%] rounded-full border border-[oklch(0.74_0.17_162/.20)]" />
            <div className="absolute inset-[23%] rounded-full border border-dashed border-[oklch(0.82_0.13_210/.12)]" />
            <div className="relative z-10 w-[112px] rounded-2xl border border-[oklch(0.98_0.005_160/.13)] bg-[oklch(0.06_0.01_165/.82)] p-3 text-center shadow-[0_25px_70px_oklch(0.04_0.01_165/.6)] backdrop-blur-2xl sm:w-[124px]">
              <BrainCircuit className="mx-auto h-5 w-5 text-[oklch(0.85_0.19_158)]" />
              <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[.15em]">AbroadShield</div>
              <div className="mt-1 text-[7px] leading-3.5 text-[var(--shield-text-faint)]">Reason across the route</div>
            </div>
          </motion.div>
        </div>

        <motion.div aria-hidden className="absolute left-1/2 top-[14%] h-[58%] w-px origin-top bg-gradient-to-b from-transparent via-[oklch(0.85_0.19_158/.25)] to-transparent [transform:translateX(-50%)_rotate(32deg)_translateZ(12px)]" animate={{ opacity: [.16, .6, .16] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="absolute left-1/2 top-[14%] h-[58%] w-px origin-top bg-gradient-to-b from-transparent via-[oklch(0.82_0.13_210/.16)] to-transparent [transform:translateX(-50%)_rotate(-32deg)_translateZ(12px)]" animate={{ opacity: [.5, .12, .5] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.07_0.011_165/.55)] px-3 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[.15em] text-[var(--shield-text-faint)]"><span className="text-[oklch(0.85_0.19_158)]">Understand</span><span>→</span><span>Sequence</span><span>→</span><span>Act</span><span>→</span><span>Learn</span></div>
        <div className="text-[8px] text-[var(--shield-text-faint)]">Student stays in control.</div>
      </div>
    </div>
  );
}
