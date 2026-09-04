"use client";

import { create } from "zustand";

export type PhaseId = "pre-departure" | "arrival" | "studying" | "job-success";
export interface StudentProfile {
  name: string; email: string; origin: string; destination: string; course: string; university: string; intake: string;
  currentPhase: PhaseId; readiness: number; onboarded: boolean; documentsTotal: number; documentsVerified: number;
  visaAppointment?: string; funding?: string; homeLanguage?: string;
}
const DEFAULT_PROFILE: StudentProfile = { name: "", email: "", origin: "", destination: "", course: "", university: "", intake: "", currentPhase: "pre-departure", readiness: 0, onboarded: false, documentsTotal: 0, documentsVerified: 0 };
interface ProfileStore { profile: StudentProfile; hydrated: boolean; setProfile: (p: Partial<StudentProfile>) => void; hydrateFromServer: () => Promise<void>; resetProfile: () => void; }
function persistLocal(profile: StudentProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem("abroadshield-profile", JSON.stringify(profile));
}
export const useProfileStore = create<ProfileStore>((set) => {
  let initial = DEFAULT_PROFILE;
  if (typeof window !== "undefined") {
    try { const saved = localStorage.getItem("abroadshield-profile"); if (saved) initial = { ...DEFAULT_PROFILE, ...JSON.parse(saved) }; } catch { /* clean fallback */ }
  }
  return {
    profile: initial,
    hydrated: false,
    setProfile: (partial) => set((state) => { const updated = { ...state.profile, ...partial }; persistLocal(updated); return { profile: updated }; }),
    hydrateFromServer: async () => {
      try {
        const res = await fetch("/api/abroadshield/journey", { cache: "no-store" });
        if (!res.ok) {
          set({ hydrated: true });
          return;
        }
        const data = await res.json();
        if (!data?.profile) {
          persistLocal(DEFAULT_PROFILE);
          set({ profile: DEFAULT_PROFILE, hydrated: true });
          return;
        }
        const server = data.profile;
        const profile: StudentProfile = { ...DEFAULT_PROFILE, ...server };
        persistLocal(profile);
        set({ profile, hydrated: true });
      } catch {
        set({ hydrated: true });
      }
    },
    resetProfile: () => { if (typeof window !== "undefined") localStorage.removeItem("abroadshield-profile"); set({ profile: DEFAULT_PROFILE, hydrated: true }); },
  };
});
