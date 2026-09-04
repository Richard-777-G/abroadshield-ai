"use client";

import { create } from "zustand";

export type ApprovalAction = "approved" | "edited" | "declined";
export type ApprovalKind = "email" | "form" | "search" | "message" | "document";

export interface ApprovalEntry {
  id: string;
  action: ApprovalAction;
  kind: ApprovalKind;
  title: string;
  recipient: string;
  detail: string;
  time: string;
  phase: string;
}

type NewApprovalEntry = Omit<ApprovalEntry, "id" | "time" | "recipient"> & {
  recipient?: string;
};

interface ApprovalsState {
  entries: ApprovalEntry[];
  addEntry: (entry: NewApprovalEntry) => void;
  clear: () => void;
}

/** Approval history contains only actions taken in the current browser session. */
export const useApprovalsStore = create<ApprovalsState>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          recipient: entry.recipient?.trim() || "Not specified",
          id: `live-${Date.now()}`,
          time: "just now",
        },
        ...state.entries,
      ],
    })),
  clear: () => set({ entries: [] }),
}));
