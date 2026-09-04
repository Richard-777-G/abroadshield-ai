"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, CheckCircle2, FileText, Map, Sparkles, Target, UploadCloud } from "lucide-react";
import { useProfileStore } from "./profileStore";
import AgentChat from "./AgentChat";

const stages = [
  { n: "01", title: "Define the path", body: "Goal, destination, course, university fit and constraints." },
  { n: "02", title: "Secure the move", body: "Applications, funding, visa and pre-departure decisions." },
  { n: "03", title: "Build career capital", body: "Projects, skills, networking and relevant experience during study." },
  { n: "04", title: "Land the role", body: "Target employers, applications, interviews and full-time conversion." },
];

export default function JourneyWorkspace({ onNavigate: _onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile, setProfile } = useProfileStore();
  const [view, setView] = useState<"blueprint" | "cv" | "pilot">("blueprint");
  const [goal, setGoal] = useState(profile.careerGoal);
  const [universities, setUniversities] = useState(profile.preferredUniversities);
  const [cv, setCv] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const saveStrategy = async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/abroadshield/journey", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ careerGoal: goal.trim(), preferredUniversities: universities.trim() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not save your strategy.");
      setProfile({ careerGoal: goal.trim(), preferredUniversities: universities.trim(), ...(data.profile || {}) });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save your strategy."); }
    finally { setBusy(false); }
  };

  const analyzeCv = async () => {
    if (cv.trim().length < 80 || busy) return;
    setBusy(true); setError(""); setAnalysis("");
    try {
      const message = `Analyze the student's CV for the AbroadShield journey. Do not invent facts. Return a structured assessment with: strongest evidence, gaps, target positioning, career risks, skills/projects to build, networking priorities, and a practical 90-day plan. Use the student's journey context. Clearly label assumptions. CV:\n${cv.trim()}`;
      const res = await fetch("/api/abroadshield/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, messages: [] }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "The AI analysis service is unavailable right now.");
      setAnalysis(data.reply || "The agent returned no analysis.");
    } catch (e) { setError(e instanceof Error ? e.message : "CV analysis failed. No result was saved."); }
    finally { setBusy(false); }
  };

  const currentIndex = Math.max(0, stages.findIndex((s) => s.n === ({ "pre-departure": "01", arrival: "02", studying: "03", "job-success": "04" } as Record<string, string>)[profile.currentPhase]));
  const stageLabel = stages[currentIndex]?.title || stages[0].title;

  return <section className="min-h-[calc(100vh-3.5rem)] bg-[var(--shield-ink)]">
    <header className="border-b border-[var(--shield-border)] bg-[oklch(0.11_0.014_165/.92)] px-5 py-6 backdrop-blur-xl sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.22em] text-[oklch(0.74_0.17_162)]"><Sparkles className="h-3 w-3"/>AI journey cockpit</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your route from today to the job.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--shield-text-dim)]">One visible blueprint. One evolving agent. Start with your goal and CV; add sensitive documents only when a real workflow needs them.</p>
          </div>
          <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.018_165)] px-5 py-4 lg:min-w-64"><div className="text-[9px] uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Agent focus</div><div className="mt-1 text-sm font-semibold">{stageLabel}</div><div className="mt-1 text-[10px] text-[var(--shield-text-dim)]">The full route stays visible.</div></div>
        </div>
        <nav className="mt-6 flex gap-2 overflow-x-auto" aria-label="Journey views">
          <Tab active={view === "blueprint"} label="Blueprint" icon={<Map/>} onClick={() => setView("blueprint")}/>
          <Tab active={view === "cv"} label="CV analysis" icon={<FileText/>} onClick={() => setView("cv")}/>
          <Tab active={view === "pilot"} label="AI pilot" icon={<Brain/>} onClick={() => setView("pilot")}/>
        </nav>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      {view === "blueprint" && <div className="space-y-8">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] border border-[oklch(0.74_0.17_162/.28)] bg-[oklch(0.15_0.018_165)] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[oklch(0.74_0.17_162/.09)] blur-3xl"/>
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_.7fr] lg:items-center">
            <div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">North star</div><h2 className="mt-2 max-w-4xl text-2xl font-semibold leading-tight sm:text-3xl">{profile.careerGoal || "Define the full-time outcome you are building toward."}</h2><p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--shield-text-dim)]">AbroadShield works backwards from this outcome. It connects study choices to career evidence, networking, target roles and the decisions that must happen between each transition.</p><div className="mt-5 flex flex-wrap gap-2">{[profile.destination, profile.course, profile.university, profile.intake].filter(Boolean).map((x) => <span key={x} className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165)] px-3 py-1.5 text-[10px] text-[var(--shield-text-dim)]">{x}</span>)}</div></div>
            <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165/.7)] p-5"><Target className="h-5 w-5 text-[oklch(0.85_0.19_158)]"/><div className="mt-3 text-sm font-semibold">Start light. Go deeper when needed.</div><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">Profile first. CV second. Sensitive records later, with a specific purpose and user control.</p><button type="button" onClick={() => setView("cv")} className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-[oklch(0.85_0.19_158)]">Analyze my CV <ArrowRight className="h-3 w-3"/></button></div>
          </div>
        </motion.section>

        <section>
          <div className="mb-4"><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">The complete blueprint</div><h2 className="mt-1 text-xl font-semibold">Nothing important is hidden behind another screen.</h2><p className="mt-1 text-xs text-[var(--shield-text-dim)]">Your current stage determines the agent's next actions—not the visibility of your destination.</p></div>
          <div className="relative grid gap-3 lg:grid-cols-4">{stages.map((s, i) => <motion.article key={s.n} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }} className={`relative rounded-2xl border p-5 ${i === currentIndex ? "border-[oklch(0.74_0.17_162/.5)] bg-[oklch(0.74_0.17_162/.08)]" : "border-[var(--shield-border)] bg-[var(--shield-ink-2)]"}`}><div className="flex items-center justify-between"><span className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${i < currentIndex ? "bg-[oklch(0.74_0.17_162/.16)] text-[oklch(0.85_0.19_158)]" : i === currentIndex ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.12_0.016_165)]" : "bg-[oklch(0.23_0.025_165)] text-[var(--shield-text-dim)]"}`}>{i < currentIndex ? <CheckCircle2 className="h-4 w-4"/> : s.n}</span><span className="text-[8px] font-semibold uppercase tracking-widest text-[var(--shield-text-faint)]">{i < currentIndex ? "Done" : i === currentIndex ? "Now" : "Ahead"}</span></div><h3 className="mt-5 text-sm font-semibold">{s.title}</h3><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{s.body}</p>{i < stages.length - 1 && <div className="absolute -right-3 top-9 z-10 hidden h-px w-3 bg-[var(--shield-border)] lg:block"/>}</motion.article>)}</div>
        </section>

        <div className="grid gap-3 md:grid-cols-3"><Feature icon={<FileText/>} title="CV first" body="Find your strongest evidence, gaps and positioning before asking for more documents."/><Feature icon={<Brain/>} title="Agent-driven" body="Context becomes strategy, research, priorities and executable next actions."/><Feature icon={<Target/>} title="Career backwards" body="The study plan is connected to the eventual full-time role, not treated as an isolated admission task."/></div>
      </div>}

      {view === "cv" && <div className="mx-auto max-w-5xl space-y-6"><div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">First useful document</div><h2 className="mt-1 text-2xl font-semibold">Start with your CV. Nothing else.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--shield-text-dim)]">For this first working workflow, paste the CV text. The agent uses your destination, course, preferences and career goal to produce a career-focused assessment. This screen does not persist the pasted CV.</p></div><div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><textarea value={cv} onChange={(e) => setCv(e.target.value)} rows={15} placeholder="Paste your CV text here…" className="w-full resize-y rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.09_0.012_165)] p-4 text-sm leading-6 outline-none focus:border-[oklch(0.74_0.17_162/.5)]"/><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] text-[var(--shield-text-faint)]">{cv.length} characters · do not include unnecessary sensitive identifiers</span><button type="button" disabled={busy || cv.trim().length < 80} onClick={() => void analyzeCv()} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-bold text-[oklch(0.12_0.016_165)] disabled:opacity-50">{busy ? "Analyzing…" : "Analyze CV"}<Sparkles className="h-3.5 w-3.5"/></button></div></div>{error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}{analysis && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[oklch(0.74_0.17_162/.25)] bg-[oklch(0.15_0.018_165)] p-6"><div className="mb-4 flex items-center gap-2 text-xs font-bold"><Brain className="h-4 w-4 text-[oklch(0.85_0.19_158)]"/>Agent assessment</div><div className="whitespace-pre-wrap text-sm leading-6 text-[var(--shield-text-dim)]">{analysis}</div></motion.div>}</div>}

      {view === "pilot" && <div className="mx-auto max-w-5xl"><div className="mb-5 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4"><div className="text-[9px] font-bold uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Pilot context</div><div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--shield-text-dim)]">{[profile.careerGoal, profile.destination, profile.course].filter(Boolean).map((x) => <span key={x} className="rounded-full border border-[var(--shield-border)] px-3 py-1">{x}</span>)}</div></div><AgentChat/></div>}
    </main>
  </section>;
}

function Tab({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} aria-current={active ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${active ? "border-[oklch(0.74_0.17_162/.4)] bg-[oklch(0.74_0.17_162/.1)] text-[var(--shield-text)]" : "border-[var(--shield-border)] text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"}`}>{icon}{label}</button>; }
function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) { return <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/.09)] text-[oklch(0.85_0.19_158)]">{icon}</div><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{body}</p></div>; }
