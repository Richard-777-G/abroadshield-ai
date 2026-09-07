"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Brain, CheckCircle2, FileText, Loader2, Map, Play, Save, ShieldCheck, Target, UserRound } from "lucide-react";
import AgentChat from "./AgentChat";
import { useProfileStore } from "./profileStore";
import type { StudentProfile } from "./profileStore";

type Tab = "profile" | "test" | "cv" | "agent";
type ProfileTest = { score: number; passed: number; total: number; status: string; results: Array<{ field: string; label: string; guidance: string; passed: boolean }>; next: string };
type TaskResult = { ok: boolean; task?: { id: string; title: string; status: string; type: string }; result?: unknown; error?: string };

const phaseLabels = [
  ["pre-departure", "Choose the move"],
  ["arrival", "Secure the move"],
  ["studying", "Build career capital"],
  ["job-success", "Land the role"],
] as const;

export default function JourneyWorkspace({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile, setProfile } = useProfileStore();
  const [tab, setTab] = useState<Tab>("profile");
  const [draft, setDraft] = useState<StudentProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [test, setTest] = useState<ProfileTest | null>(null);
  const [testing, setTesting] = useState(false);
  const [cv, setCv] = useState("");
  const [cvResult, setCvResult] = useState("");
  const [runningTask, setRunningTask] = useState("");
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null);

  useEffect(() => setDraft(profile), [profile]);

  const update = (key: keyof StudentProfile, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true); setMessage(""); setError("");
    try {
      const res = await fetch("/api/abroadshield/journey", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not save profile.");
      setProfile(data.profile || draft);
      setMessage("Profile saved to your AbroadShield journey.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save profile."); }
    finally { setSaving(false); }
  };

  const runProfileTest = async () => {
    setTesting(true); setError("");
    try {
      await save();
      const res = await fetch("/api/abroadshield/profile-test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Profile test failed.");
      setTest(data);
      setTab("test");
    } catch (e) { setError(e instanceof Error ? e.message : "Profile test failed."); }
    finally { setTesting(false); }
  };

  const analyzeCv = async () => {
    if (cv.trim().length < 80) return;
    setError(""); setCvResult(""); setRunningTask("cv");
    try {
      const res = await fetch("/api/abroadshield/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Analyze my CV against my AbroadShield journey. Do not invent facts. Return: strengths, gaps, target positioning, priority skills/projects, networking priorities, and a practical 90-day plan. Clearly label assumptions. CV:\n${cv.trim()}`, messages: [] }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "CV analysis is unavailable.");
      setCvResult(data.reply || "No analysis returned.");
    } catch (e) { setError(e instanceof Error ? e.message : "CV analysis failed."); }
    finally { setRunningTask(""); }
  };

  const runTask = async (taskType: string, context: string) => {
    setRunningTask(taskType); setTaskResult(null); setError("");
    try {
      const res = await fetch("/api/abroadshield/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskType, context, mode: "execute" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Task could not be executed.");
      setTaskResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Task execution failed."); }
    finally { setRunningTask(""); }
  };

  const phaseName = phaseLabels.find(([id]) => id === profile.currentPhase)?.[1] || "Choose the move";

  return <section className="min-h-[calc(100vh-3.5rem)] bg-[var(--shield-ink)]">
    <header className="border-b border-[var(--shield-border)] bg-[oklch(0.11_0.014_165/.96)] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.22em] text-[oklch(0.74_0.17_162)]"><ShieldCheck className="h-3 w-3"/>Student control center</div><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Make the journey actually work.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--shield-text-dim)]">Build your profile, test it, run real tasks, analyze your CV and use the agent. Every action below is connected to the application state.</p></div>
          <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.018_165)] px-5 py-4"><div className="text-[9px] uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Current phase</div><div className="mt-1 text-sm font-semibold">{phaseName}</div><div className="mt-1 text-[10px] text-[var(--shield-text-dim)]">Readiness: {Math.max(0, Math.min(100, Number(profile.readiness) || 0))}%</div></div>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Student control center">
          <Tab active={tab === "profile"} onClick={() => setTab("profile")} icon={<UserRound/>} label="Profile" />
          <Tab active={tab === "test"} onClick={() => setTab("test")} icon={<ShieldCheck/>} label="Test profile" />
          <Tab active={tab === "cv"} onClick={() => setTab("cv")} icon={<FileText/>} label="CV analysis" />
          <Tab active={tab === "agent"} onClick={() => setTab("agent")} icon={<Brain/>} label="Run agent" />
        </nav>
      </div>
    </header>

    <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
      {(message || error) && <div role="status" className={`rounded-xl border p-3 text-xs ${error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-[oklch(0.74_0.17_162/.3)] bg-[oklch(0.74_0.17_162/.08)] text-[oklch(0.85_0.19_158)]"}`}>{error || message}</div>}

      {tab === "profile" && <div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
        <section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8">
          <div className="mb-6"><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">Source of truth</div><h2 className="mt-1 text-xl font-semibold">Your student profile</h2><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">Change the values, save them, reload the workspace, and they remain attached to your account.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={draft.name} onChange={(v) => update("name", v)} />
            <Field label="Origin" value={draft.origin} onChange={(v) => update("origin", v)} />
            <Field label="Destination" value={draft.destination} onChange={(v) => update("destination", v)} />
            <Field label="Course / degree" value={draft.course} onChange={(v) => update("course", v)} />
            <Field label="University" value={draft.university} onChange={(v) => update("university", v)} />
            <Field label="Intake" value={draft.intake} onChange={(v) => update("intake", v)} />
            <Field label="Career goal" value={draft.careerGoal} onChange={(v) => update("careerGoal", v)} wide />
            <Field label="Preferred universities / shortlist" value={draft.preferredUniversities} onChange={(v) => update("preferredUniversities", v)} wide />
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-bold text-[oklch(0.12_0.016_165)] disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}{saving ? "Saving…" : "Save profile"}</button><button type="button" onClick={() => void runProfileTest()} disabled={testing} className="inline-flex items-center gap-2 rounded-xl border border-[var(--shield-border)] px-4 py-2.5 text-xs font-bold text-[var(--shield-text)] disabled:opacity-50">{testing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4"/>}Save & test profile</button></div>
        </section>
        <section className="rounded-3xl border border-[oklch(0.74_0.17_162/.25)] bg-[oklch(0.15_0.018_165)] p-6"><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">What happens next</div><div className="mt-4 space-y-4"><Step n="01" title="Save" body="Your profile is persisted through the journey API."/><Step n="02" title="Test" body="Required journey inputs are checked deterministically."/><Step n="03" title="Execute" body="Use the agent to run a stage-appropriate task."/><Step n="04" title="Observe" body="The resulting task/event state feeds the dashboard."/></div></section>
      </div>}

      {tab === "test" && <section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">Deterministic profile check</div><h2 className="mt-1 text-2xl font-semibold">Can AbroadShield actually work with this profile?</h2><p className="mt-2 max-w-3xl text-xs leading-5 text-[var(--shield-text-dim)]">This is a product test, not an AI opinion. Missing inputs are explicitly identified.</p></div><button type="button" onClick={() => void runProfileTest()} disabled={testing} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-bold text-[oklch(0.12_0.016_165)]">{testing ? "Testing…" : "Run test again"}<Play className="h-3.5 w-3.5"/></button></div>{test ? <><div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Profile score" value={`${test.score}%`}/><Metric label="Passed" value={`${test.passed}/${test.total}`}/><Metric label="State" value={test.status.replaceAll("_", " ")}/></div><div className="mt-6 grid gap-3 md:grid-cols-2">{test.results.map((item) => <div key={item.field} className={`rounded-2xl border p-4 ${item.passed ? "border-[oklch(0.74_0.17_162/.25)]" : "border-amber-500/30"}`}><div className="flex items-center gap-2 text-sm font-semibold">{item.passed ? <CheckCircle2 className="h-4 w-4 text-[oklch(0.85_0.19_158)]"/> : <Target className="h-4 w-4 text-amber-300"/>}{item.label}</div>{!item.passed && <p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{item.guidance}</p>}</div>)}</div><div className="mt-6 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165)] p-4"><div className="text-[9px] font-bold uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Next action</div><p className="mt-2 text-sm">{test.next}</p></div></> : <Empty title="No profile test run yet" body="Save your profile and run the test. The result will show exactly what is usable and what is missing." action="Run profile test" onClick={() => void runProfileTest()} />}</section>}

      {tab === "cv" && <section className="mx-auto max-w-5xl rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8"><div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">Career evidence</div><h2 className="mt-1 text-2xl font-semibold">Test your CV against your actual journey.</h2><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">Paste the CV text. It is sent for analysis but is not stored by this workspace workflow.</p></div><textarea value={cv} onChange={(e) => setCv(e.target.value)} rows={16} placeholder="Paste your CV text here…" className="mt-6 w-full resize-y rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.09_0.012_165)] p-4 text-sm leading-6 text-[var(--shield-text)] outline-none focus:border-[oklch(0.74_0.17_162/.5)]"/><div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] text-[var(--shield-text-faint)]">{cv.length} characters · minimum 80</span><button type="button" disabled={cv.trim().length < 80 || runningTask === "cv"} onClick={() => void analyzeCv()} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-bold text-[oklch(0.12_0.016_165)] disabled:opacity-50">{runningTask === "cv" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Brain className="h-4 w-4"/>}{runningTask === "cv" ? "Analyzing…" : "Analyze CV"}</button></div>{cvResult && <div className="mt-6 rounded-2xl border border-[oklch(0.74_0.17_162/.25)] bg-[oklch(0.15_0.018_165)] p-5"><div className="mb-3 text-xs font-bold">Agent assessment</div><div className="whitespace-pre-wrap text-sm leading-6 text-[var(--shield-text-dim)]">{cvResult}</div></div>}</section>}

      {tab === "agent" && <div className="space-y-5"><section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">Executable stage actions</div><h2 className="mt-1 text-xl font-semibold">Run something real before opening the chat.</h2><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">These controls call the task engine directly and return the persisted execution result.</p></div><button type="button" onClick={() => onNavigate("agent")} className="inline-flex items-center gap-2 text-xs font-bold text-[oklch(0.85_0.19_158)]">Open full agent <ArrowRight className="h-3.5 w-3.5"/></button></div><div className="mt-5 grid gap-3 md:grid-cols-3"><ActionCard title="Check visa route" body="Run the stage-appropriate visa check against the current profile." task="visa_check" onRun={() => void runTask("visa_check", `Check the visa route for ${profile.destination || "my destination"} for my current journey profile.`)} busy={runningTask === "visa_check"}/><ActionCard title="Scan deadlines" body="Build a deadline scan from the current journey context." task="deadline_scan" onRun={() => void runTask("deadline_scan", "Scan my current journey for deadlines and identify what needs attention next.")} busy={runningTask === "deadline_scan"}/><ActionCard title="Check work rule" body="Run the deterministic work-rule capability when applicable." task="work_rule_check" onRun={() => void runTask("work_rule_check", "Check the applicable student work rule for my current destination and journey.")} busy={runningTask === "work_rule_check"}/></div></section>{taskResult && <section className="rounded-3xl border border-[oklch(0.74_0.17_162/.25)] bg-[oklch(0.15_0.018_165)] p-6"><div className="text-[9px] font-bold uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Execution result</div><div className="mt-2 text-lg font-semibold">{taskResult.task?.title || "Task completed"}</div><div className="mt-1 text-xs text-[var(--shield-text-dim)]">Status: {taskResult.task?.status || "returned"} · task: {taskResult.task?.id || "n/a"}</div><pre className="mt-4 overflow-auto rounded-2xl bg-[oklch(0.08_0.01_165)] p-4 text-xs leading-5 text-[var(--shield-text-dim)]">{JSON.stringify(taskResult.result ?? taskResult, null, 2)}</pre></section>}<AgentChat/></div>}
    </main>
  </section>;
}

function Field({ label, value, onChange, wide }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) { return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--shield-text-faint)]">{label}</span><input value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165)] px-3 py-2.5 text-sm text-[var(--shield-text)] outline-none focus:border-[oklch(0.74_0.17_162/.5)]" /></label>; }
function Tab({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold ${active ? "border-[oklch(0.74_0.17_162/.4)] bg-[oklch(0.74_0.17_162/.1)] text-[var(--shield-text)]" : "border-[var(--shield-border)] text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"}`}>{icon}{label}</button>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165)] p-4"><div className="text-[9px] uppercase tracking-wider text-[var(--shield-text-faint)]">{label}</div><div className="mt-2 text-xl font-semibold">{value}</div></div>; }
function Step({ n, title, body }: { n: string; title: string; body: string }) { return <div className="flex gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.74_0.17_162/.1)] text-[9px] font-bold text-[oklch(0.85_0.19_158)]">{n}</div><div><div className="text-xs font-semibold">{title}</div><p className="mt-1 text-[10px] leading-5 text-[var(--shield-text-dim)]">{body}</p></div></div>; }
function ActionCard({ title, body, task, onRun, busy }: { title: string; body: string; task: string; onRun: () => void; busy: boolean }) { return <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165)] p-4"><div className="text-sm font-semibold">{title}</div><p className="mt-2 min-h-10 text-xs leading-5 text-[var(--shield-text-dim)]">{body}</p><button type="button" onClick={onRun} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--shield-border)] px-3 py-2 text-[10px] font-bold hover:border-[oklch(0.74_0.17_162/.5)] disabled:opacity-50">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Play className="h-3.5 w-3.5"/>}{busy ? "Running…" : `Run ${task}`}</button></div>; }
function Empty({ title, body, action, onClick }: { title: string; body: string; action: string; onClick: () => void }) { return <div className="mt-7 rounded-2xl border border-dashed border-[var(--shield-border)] p-8 text-center"><h3 className="text-sm font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[var(--shield-text-dim)]">{body}</p><button type="button" onClick={onClick} className="mt-4 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-bold text-[oklch(0.12_0.016_165)]">{action}</button></div>; }
