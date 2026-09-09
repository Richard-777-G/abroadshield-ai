"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Globe,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { useProfileStore } from "./profileStore";

const DESTINATIONS = [
  ["🇬🇧", "United Kingdom"],
  ["🇺🇸", "United States"],
  ["🇨🇦", "Canada"],
  ["🇦🇺", "Australia"],
  ["🇩🇪", "Germany"],
  ["🇮🇪", "Ireland"],
  ["🇳🇱", "Netherlands"],
  ["🇫🇷", "France"],
  ["🇳🇿", "New Zealand"],
  ["🇸🇬", "Singapore"],
] as const;

const INTAKES = [
  "September 2026",
  "January 2027",
  "April 2027",
  "September 2027",
];

const PHASES = [
  { id: "pre-departure", label: "Planning / Applying", desc: "Before you move (visa, funding, admissions)" },
  { id: "arrival", label: "Arriving / Settling", desc: "Just landed or preparing arrival logistics" },
  { id: "studying", label: "Studying & Part-time", desc: "Enrolled in classes and exploring internships" },
  { id: "job-success", label: "Job Transition", desc: "Targeting full-time career / post-study visa" },
] as const;

const STEPS: { id: number; title: string; subtitle: string; icon: ReactNode }[] = [
  { id: 1, title: "Your Student Profile", subtitle: "Name and origin context", icon: <User className="h-5 w-5" /> },
  { id: 2, title: "Choose Destination Route", subtitle: "Where your life abroad is headed", icon: <Globe className="h-5 w-5" /> },
  { id: 3, title: "Define Academic Path", subtitle: "Course, university & intake season", icon: <GraduationCap className="h-5 w-5" /> },
  { id: 4, title: "Target Career Outcome", subtitle: "The full-time goal to work backwards from", icon: <Target className="h-5 w-5" /> },
  { id: 5, title: "Launch Co-Pilot Vector", subtitle: "Select your active stage and initialize", icon: <Sparkles className="h-5 w-5" /> },
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

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
      <div className="relative my-auto w-full max-w-2xl">
        {/* Header Strip */}
        <div className="mb-4 flex items-center justify-between gap-4 px-2">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--shield-emerald-bright)]">
              <Sparkles className="h-3.5 w-3.5" />
              AbroadShield Journey Architect
            </div>
            <div className="mt-1 text-sm font-bold text-white">
              Initialize your autonomous student co-pilot.
            </div>
          </div>
          <div className="font-mono text-xs text-[var(--shield-text-faint)]">
            Step 0{step} / 0{STEPS.length}
          </div>
        </div>

        {/* Step Indicator Bars */}
        <div className="mb-5 flex gap-1.5 px-2" aria-label={`Step ${step} of ${STEPS.length}`}>
          {STEPS.map((item) => (
            <div
              key={item.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                item.id <= step
                  ? "w-12 bg-[var(--shield-emerald-bright)]"
                  : "w-2 bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Form Container Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="as-dock relative rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[var(--shield-emerald-bright)]">
                {STEPS[step - 1].icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {STEPS[step - 1].title}
                </h2>
                <p className="mt-1 text-xs text-[var(--shield-text-dim)]">
                  {STEPS[step - 1].subtitle}
                </p>
              </div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(value) => update("name", value)}
                  placeholder="e.g. Richard G."
                />
                <Field
                  label="Email address"
                  value={form.email}
                  onChange={(value) => update("email", value)}
                  placeholder="your@email.com"
                  readOnly
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Home city / country"
                    value={form.origin}
                    onChange={(value) => update("origin", value)}
                    placeholder="e.g. Mumbai, India"
                  />
                  <Field
                    label="Home language"
                    value={form.homeLanguage}
                    onChange={(value) => update("homeLanguage", value)}
                    placeholder="e.g. English, Hindi"
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-[var(--shield-text-dim)]">
                  Pick your destination country. AbroadShield automatically adapts statutory working caps (e.g. 964h in France, 20h in UK), visa timelines, and official job adapters.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DESTINATIONS.map(([flag, value]) => {
                    const active = form.destination === value;
                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() => update("destination", value)}
                        className={`rounded-2xl border p-3 text-left text-xs font-semibold transition ${
                          active
                            ? "border-[oklch(0.76_0.18_160/0.7)] bg-[oklch(0.76_0.18_160/0.15)] text-white shadow-sm"
                            : "border-[var(--shield-border)] bg-[var(--shield-ink)] text-[var(--shield-text-dim)] hover:border-[var(--shield-border-strong)] hover:text-white"
                        }`}
                      >
                        <span className="mr-2 text-base">{flag}</span>
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <Field
                  label="Course / degree"
                  value={form.course}
                  onChange={(value) => update("course", value)}
                  placeholder="e.g. MSc Data Science & Artificial Intelligence"
                />
                <Field
                  label="Target university"
                  value={form.university}
                  onChange={(value) => update("university", value)}
                  placeholder="e.g. Télécom Paris / IP Paris"
                />
                <Field
                  label="Other target universities (optional)"
                  value={form.preferredUniversities}
                  onChange={(value) => update("preferredUniversities", value)}
                  placeholder="e.g. Sorbonne, EPITA, Paris-Saclay"
                />
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--shield-text-dim)]">
                    <Calendar className="h-3.5 w-3.5" />
                    Target Intake Season
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTAKES.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => update("intake", item)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                          form.intake === item
                            ? "border-[oklch(0.76_0.18_160/0.7)] bg-[oklch(0.76_0.18_160/0.18)] text-white"
                            : "border-[var(--shield-border)] bg-[var(--shield-ink)] text-[var(--shield-text-dim)] hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                  AbroadShield works backwards from your post-study career objective. By defining your target role now, your AI agent can prioritize relevant coursework, student visa work caps, and internships from day one.
                </div>
                <Field
                  label="Your full-time career goal"
                  value={form.careerGoal}
                  onChange={(value) => update("careerGoal", value)}
                  placeholder="e.g. Machine Learning Engineer at a French AI lab"
                />
                <p className="text-[11px] text-[var(--shield-text-faint)]">
                  You can refine this at any time in your Journey workspace.
                </p>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-xs font-medium text-[var(--shield-text-dim)]">
                    Where are you starting from right now?
                  </div>
                  <div className="space-y-2">
                    {PHASES.map((phase) => {
                      const active = form.currentPhase === phase.id;
                      return (
                        <button
                          type="button"
                          key={phase.id}
                          onClick={() => update("currentPhase", phase.id)}
                          className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition ${
                            active
                              ? "border-[oklch(0.76_0.18_160/0.7)] bg-[oklch(0.76_0.18_160/0.14)] text-white"
                              : "border-[var(--shield-border)] bg-[var(--shield-ink)] text-[var(--shield-text-dim)] hover:text-white"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                              active
                                ? "bg-[var(--shield-emerald-bright)] text-black font-bold"
                                : "bg-[var(--shield-ink-2)]"
                            }`}
                          >
                            {active ? <Check className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                          </span>
                          <div>
                            <span className="block text-xs font-bold text-white">{phase.label}</span>
                            <span className="mt-0.5 block text-[11px] text-[var(--shield-text-faint)]">
                              {phase.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.08)] p-3 text-xs text-[var(--shield-emerald-bright)]">
                  <ShieldCheck className="mr-1.5 inline h-4 w-4" />
                  Your journey starts with your profile &amp; statutory rules. Sensitive identity documents are never required at onboarding.
                </div>
              </div>
            )}

            {saveError && (
              <div role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {saveError}
              </div>
            )}

            {/* Step Controls */}
            <div className="mt-7 flex items-center justify-between border-t border-[var(--shield-border)] pt-5">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                disabled={step === 1 || saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--shield-text-dim)] disabled:opacity-30 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => canAdvance() && setStep((current) => current + 1)}
                  disabled={!canAdvance() || saving}
                  className="as-public-button-primary rounded-xl px-5 py-2.5 text-xs font-bold disabled:opacity-40"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={complete}
                  disabled={!canAdvance() || saving}
                  className="as-public-button-primary rounded-xl px-6 py-2.5 text-xs font-bold shadow-lg disabled:opacity-40"
                >
                  {saving ? (
                    "Initializing Co-Pilot…"
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Launch My Journey</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--shield-text-dim)]">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-[var(--shield-text-faint)] focus:border-[oklch(0.76_0.18_160/0.7)] ${
          readOnly ? "cursor-not-allowed opacity-60" : ""
        }`}
      />
    </div>
  );
}
