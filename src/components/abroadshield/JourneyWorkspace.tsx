"use client";

import { useState } from "react";
import { Brain, CheckSquare, Map, Sparkles } from "lucide-react";
import JourneyIntelligence from "./JourneyIntelligence";
import StageRequirements from "./StageRequirements";
import StageWorkspace from "./StageWorkspace";

export default function JourneyWorkspace({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [tab, setTab] = useState<"strategy" | "requirements" | "stage">("strategy");
  const tabs = [
    { id: "strategy" as const, label: "Strategy", description: "Why this path and what is ahead", icon: Brain },
    { id: "requirements" as const, label: "Requirements", description: "What must be verified", icon: CheckSquare },
    { id: "stage" as const, label: "Stage workspace", description: "Plan and execute stage actions", icon: Map },
  ];

  return <section className="min-h-[calc(100vh-3.5rem)] bg-[var(--shield-ink)]">
    <div className="sticky top-14 z-40 border-b border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/0.94)] px-5 py-3 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.74_0.17_162)]"><Sparkles className="h-3 w-3"/>Journey control</div><div className="mt-1 text-sm font-semibold">One journey. One workspace.</div></div>
        <div className="flex w-full gap-1 overflow-x-auto rounded-xl border border-[var(--shield-border)] bg-[oklch(0.09_0.012_165/0.7)] p-1 lg:w-auto">{tabs.map(({id,label,description,icon:Icon})=><button key={id} type="button" onClick={()=>setTab(id)} aria-current={tab===id?"page":undefined} className={`flex min-w-[150px] items-center gap-2 rounded-lg px-3 py-2 text-left transition ${tab===id?"bg-[oklch(0.74_0.17_162/0.12)] text-[var(--shield-text)]":"text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"}`}><Icon className="h-4 w-4 shrink-0"/><span><span className="block text-[10px] font-semibold">{label}</span><span className="hidden text-[8px] text-[var(--shield-text-faint)] xl:block">{description}</span></span></button>)}</div>
      </div>
    </div>
    <div>{tab==="strategy"&&<JourneyIntelligence/>}{tab==="requirements"&&<StageRequirements/>}{tab==="stage"&&<StageWorkspace onNavigate={onNavigate}/>}</div>
  </section>;
}
