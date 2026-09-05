"use client";

import { ArrowRight, Bot, Layers3, Network, Sparkles, Target } from "lucide-react";
import Reveal from "./Reveal";
import JourneyEngine3D from "./JourneyEngine3D";

const PHASES = [
  ["01", "Choose the move", "Destination, course, university fit and career target become one working context."],
  ["02", "Secure the move", "Applications, funding, visa and deadlines are sequenced around your route."],
  ["03", "Build career capital", "Skills, projects, evidence and network turn study time into career leverage."],
  ["04", "Land the role", "Target roles, employers, applications and interviews connect back to the outcome."],
] as const;

const SIGNALS = [
  ["Profile", "Who you are and what you want", "01"],
  ["Destination", "Where the route is headed", "02"],
  ["Evidence", "What is verified and missing", "03"],
  ["Career", "What outcome the journey is building toward", "04"],
] as const;

export default function HomeShowcase({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return <>
    <section className="as-public-section">
      <div className="as-public-container">
        <Reveal className="max-w-3xl">
          <Eyebrow><Layers3 className="h-3.5 w-3.5" />Why this exists</Eyebrow>
          <h2 className="as-public-title mt-3 text-3xl sm:text-4xl">The problem is not a lack of information. It is a lack of continuity.</h2>
          <p className="as-public-copy mt-4 max-w-2xl">Students move between university portals, spreadsheets, consultants, email, visa checklists, job boards and networking tools. Each system sees one slice. AbroadShield is designed around the journey itself.</p>
        </Reveal>
        <div className="mt-7 grid gap-3 lg:grid-cols-2">
          {SIGNALS.map(([title, detail, n]) => <div key={title} className="as-public-card as-public-card--quiet flex items-start gap-4 p-4">
            <span className="font-mono text-[9px] text-[var(--shield-text-faint)]">{n}</span>
            <div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</div></div>
          </div>)}
        </div>
      </div>
    </section>

    <section className="as-public-section">
      <div className="as-public-container">
        <Reveal>
          <div className="mb-6 max-w-2xl">
            <Eyebrow><Bot className="h-3.5 w-3.5" />Product engine</Eyebrow>
            <h2 className="as-public-title mt-3 text-3xl sm:text-4xl">Your AI should understand the route.</h2>
            <p className="as-public-copy mt-3">Context enters the engine. The journey sets priority. Evidence informs the next move. You stay in control.</p>
          </div>
          <JourneyEngine3D />
        </Reveal>
      </div>
    </section>

    <section className="as-public-section">
      <div className="as-public-container">
        <Reveal className="max-w-3xl">
          <Eyebrow><Target className="h-3.5 w-3.5" />The full journey</Eyebrow>
          <h2 className="as-public-title mt-3 text-3xl sm:text-4xl">Four phases. One evolving strategy.</h2>
          <p className="as-public-copy mt-3">The route stays visible while the current mission changes.</p>
        </Reveal>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map(([n, title, detail]) => <button key={n} type="button" onClick={() => onNavigate?.("journey")} className="as-public-card as-public-card--quiet group p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--shield-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--shield-emerald)]/50">
            <div className="text-[9px] font-semibold tracking-[.18em] text-[var(--shield-text-faint)]">{n}</div>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.13em] text-[var(--shield-emerald-bright)]">See the route <ArrowRight className="h-3 w-3" /></span>
          </button>)}
        </div>
      </div>
    </section>

    <section className="as-public-section">
      <div className="as-public-container">
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
            <div className="as-public-card as-public-card--raised p-6 sm:p-7">
              <Eyebrow><Network className="h-3.5 w-3.5" />Future ecosystem</Eyebrow>
              <h2 className="as-public-title mt-3 text-2xl sm:text-3xl">A coordination layer can connect more of the journey over time.</h2>
              <p className="as-public-copy mt-4 max-w-xl">Potential integrations could extend the agent into preparation, relocation and career workflows. This is a product direction, not a claim of signed partnerships or current marketplace traction.</p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Mini title="Study" detail="Courses · universities" />
                <Mini title="Move" detail="Visa · housing" />
                <Mini title="Career" detail="Jobs · network" />
                <Mini title="Services" detail="Potential partners" />
              </div>
            </div>
            <div className="as-public-card as-public-card--focus flex flex-col justify-between p-6">
              <div>
                <Eyebrow><Sparkles className="h-3.5 w-3.5" />Product principle</Eyebrow>
                <h3 className="as-public-title mt-3 text-xl">More connected does not mean less controlled.</h3>
                <p className="as-public-copy mt-3">The agent can research, reason and prepare. Consequential external actions remain approval-gated.</p>
              </div>
              <button type="button" onClick={() => onNavigate?.("agent")} className="as-public-button-primary mt-5 w-fit">Open the agent <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  </>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="as-public-eyebrow">{children}</div>;
}

function Mini({ title, detail }: { title: string; detail: string }) {
  return <div className="as-public-card as-public-card--quiet p-3"><div className="text-xs font-semibold">{title}</div><div className="mt-1 text-[9px] text-[var(--shield-text-faint)]">{detail}</div></div>;
}
