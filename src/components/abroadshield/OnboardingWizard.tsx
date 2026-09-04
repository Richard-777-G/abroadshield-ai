"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar, Check, ChevronLeft, Globe, GraduationCap, MapPin, Sparkles, Target, User } from "lucide-react";
import { useProfileStore } from "./profileStore";

const DESTINATIONS = [
  ["🇬🇧", "United Kingdom"], ["🇺🇸", "United States"], ["🇨🇦", "Canada"], ["🇦🇺", "Australia"],
  ["🇩🇪", "Germany"], ["🇮🇪", "Ireland"], ["🇳🇱", "Netherlands"], ["🇫🇷", "France"],
  ["🇳🇿", "New Zealand"], ["🇸🇬", "Singapore"],
] as const;
const INTAKES = ["September 2026", "January 2027", "April 2027", "September 2027"];
const PHASES = [
  { id: "pre-departure", label: "Planning / applying", desc: "Before you move" },
  { id: "arrival", label: "Arriving / settling", desc: "Preparing the move or just landed" },
  { id: "studying", label: "Studying", desc: "Enrolled and building career capital" },
  { id: "job-success", label: "Job transition", desc: "Targeting full-time work" },
] as const;

const STEPS: { id: number; title: string; subtitle: string; icon: ReactNode }[] = [
  { id: 1, title: "Start with you", subtitle: "Name and home context", icon: <User className="h-5 w-5" /> },
  { id: 2, title: "Choose the destination", subtitle: "Where the journey is headed", icon: <Globe className="h-5 w-5" /> },
  { id: 3, title: "Define the study path", subtitle: "Course, university and intake", icon: <GraduationCap className="h-5 w-5" /> },
  { id: 4, title: "Set the career target", subtitle: "The full-time outcome to work backwards from", icon: <Target className="h-5 w-5" /> },
  { id: 5, title: "Launch your journey", subtitle: "Set your current stage and start the agent", icon: <Sparkles className="h-5 w-5" /> },
];

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const { profile, setProfile } = useProfileStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    origin: profile.origin,
    destination: profile.destination,
    course: profile.course,
    university: profile.university,
    preferredUniversities: profile.preferredUniversities,
    intake: profile.intake,
    careerGoal: profile.careerGoal,
    currentPhase: profile.currentPhase,
    homeLanguage: profile.homeLanguage ?? "",
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const canAdvance = () => {
    if (step === 1) return form.name.trim().length > 1;
    if (step === 2) return form.destination.length > 0;
    if (step === 3) return form.course.trim().length > 2 && form.university.trim().length > 2;
    if (step === 4) return form.careerGoal.trim().length > 3;
    return Boolean(form.currentPhase);
  };

  const complete = async () => {
    if (saving || !canAdvance()) return;
    setSaving(true);
    setSaveError("");
    const previous = profile;
    const nextProfile = {
      ...profile,
      ...form,
      onboarded: true,
      // A journey can launch without documents; readiness is intentionally not fabricated.
      readiness: 0,
      documentsTotal: 0,
      documentsVerified: 0,
    };
    setProfile(nextProfile);
    try {
      const res = await fetch("/api/abroadshield/journey", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextProfile),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not save your journey.");
      setProfile({ ...nextProfile, ...(data.profile || {}) });
      onComplete();
    } catch (error) {
      setProfile(previous);
      setSaveError(error instanceof Error ? error.message : "Could not save your journey.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[var(--shield-ink)]/95 p-4 backdrop-blur-md">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-[oklch(0.74_0.17_162/0.13)] blur-[90px]" />
      <div className="relative my-auto w-full max-w-2xl">
        <div className="mb-5 flex items-center justify-between gap-4 px-1">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[.22em] text-[oklch(0.74_0.17_162)]">AbroadShield</div>
            <div className="mt-1 text-sm font-semibold">Build the route first. Add documents when they become necessary.</div>
          </div>
          <div className="text-[10px] text-[var(--shield-text-faint)]">{step}/{STEPS.length}</div>
        </div>
        <div className="mb-5 flex gap-1.5 px-1" aria-label={`Step ${step} of ${STEPS.length}`}>
          {STEPS.map((item) => <div key={item.id} className={`h-1.5 rounded-full transition-all ${item.id <= step ? "w-10 bg-[oklch(0.74_0.17_162)]" : "w-2 bg-[oklch(0.74_0.17_162/0.18)]"}`} />)}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: .18 }} className="rounded-[28px] border border-[oklch(0.74_0.17_162/0.22)] bg-[oklch(0.16_0.02_165/.96)] p-6 shadow-2xl sm:p-8">
            <div className="mb-7 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[oklch(0.74_0.17_162/0.24)] bg-[oklch(0.74_0.17_162/0.09)] text-[oklch(0.85_0.19_158)]">{STEPS[step - 1].icon}</div>
              <div><h2 className="text-2xl font-semibold tracking-tight">{STEPS[step - 1].title}</h2><p className="mt-1 text-xs leading-5 text-[var(--shield-text-dim)]">{STEPS[step - 1].subtitle}</p></div>
            </div>

            {step === 1 && <div className="space-y-4"><Field label="Full name" value={form.name} onChange={(value) => update("name", value)} placeholder="Your name" /><Field label="Email" value={form.email} onChange={(value) => update("email", value)} placeholder="your@email.com" readOnly /><div className="grid gap-4 sm:grid-cols-2"><Field label="Home city / country" value={form.origin} onChange={(value) => update("origin", value)} placeholder="e.g. Chennai, India" /><Field label="Home language" value={form.homeLanguage} onChange={(value) => update("homeLanguage", value)} placeholder="e.g. Tamil" /></div></div>}

            {step === 2 && <div className="space-y-4"><p className="text-sm leading-6 text-[var(--shield-text-dim)]">Pick the country you are planning around. This sets the context for your future research, applications, visa planning and career strategy.</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{DESTINATIONS.map(([flag, value]) => <button type="button" key={value} onClick={() => update("destination", value)} aria-pressed={form.destination === value} className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${form.destination === value ? "border-[oklch(0.74_0.17_162/0.55)] bg-[oklch(0.74_0.17_162/0.10)]" : "border-[var(--shield-border)] bg-[oklch(0.11_0.014_165/.5)] hover:border-[oklch(0.74_0.17_162/0.28)]"}`}><span className="mr-2">{flag}</span>{value}</button>)}</div></div>}

            {step === 3 && <div className="space-y-4"><Field label="Course / degree" value={form.course} onChange={(value) => update("course", value)} placeholder="e.g. MSc Business Analytics" /><Field label="Current preferred university" value={form.university} onChange={(value) => update("university", value)} placeholder="University name" /><Field label="Other university preferences" value={form.preferredUniversities} onChange={(value) => update("preferredUniversities", value)} placeholder="e.g. SKEMA, ESCE, other targets" /><div><label className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--shield-text-dim)]"><Calendar className="h-3.5 w-3.5" />Intake</label><div className="flex flex-wrap gap-2">{INTAKES.map((item) => <button type="button" key={item} onClick={() => update("intake", item)} aria-pressed={form.intake === item} className={`rounded-full border px-3 py-1.5 text-xs transition ${form.intake === item ? "border-[oklch(0.74_0.17_162/0.55)] bg-[oklch(0.74_0.17_162/0.10)]" : "border-[var(--shield-border)] text-[var(--shield-text-dim)]"}`}>{item}</button>)}</div></div></div>}

            {step === 4 && <div className="space-y-5"><div className="rounded-2xl border border-[oklch(0.74_0.17_162/0.18)] bg-[oklch(0.74_0.17_162/0.05)] p-4 text-sm leading-6 text-[var(--shield-text-dim)]">AbroadShield is designed to work backwards from the final outcome. Tell the agent the role, function or career direction you ultimately want; the blueprint will connect study decisions to that outcome.</div><Field label="Your full-time career goal" value={form.careerGoal} onChange={(value) => update("careerGoal", value)} placeholder="e.g. AI / data strategy consultant in France" /><p className="text-xs leading-5 text-[var(--shield-text-faint)]">You can change this later. This is your north star, not a permanent commitment.</p></div>}

            {step === 5 && <div className="space-y-5"><div><div className="mb-2 text-xs font-medium text-[var(--shield-text-dim)]">Where are you starting from?</div><div className="space-y-2">{PHASES.map((phase) => <button type="button" key={phase.id} onClick={() => update("currentPhase", phase.id)} aria-pressed={form.currentPhase === phase.id} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${form.currentPhase === phase.id ? "border-[oklch(0.74_0.17_162/0.55)] bg-[oklch(0.74_0.17_162/0.09)]" : "border-[var(--shield-border)] bg-[oklch(0.11_0.014_165/.55)]"}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${form.currentPhase === phase.id ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.12_0.016_165)]" : "bg-[oklch(0.22_0.025_165)]"}`}>{form.currentPhase === phase.id ? <Check className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}</span><span><span className="block text-sm font-medium">{phase.label}</span><span className="mt-0.5 block text-xs text-[var(--shield-text-faint)]">{phase.desc}</span></span></button>)}</div></div><div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.11_0.014_165/.55)] p-4"><div className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" />Ready to launch</div><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">Your journey starts with your profile and preferences. CV analysis comes next. Sensitive documents are not required at onboarding.</p></div></div>}

            {saveError && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-red-300">{saveError}</div>}
            <div className="mt-8 flex items-center justify-between gap-3"><button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || saving} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-[var(--shield-text-dim)] disabled:opacity-30"><ChevronLeft className="h-4 w-4" />Back</button>{step < STEPS.length ? <button type="button" onClick={() => canAdvance() && setStep((current) => current + 1)} disabled={!canAdvance() || saving} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.12_0.016_165)] disabled:cursor-not-allowed disabled:opacity-40">Continue<ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={complete} disabled={!canAdvance() || saving} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.12_0.016_165)] disabled:cursor-wait disabled:opacity-40">{saving ? "Launching…" : <><Sparkles className="h-4 w-4" />Launch my journey</>}</button>}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, readOnly = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; readOnly?: boolean }) {
  return <div><label className="mb-1.5 block text-xs font-medium text-[var(--shield-text-dim)]">{label}</label><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} readOnly={readOnly} className={`w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.11_0.014_165/.8)] px-4 py-3 text-sm text-[var(--shield-text)] outline-none transition placeholder:text-[var(--shield-text-faint)] focus:border-[oklch(0.74_0.17_162/0.5)] ${readOnly ? "cursor-not-allowed opacity-60" : ""}`} /></div>;
}
