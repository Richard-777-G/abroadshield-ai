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

/**
 * Shared approvals store — when a user clicks Approve / Edit / Decline on an
 * agent chat draft, the action is recorded here. The ApprovalsHistory section
 * reads from this store so the timeline reflects real user actions (seeded
 * with realistic mock data so the section is never empty on first load).
 */
const SEED: ApprovalEntry[] = [
  {
    id: "seed-1",
    action: "approved",
    kind: "email",
    title: "Consulate reschedule request",
    recipient: "UK Visa & Immigration",
    detail: "Reschedule 28 Aug appointment to 02 Sep due to delayed bank statement page.",
    time: "2 min ago",
    phase: "Pre-Departure",
  },
  {
    id: "seed-2",
    action: "approved",
    kind: "form",
    title: "FRRO registration form",
    recipient: "Foreigners Regional Registration Office",
    detail: "Pre-filled form with student details, passport, and visa info. Slot booked.",
    time: "3 hr ago",
    phase: "Arrival",
  },
  {
    id: "seed-3",
    action: "edited",
    kind: "email",
    title: "Landlord viewing reply",
    recipient: "Maple St Property Management",
    detail: "You edited the tone to be more formal. Agent re-sent with your changes.",
    time: "5 hr ago",
    phase: "Arrival",
  },
  {
    id: "seed-4",
    action: "approved",
    kind: "search",
    title: "Housing shortlist (5 listings)",
    recipient: "Saved to your vault",
    detail: "5 listings matched £650/mo budget, 35-min commute, bills included.",
    time: "8 hr ago",
    phase: "Arrival",
  },
  {
    id: "seed-5",
    action: "declined",
    kind: "message",
    title: "Off-campus job application",
    recipient: "Local café (unverified)",
    detail: "Agent flagged: this role would breach your 20-hr Tier-4 work-hour cap. You declined.",
    time: "1 day ago",
    phase: "Studying",
  },
  {
    id: "seed-6",
    action: "approved",
    kind: "document",
    title: "Sponsorship letter draft",
    recipient: "Parent (for review)",
    detail: "Drafted sponsorship letter with financial details. Sent to parent for sign-off.",
    time: "1 day ago",
    phase: "Pre-Departure",
  },
  {
    id: "seed-7",
    action: "approved",
    kind: "email",
    title: "Bank appointment request",
    recipient: "Barclays Student Branch",
    detail: "Drafted appointment-request email. 2 branches compared by student-account perks.",
    time: "2 days ago",
    phase: "Arrival",
  },
  {
    id: "seed-8",
    action: "edited",
    kind: "search",
    title: "CV tailored — Solutions Engineer",
    recipient: "Saved to your vault",
    detail: "You edited the summary line. Agent updated 12 tailored CV versions with your tone.",
    time: "3 days ago",
    phase: "Job Success",
  },
];

export const useApprovalsStore = create<ApprovalsState>((set) => ({
  entries: SEED,
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
