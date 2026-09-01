"use client";

import { create } from "zustand";

/* ---------------------------------------------------------------------------
 * Student Profile Store
 * Persists in localStorage so the agent remembers the student across sessions.
 * --------------------------------------------------------------------------- */

export interface StudentProfile {
  name: string;
  email: string;
  origin: string;          // e.g. "Pune, India"
  destination: string;     // e.g. "United Kingdom"
  course: string;          // e.g. "MSc Data Science"
  university: string;      // e.g. "University of Manchester"
  intake: string;          // e.g. "September 2026"
  currentPhase: "pre-departure" | "arrival" | "studying" | "job-success";
  readiness: number;       // 0–100
  onboarded: boolean;
  documentsTotal: number;
  documentsVerified: number;
  visaAppointment?: string;
  funding?: string;
  homeLanguage?: string;
}

const DEFAULT_PROFILE: StudentProfile = {
  name: "Aarav Mehta",
  email: "",
  origin: "Pune, India",
  destination: "United Kingdom",
  course: "MSc Data Science",
  university: "University of Manchester",
  intake: "September 2026",
  currentPhase: "pre-departure",
  readiness: 72,
  onboarded: true,           // default profile is pre-filled
  documentsTotal: 13,
  documentsVerified: 11,
  visaAppointment: "28 Aug 2026, 09:30 IST",
  funding: "£28,500",
  homeLanguage: "Marathi",
};

interface ProfileStore {
  profile: StudentProfile;
  setProfile: (p: Partial<StudentProfile>) => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => {
  // Load from localStorage on init
  let initial = DEFAULT_PROFILE;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("abroadshield-profile");
      if (saved) {
        initial = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }

  return {
    profile: initial,
    setProfile: (partial) =>
      set((state) => {
        const updated = { ...state.profile, ...partial };
        if (typeof window !== "undefined") {
          localStorage.setItem("abroadshield-profile", JSON.stringify(updated));
        }
        return { profile: updated };
      }),
    resetProfile: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("abroadshield-profile");
      }
      set({ profile: DEFAULT_PROFILE });
    },
  };
});
