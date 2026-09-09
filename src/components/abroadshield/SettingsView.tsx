"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import {
  User,
  Compass,
  GraduationCap,
  Building,
  Calendar,
  Globe,
  ShieldCheck,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Lock,
} from "lucide-react";
import { useProfileStore, type StudentProfile } from "./profileStore";
import type { WorkspaceView } from "./workspace-types";
import { PHASES } from "./data";
import type { PhaseId } from "@/lib/abroadshield/phase";

interface SettingsViewProps {
  onNavigate?: (view: WorkspaceView) => void;
}

const DESTINATIONS = [
  "France",
  "Germany",
  "United Kingdom",
  "Canada",
  "United States",
  "Ireland",
  "Australia",
  "Netherlands",
];

const INTAKES = [
  "Fall 2025 (September)",
  "Spring 2026 (January)",
  "Fall 2026 (September)",
  "Spring 2027 (January)",
];

export default function SettingsView({ onNavigate }: SettingsViewProps) {
  const { profile, setProfile } = useProfileStore();

  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    destination: profile.destination || "France",
    origin: profile.origin || "",
    university: profile.university || "",
    course: profile.course || "",
    intake: profile.intake || "Fall 2025 (September)",
    currentPhase: profile.currentPhase || ("pre-departure" as PhaseId),
    careerGoal: profile.careerGoal || "",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/abroadshield/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save profile settings.");
      }

      // Update client store
      setProfile(formData as Partial<StudentProfile>);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--shield-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[var(--shield-emerald-bright)] uppercase">
            <Lock className="h-3.5 w-3.5" />
            Authenticated Settings & Preferences
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Student Account & Journey Profile
          </h1>
          <p className="text-xs text-[var(--shield-text-dim)] mt-1 max-w-2xl">
            Configure your destination country, academic enrollment details, and active statutory parameters.
            All changes immediately synchronize with the co-pilot agent and eligibility engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Student Identity */}
        <section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[var(--shield-emerald-bright)]">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Student Identity</h2>
                <p className="text-xs text-[var(--shield-text-dim)]">Personal credentials and contact email</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[var(--shield-text-faint)]">ID: AUTH_VERIFIED</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)]">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="e.g. Richard Johnson"
                  className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-3)] px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-[var(--shield-emerald-bright)] focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)]">Authenticated Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm text-white/50 cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--shield-text-faint)]">Connected via OAuth or email login.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Destination & Academic Profile */}
        <section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sky-400">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Academic & Destination Context</h2>
                <p className="text-xs text-[var(--shield-text-dim)]">Governs statutory rules, work hourly limits, and job search adapters</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">STATUTORY ANCHOR</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)] flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                Target Destination Country
              </label>
              <select
                value={formData.destination}
                onChange={(e) => handleFieldChange("destination", e.target.value)}
                className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-3)] px-4 py-2.5 text-sm text-white focus:border-[var(--shield-emerald-bright)] focus:outline-none transition"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d} className="bg-[var(--shield-ink-3)] text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)] flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-sky-400" />
                Country of Origin
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleFieldChange("origin", e.target.value)}
                placeholder="e.g. India, Nigeria, Brazil"
                className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-3)] px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-[var(--shield-emerald-bright)] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)] flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-amber-400" />
                University / Institution
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => handleFieldChange("university", e.target.value)}
                placeholder="e.g. Sorbonne Université, HEC Paris, TU Munich"
                className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-3)] px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-[var(--shield-emerald-bright)] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)] flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-purple-400" />
                Degree / Course Program
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => handleFieldChange("course", e.target.value)}
                placeholder="e.g. MSc Data Science, MBA International Business"
                className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-3)] px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-[var(--shield-emerald-bright)] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                Target Intake Period
              </label>
              <select
                value={formData.intake}
                onChange={(e) => handleFieldChange("intake", e.target.value)}
                className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-3)] px-4 py-2.5 text-sm text-white focus:border-[var(--shield-emerald-bright)] focus:outline-none transition"
              >
                {INTAKES.map((i) => (
                  <option key={i} value={i} className="bg-[var(--shield-ink-3)] text-white">
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--shield-text-dim)] flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                Primary Career Ambition
              </label>
              <input
                type="text"
                value={formData.careerGoal}
                onChange={(e) => handleFieldChange("careerGoal", e.target.value)}
                placeholder="e.g. AI Research Engineer, Financial Analyst, Tech PM"
                className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-3)] px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-[var(--shield-emerald-bright)] focus:outline-none transition"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Journey Stage & Statutory Policy */}
        <section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Active Stage & Statutory Governance</h2>
                <p className="text-xs text-[var(--shield-text-dim)]">Defines agent mission priorities and permissible tools</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[var(--shield-emerald-bright)] font-semibold">STAGE ORCHESTRATION</span>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-semibold text-[var(--shield-text-dim)]">Current Journey Stage</label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PHASES.map((phase) => {
                const isSelected = formData.currentPhase === phase.id;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => handleFieldChange("currentPhase", phase.id)}
                    className={`text-left p-3.5 rounded-2xl border transition ${
                      isSelected
                        ? "border-[var(--shield-emerald-bright)] bg-emerald-500/10 text-white shadow-lg shadow-emerald-950/40"
                        : "border-[var(--shield-border)] bg-[var(--shield-ink-3)] text-white/70 hover:border-white/20"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-text-faint)]">
                      Stage {phase.index + 1}
                    </div>
                    <div className="text-xs font-bold text-white mt-1">{phase.name}</div>
                    <div className="text-[10px] text-[var(--shield-text-dim)] mt-1 line-clamp-2">
                      {phase.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Data Isolation & Connected Gateways */}
        <section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-amber-400">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Connected Gateways & Privacy</h2>
                <p className="text-xs text-[var(--shield-text-dim)]">External connectors and statutory data isolation</p>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("connectors")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--shield-emerald-bright)] hover:underline"
              >
                Manage Connectors <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-2xl border border-white/5 bg-[var(--shield-ink-3)] space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-emerald-400">France Travail API</div>
              <div className="text-xs font-bold text-white">Live Adapter Active</div>
              <p className="text-[11px] text-[var(--shield-text-dim)]">Verified employment and internship retrieval</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-[var(--shield-ink-3)] space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-sky-400">Statutory Knowledge Engine</div>
              <div className="text-xs font-bold text-white">Deterministic Mode</div>
              <p className="text-[11px] text-[var(--shield-text-dim)]">Art. R5221-26, Visale, CPAM Ameli regulations</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-[var(--shield-ink-3)] space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-purple-400">Data Sovereignty</div>
              <div className="text-xs font-bold text-white">Zero Telemetry Leaks</div>
              <p className="text-[11px] text-[var(--shield-text-dim)]">Isolated student profile persistence</p>
            </div>
          </div>
        </section>

        {/* Feedback Alerts & Submit Bar */}
        {saveError && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Profile settings saved successfully. Journey context updated.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--shield-border)]">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--shield-emerald-bright)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
