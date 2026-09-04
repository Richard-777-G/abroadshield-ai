"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, GraduationCap, FileCheck2, ChevronRight, ChevronLeft, Sparkles, Globe, Calendar } from "lucide-react";
import { useProfileStore } from "./profileStore";

const DESTINATIONS = [
  { label: "🇬🇧 United Kingdom", value: "United Kingdom" }, { label: "🇺🇸 United States", value: "United States" },
  { label: "🇨🇦 Canada", value: "Canada" }, { label: "🇦🇺 Australia", value: "Australia" },
  { label: "🇩🇪 Germany", value: "Germany" }, { label: "🇮🇪 Ireland", value: "Ireland" },
  { label: "🇳🇱 Netherlands", value: "Netherlands" }, { label: "🇫🇷 France", value: "France" },
  { label: "🇳🇿 New Zealand", value: "New Zealand" }, { label: "🇸🇬 Singapore", value: "Singapore" },
];
const INTAKES = ["September 2026", "January 2027", "April 2027", "September 2027"];
const PHASES = [
  { id: "pre-departure" as const, label: "Pre-Departure", desc: "Planning, visa, documents", icon: "✈️" },
  { id: "arrival" as const, label: "Arrival", desc: "Just landed / settling in", icon: "🏠" },
  { id: "studying" as const, label: "Studying & Part-Time", desc: "Enrolled and working legally", icon: "📚" },
  { id: "job-success" as const, label: "Job Success", desc: "Full-time career transition", icon: "💼" },
];
interface Step { id: number; title: string; subtitle: string; icon: React.ReactNode }
const STEPS: Step[] = [
  { id: 1, title: "Who are you?", subtitle: "Your name and contact", icon: <User className="h-5 w-5" /> },
  { id: 2, title: "Where are you from?", subtitle: "Your home city and country", icon: <MapPin className="h-5 w-5" /> },
  { id: 3, title: "Where are you going?", subtitle: "Your destination country", icon: <Globe className="h-5 w-5" /> },
  { id: 4, title: "What are you studying?", subtitle: "Course and university", icon: <GraduationCap className="h-5 w-5" /> },
  { id: 5, title: "Where are you now?", subtitle: "Your current journey phase", icon: <Calendar className="h-5 w-5" /> },
  { id: 6, title: "Documents", subtitle: "Rough count of your paperwork", icon: <FileCheck2 className="h-5 w-5" /> },
];

