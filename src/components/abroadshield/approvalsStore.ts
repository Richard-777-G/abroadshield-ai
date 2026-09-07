"use client";

import { create } from "zustand";

export type ApprovalAction = "approved" | "edited" | "declined";
export type ApprovalKind = "email" | "form" | "search" | "message" | "document";
export type ApprovalExecutionStatus = "sent" | "recorded" | "blocked" | "failed";

export interface ApprovalEntry {
  id: string;
  action: ApprovalAction;
  kind: ApprovalKind;
  title: string;
  recipient: string;
  detail: string;
  time: string;
  phase: string;
  externalMessageId?: string | null;
  executionStatus?: ApprovalExecutionStatus;
  executionError?: string | null;
}

type NewApprovalEntry = Omit<ApprovalEntry, "id" | "time" | "recipient"> & { recipient?: string };

interface ApprovalsState {
  entries: ApprovalEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addEntry: (entry: NewApprovalEntry) => Promise<{ ok: boolean; error?: string; externalMessageId?: string | null; executionStatus?: ApprovalExecutionStatus }>;
  clear: () => void;
}

export const useApprovalsStore = create<ApprovalsState>((set) => ({
  entries: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const response = await fetch("/api/abroadshield/approvals", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.ok && Array.isArray(data.entries)) set({ entries: data.entries, hydrated: true });
      else set({ hydrated: true });
    } catch { set({ hydrated: true }); }
  },
  addEntry: async (entry) => {
    const response = await fetch("/api/abroadshield/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, recipient: entry.recipient?.trim() || undefined }),
    }).catch(() => null);
    const data = await response?.json().catch(() => ({}));
    if (!response?.ok || !data?.ok) return { ok: false, error: data?.error || "Could not record the approval action.", executionStatus: data?.entry?.executionStatus };
    const serverEntry = data.entry;
    const local: ApprovalEntry = {
      ...entry,
      recipient: entry.recipient?.trim() || "Not specified",
      id: serverEntry?.id || `live-${Date.now()}`,
      time: serverEntry?.time || new Date().toISOString(),
      externalMessageId: serverEntry?.externalMessageId ?? null,
      executionStatus: serverEntry?.executionStatus ?? "recorded",
      executionError: serverEntry?.executionError ?? null,
    };
    set((state) => ({ entries: [local, ...state.entries], hydrated: true }));
    return { ok: true, externalMessageId: local.externalMessageId, executionStatus: local.executionStatus };
  },
  clear: () => set({ entries: [] }),
}));
