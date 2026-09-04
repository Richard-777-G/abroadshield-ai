"use client";

import { create } from "zustand";
import type { PhaseId } from "@/lib/abroadshield/phase";

export type { PhaseId } from "@/lib/abroadshield/phase";

export interface StudentProfile {
  name: string; email: string; origin: string; destination: string; course: string; university: string; intake: string;
  currentPhase: PhaseId; readiness: number; onboarded: boolean; documentsTotal: number; documentsVerified: number;
  visaAppointment?: string; funding?: string; homeLanguage?: string;
}

const DEFAULT_PROFILE: StudentProfile = { name: "", email: "", origin: "", destination: "", course: "", university: "", intake: "", currentPhase: "pre-departure", readiness: 0, onboarded: false, documentsTotal: 0, documentsVerified: 0 };

interface ProfileStore {
  profile: StudentProfile;
  hydrated: boolean;
  setProfile: (p: Partial<StudentProfile>) => void;
  hydrateFromServer: () => Promise<void>;
  resetProfile: () => void;
}

function persistLocal(profile: StudentProfile) {
  if (typeof window !== "undefined") localStorage.setItem("abroadshield-profile", JSON.stringify(profile));
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: DEFAULT_PROFILE,
  hydrated: false,
  setProfile: (partial) => set((state) => {
    const updated = { ...state.profile, ...partial };
    persistLocal(updated);
    return { profile: updated };
  }),
  hydrateFromServer: async () => {
    set({ hydrated: false });
    try {
      const res = await fetch("/api/abroadshield/journey", { cache: "no-store" });
      if (res.status === 401) {
        if (typeof window !== "undefined") localStorage.removeItem("abroadshield-profile");
        set({ profile: DEFAULT_PROFILE, hydrated: true });
        return;
      }
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
      const profile: StudentProfile = { ...DEFAULT_PROFILE, ...data.profile };
      persistLocal(profile);
      set({ profile, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  resetProfile: () => {
    if (typeof window !== "undefined") localStorage.removeItem("abroadshield-profile");
    set({ profile: DEFAULT_PROFILE, hydrated: true });
  },
}));
