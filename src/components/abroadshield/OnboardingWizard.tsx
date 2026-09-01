"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  GraduationCap,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Globe,
  Calendar,
} from "lucide-react";
import { useProfileStore } from "./profileStore";

const DESTINATIONS = [
  { label: "🇬🇧 United Kingdom", value: "United Kingdom" },
  { label: "🇺🇸 United States", value: "United States" },
  { label: "🇨🇦 Canada", value: "Canada" },
  { label: "🇦🇺 Australia", value: "Australia" },
  { label: "🇩🇪 Germany", value: "Germany" },
  { label: "🇮🇪 Ireland", value: "Ireland" },
  { label: "🇳🇱 Netherlands", value: "Netherlands" },
  { label: "🇫🇷 France", value: "France" },
  { label: "🇳🇿 New Zealand", value: "New Zealand" },
  { label: "🇸🇬 Singapore", value: "Singapore" },
];

const INTAKES = [
  "January 2026", "April 2026", "September 2026", "January 2027",
  "April 2027", "September 2027",
];

const PHASES = [
  { id: "pre-departure" as const, label: "Pre-Departure", desc: "Planning, visa, documents", icon: "✈️" },
  { id: "arrival" as const, label: "Arrival", desc: "Just landed / settling in", icon: "🏠" },
  { id: "studying" as const, label: "Studying", desc: "Currently enrolled", icon: "📚" },
  { id: "job-success" as const, label: "Job Search", desc: "Looking for work", icon: "💼" },
];

interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: 1, title: "Who are you?", subtitle: "Your name and contact", icon: <User className="h-5 w-5" /> },
  { id: 2, title: "Where are you from?", subtitle: "Your home city and country", icon: <MapPin className="h-5 w-5" /> },
  { id: 3, title: "Where are you going?", subtitle: "Your destination country", icon: <Globe className="h-5 w-5" /> },
  { id: 4, title: "What are you studying?", subtitle: "Course and university", icon: <GraduationCap className="h-5 w-5" /> },
  { id: 5, title: "Where are you now?", subtitle: "Your current journey phase", icon: <Calendar className="h-5 w-5" /> },
  { id: 6, title: "Documents", subtitle: "Rough count of your paperwork", icon: <FileCheck2 className="h-5 w-5" /> },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { profile, setProfile } = useProfileStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    origin: profile.origin,
    destination: profile.destination,
    course: profile.course,
    university: profile.university,
    intake: profile.intake,
    currentPhase: profile.currentPhase,
    documentsTotal: profile.documentsTotal,
    documentsVerified: profile.documentsVerified,
    homeLanguage: profile.homeLanguage ?? "",
  });

  const update = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canAdvance = () => {
    switch (step) {
      case 1: return form.name.trim().length > 1;
      case 2: return form.origin.trim().length > 2;
      case 3: return form.destination.length > 0;
      case 4: return form.course.trim().length > 2 && form.university.trim().length > 2;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  };

  const handleComplete = () => {
    setProfile({
      ...form,
      onboarded: true,
      readiness: Math.round((form.documentsVerified / Math.max(form.documentsTotal, 1)) * 100),
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--shield-ink)]/95 backdrop-blur-md">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[oklch(0.74_0.17_162/0.15)] blur-[80px]" />
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`rounded-full transition-all duration-300 ${
                s.id === step
                  ? "w-8 h-2 bg-[oklch(0.74_0.17_162)]"
                  : s.id < step
                  ? "w-2 h-2 bg-[oklch(0.74_0.17_162/0.6)]"
                  : "w-2 h-2 bg-[oklch(0.74_0.17_162/0.2)]"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-[oklch(0.74_0.17_162/0.25)] bg-[oklch(0.18_0.022_165/0.95)] p-8"
          >
            {/* step header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/0.15)] text-[oklch(0.74_0.17_162)]">
                {STEPS[step - 1].icon}
              </div>
              <div>
                <div className="text-[11px] font-medium text-[var(--shield-text-faint)] uppercase tracking-wider">
                  Step {step} of {STEPS.length}
                </div>
                <h2 className="text-xl font-semibold text-[var(--shield-text)]">
                  {STEPS[step - 1].title}
                </h2>
              </div>
            </div>

            {/* step content */}
            <div className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      Full name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Aarav Mehta"
                      className="w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.14_0.018_165)] px-4 py-2.5 text-sm text-[var(--shield-text)] placeholder-[var(--shield-text-faint)] outline-none focus:border-[oklch(0.74_0.17_162/0.6)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      Email (optional — for notifications)
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.14_0.018_165)] px-4 py-2.5 text-sm text-[var(--shield-text)] placeholder-[var(--shield-text-faint)] outline-none focus:border-[oklch(0.74_0.17_162/0.6)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      Home language
                    </label>
                    <input
                      type="text"
                      value={form.homeLanguage}
                      onChange={(e) => update("homeLanguage", e.target.value)}
                      placeholder="e.g. Marathi, Hindi, Tamil"
                      className="w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.14_0.018_165)] px-4 py-2.5 text-sm text-[var(--shield-text)] placeholder-[var(--shield-text-faint)] outline-none focus:border-[oklch(0.74_0.17_162/0.6)] transition"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <div>
                  <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                    Your home city and country *
                  </label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => update("origin", e.target.value)}
                    placeholder="e.g. Pune, India"
                    className="w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.14_0.018_165)] px-4 py-2.5 text-sm text-[var(--shield-text)] placeholder-[var(--shield-text-faint)] outline-none focus:border-[oklch(0.74_0.17_162/0.6)] transition"
                  />
                  <p className="mt-2 text-xs text-[var(--shield-text-faint)]">
                    The agent uses this to check currency, local bank requirements, and flight options.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                    Destination country *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DESTINATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => update("destination", d.value)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                          form.destination === d.value
                            ? "border-[oklch(0.74_0.17_162/0.6)] bg-[oklch(0.74_0.17_162/0.12)] text-[var(--shield-text)]"
                            : "border-[oklch(0.74_0.17_162/0.15)] text-[var(--shield-text-dim)] hover:border-[oklch(0.74_0.17_162/0.35)]"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      Course name *
                    </label>
                    <input
                      type="text"
                      value={form.course}
                      onChange={(e) => update("course", e.target.value)}
                      placeholder="e.g. MSc Data Science"
                      className="w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.14_0.018_165)] px-4 py-2.5 text-sm text-[var(--shield-text)] placeholder-[var(--shield-text-faint)] outline-none focus:border-[oklch(0.74_0.17_162/0.6)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      University *
                    </label>
                    <input
                      type="text"
                      value={form.university}
                      onChange={(e) => update("university", e.target.value)}
                      placeholder="e.g. University of Manchester"
                      className="w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.14_0.018_165)] px-4 py-2.5 text-sm text-[var(--shield-text)] placeholder-[var(--shield-text-faint)] outline-none focus:border-[oklch(0.74_0.17_162/0.6)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      Intake
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTAKES.map((i) => (
                        <button
                          key={i}
                          onClick={() => update("intake", i)}
                          className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                            form.intake === i
                              ? "border-[oklch(0.74_0.17_162/0.6)] bg-[oklch(0.74_0.17_162/0.12)] text-[var(--shield-text)]"
                              : "border-[oklch(0.74_0.17_162/0.15)] text-[var(--shield-text-dim)] hover:border-[oklch(0.74_0.17_162/0.35)]"
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 5 && (
                <div>
                  <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-2">
                    Where are you in the journey?
                  </label>
                  <div className="space-y-2">
                    {PHASES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => update("currentPhase", p.id)}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                          form.currentPhase === p.id
                            ? "border-[oklch(0.74_0.17_162/0.6)] bg-[oklch(0.74_0.17_162/0.12)]"
                            : "border-[oklch(0.74_0.17_162/0.15)] hover:border-[oklch(0.74_0.17_162/0.35)]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{p.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-[var(--shield-text)]">{p.label}</div>
                            <div className="text-xs text-[var(--shield-text-faint)]">{p.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      Total documents needed (approx.)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={5}
                        max={20}
                        value={form.documentsTotal}
                        onChange={(e) => update("documentsTotal", parseInt(e.target.value))}
                        className="flex-1 accent-[oklch(0.74_0.17_162)]"
                      />
                      <span className="w-8 text-center text-sm font-medium text-[var(--shield-text)]">
                        {form.documentsTotal}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--shield-text-dim)] mb-1.5">
                      Documents already verified / ready
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={form.documentsTotal}
                        value={form.documentsVerified}
                        onChange={(e) => update("documentsVerified", parseInt(e.target.value))}
                        className="flex-1 accent-[oklch(0.74_0.17_162)]"
                      />
                      <span className="w-8 text-center text-sm font-medium text-[var(--shield-text)]">
                        {form.documentsVerified}
                      </span>
                    </div>
                  </div>
                  {/* readiness preview */}
                  <div className="rounded-xl bg-[oklch(0.74_0.17_162/0.08)] p-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-[var(--shield-text-dim)]">Journey readiness</span>
                      <span className="font-medium text-[oklch(0.74_0.17_162)]">
                        {Math.round((form.documentsVerified / Math.max(form.documentsTotal, 1)) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[oklch(0.74_0.17_162/0.15)]">
                      <div
                        className="h-full rounded-full bg-[oklch(0.74_0.17_162)] transition-all duration-300"
                        style={{
                          width: `${Math.round((form.documentsVerified / Math.max(form.documentsTotal, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {step < STEPS.length ? (
                <button
                  onClick={() => canAdvance() && setStep((s) => s + 1)}
                  disabled={!canAdvance()}
                  className="flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-6 py-2.5 text-sm font-medium text-[oklch(0.14_0.018_165)] transition hover:bg-[oklch(0.85_0.19_158)] disabled:opacity-40"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-6 py-2.5 text-sm font-medium text-[oklch(0.14_0.018_165)] transition hover:bg-[oklch(0.85_0.19_158)]"
                >
                  <Sparkles className="h-4 w-4" />
                  Launch my agent
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
