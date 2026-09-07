"use client";

import { useProfileStore } from "./profileStore";
import type { JourneyProfileViewModel } from "@/lib/abroadshield/types/view-models";

export type JourneyWorkspaceClientViewModel = {
  profile: JourneyProfileViewModel;
  hydrated: boolean;
  setProfile: (profile: Partial<JourneyProfileViewModel>) => void;
};

export function useJourneyWorkspaceViewModel(): JourneyWorkspaceClientViewModel {
  const profile = useProfileStore((state) => state.profile);
  const hydrated = useProfileStore((state) => state.hydrated);
  const setProfile = useProfileStore((state) => state.setProfile);
  return { profile, hydrated, setProfile };
}