interface OnboardingWizardProps { onComplete: () => void }

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { profile, setProfile } = useProfileStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    name: profile.name, email: profile.email, origin: profile.origin, destination: profile.destination,
    course: profile.course, university: profile.university, intake: profile.intake, currentPhase: profile.currentPhase,
    documentsTotal: profile.documentsTotal, documentsVerified: Math.min(profile.documentsVerified, profile.documentsTotal), homeLanguage: profile.homeLanguage ?? "",
  });
  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));
  const canAdvance = () => step === 1 ? form.name.trim().length > 1 : step === 2 ? form.origin.trim().length > 2 : step === 3 ? form.destination.length > 0 : step === 4 ? form.course.trim().length > 2 && form.university.trim().length > 2 : true;

  const handleComplete = async () => {
    if (saving) return;
    setSaving(true); setSaveError("");
    const readiness = Math.round((form.documentsVerified / Math.max(form.documentsTotal, 1)) * 100);
    const nextProfile = { ...form, onboarded: true, readiness };
    const previousProfile = profile;
    setProfile(nextProfile);
    try {
      const res = await fetch("/api/abroadshield/journey", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nextProfile) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not save your journey.");
      setProfile({ ...nextProfile, ...(data.profile || {}) });
      onComplete();
    } catch (e) {
      setProfile(previousProfile);
      setSaveError(e instanceof Error ? e.message : "Could not save your journey.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[var(--shield-ink)]/95 p-4 backdrop-blur-md">
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[oklch(0.74_0.17_162/0.15)] blur-[80px]" />
      <div className="relative my-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2">{STEPS.map((s) => <div key={s.id} aria-label={`Step ${s.id} of ${STEPS.length}`} className={`rounded-full transition-all duration-300 ${s.id === step ? "h-2 w-8 bg-[oklch(0.74_0.17_162)]" : s.id < step ? "h-2 w-2 bg-[oklch(0.74_0.17_162/0.6)]" : "h-2 w-2 bg-[oklch(0.74_0.17_162/0.2)]"}`} />)}</div>
        <AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-[oklch(0.74_0.17_162/0.25)] bg-[oklch(0.18_0.022_165/0.95)] p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/0.15)] text-[oklch(0.74_0.17_162)]">{STEPS[step - 1].icon}</div><div><div className="text-[11px] uppercase tracking-wider text-[var(--shield-text-faint)]">Step {step} of {STEPS.length}</div><h2 className="text-xl font-semibold">{STEPS[step - 1].title}</h2><p className="mt-0.5 text-xs text-[var(--shield-text-faint)]">{STEPS[step - 1].subtitle}</p></div></div>
          <div className="space-y-4">
            {step === 1 && <><Field label="Full name *" value={form.name} onChange={(v) => update("name", v)} placeholder="Your name" /><Field label="Email" value={form.email} onChange={(v) => update("email", v)} placeholder="your@email.com" type="email" readOnly /><Field label="Home language" value={form.homeLanguage} onChange={(v) => update("homeLanguage", v)} placeholder="e.g. Hindi, Tamil, Telugu" /></>}
            {step === 2 && <><Field label="Home city and country *" value={form.origin} onChange={(v) => update("origin", v)} placeholder="e.g. Nellore, India" /><p className="text-xs text-[var(--shield-text-faint)]">Used to contextualize currency, departure planning and home-country requirements.</p></>}
            {step === 3 && <div><label className="mb-2 block text-xs font-medium text-[var(--shield-text-dim)]">Destination country *</label><div className="grid grid-cols-2 gap-2">{DESTINATIONS.map((d) => <button type="button" key={d.value} onClick={() => update("destination", d.value)} aria-pressed={form.destination === d.value} className={`rounded-lg border px-3 py-2.5 text-left text-sm ${form.destination === d.value ? "border-[oklch(0.74_0.17_162/0.6)] bg-[oklch(0.74_0.17_162/0.12)]" : "border-[oklch(0.74_0.17_162/0.15)] text-[var(--shield-text-dim)]"}`}>{d.label}</button>)}</div></div>}
            {step === 4 && <><Field label="Course name *" value={form.course} onChange={(v) => update("course", v)} placeholder="e.g. MSc Data Science" /><Field label="University *" value={form.university} onChange={(v) => update("university", v)} placeholder="University name" /><div><label className="mb-2 block text-xs font-medium text-[var(--shield-text-dim)]">Intake</label><div className="flex flex-wrap gap-2">{INTAKES.map((i) => <button type="button" key={i} onClick={() => update("intake", i)} aria-pressed={form.intake === i} className={`rounded-lg border px-3 py-1.5 text-xs ${form.intake === i ? "border-[oklch(0.74_0.17_162/0.6)] bg-[oklch(0.74_0.17_162/0.12)]" : "border-[oklch(0.74_0.17_162/0.15)] text-[var(--shield-text-dim)]"}`}>{i}</button>)}</div></div></>}
            {step === 5 && <div><label className="mb-2 block text-xs font-medium text-[var(--shield-text-dim)]">Where are you in the journey?</label><div className="space-y-2">{PHASES.map((p) => <button type="button" key={p.id} onClick={() => update("currentPhase", p.id)} aria-pressed={form.currentPhase === p.id} className={`w-full rounded-lg border px-4 py-3 text-left ${form.currentPhase === p.id ? "border-[oklch(0.74_0.17_162/0.6)] bg-[oklch(0.74_0.17_162/0.12)]" : "border-[oklch(0.74_0.17_162/0.15)]"}`}><span className="mr-3 text-xl">{p.icon}</span><span className="text-sm font-medium">{p.label}</span><span className="ml-2 text-xs text-[var(--shield-text-faint)]">{p.desc}</span></button>)}</div></div>}
            {step === 6 && <div className="space-y-4"><RangeField label="Documents needed (approx.)" value={form.documentsTotal} min={0} max={30} onChange={(v) => update("documentsTotal", v)} /><RangeField label="Already verified / ready" value={form.documentsVerified} min={0} max={Math.max(form.documentsTotal, 1)} onChange={(v) => update("documentsVerified", Math.min(v, form.documentsTotal))} /><div className="rounded-xl bg-[oklch(0.74_0.17_162/0.08)] p-4 text-xs">Journey readiness: <strong>{Math.round((form.documentsVerified / Math.max(form.documentsTotal, 1)) * 100)}%</strong></div></div>}
          </div>
          {saveError && <div role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{saveError}</div>}
          <div className="mt-8 flex items-center justify-between"><button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || saving} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-[var(--shield-text-dim)] disabled:opacity-30"><ChevronLeft className="h-4 w-4" />Back</button>{step < STEPS.length ? <button type="button" onClick={() => canAdvance() && setStep((s) => s + 1)} disabled={!canAdvance() || saving} className="flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-6 py-2.5 text-sm font-medium text-[oklch(0.14_0.018_165)]">Continue<ChevronRight className="h-4 w-4" /></button> : <button type="button" onClick={handleComplete} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-6 py-2.5 text-sm font-medium text-[oklch(0.14_0.018_165)] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving journey…" : <><Sparkles className="h-4 w-4" />Launch my agent</>}</button>}</div>
        </motion.div></AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", readOnly = false }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; readOnly?: boolean }) {
  return <div><label className="mb-1.5 block text-xs font-medium text-[var(--shield-text-dim)]">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly} className={`w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.14_0.018_165)] px-4 py-2.5 text-sm text-[var(--shield-text)] outline-none focus:border-[oklch(0.74_0.17_162/0.6)] ${readOnly ? "cursor-not-allowed opacity-60" : ""}`} /></div>;
}
function RangeField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return <div><label className="mb-1.5 block text-xs font-medium text-[var(--shield-text-dim)]">{label}</label><div className="flex items-center gap-3"><input aria-label={label} type="range" min={min} max={max} value={Math.min(value, max)} onChange={(e) => onChange(Number(e.target.value))} className="flex-1" /><span className="w-8 text-center text-sm font-medium">{Math.min(value, max)}</span></div></div>;
}
