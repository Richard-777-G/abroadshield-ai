"use client";

import { create } from "zustand";

export interface StudentProfile {
  name: string;
  email: string;
  origin: string;
  destination: string;
  course: string;
  university: string;
  intake: string;
  currentPhase: "pre-departure" | "arrival" | "studying" | "job-success";
  readiness: number;
  onboarded: boolean;
  documentsTotal: number;
  documentsVerified: number;
  visaAppointment?: string;
  funding?: string;
  homeLanguage?: string;
}

const DEFAULT_PROFILE: StudentProfile = {
  name: "",
  email: "",
  origin: "",
  destination: "",
  course: "",
  university: "",
  intake: "",
  currentPhase: "pre-departure",
  readiness: 0,
  onboarded: false,
  documentsTotal: 0,
  documentsVerified: 0,
};

interface ProfileStore {
  profile: StudentProfile;
  setProfile: (p: Partial<StudentProfile>) => void;
  resetProfile: () => void;
}

function persistProfile(profile: StudentProfile) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(profile);
  localStorage.setItem("abroadshield-profile", serialized);
  // A short-lived, non-authentication cookie lets server-side task execution
  // use the same onboarding profile without treating browser storage as a
  // credential. Authentication still comes exclusively from NextAuth.
  document.cookie = `abroadshield-profile=${encodeURIComponent(serialized)}; Path=/; Max-Age=2592000; SameSite=Lax`;
}

export const useProfileStore = create<ProfileStore>((set) => {
  let initial = DEFAULT_PROFILE;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("abroadshield-profile");
      if (saved) initial = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {
      // ignore malformed local state and use the clean profile
    }
  }

  return {
    profile: initial,
    setProfile: (partial) =>
      set((state) => {
        const updated = { ...state.profile, ...partial };
        persistProfile(updated);
        return { profile: updated };
      }),
    resetProfile: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("abroadshield-profile");
        document.cookie = "abroadshield-profile=; Path=/; Max-Age=0; SameSite=Lax";
      }
      set({ profile: DEFAULT_PROFILE });
    },
  };
});
