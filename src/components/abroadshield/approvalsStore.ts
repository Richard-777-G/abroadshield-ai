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
  externalMessageId?: string | null;
}

type NewApprovalEntry = Omit<ApprovalEntry, "id" | "time" | "recipient"> & { recipient?: string };

interface ApprovalsState {
  entries: ApprovalEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addEntry: (entry: NewApprovalEntry) => Promise<{ ok: boolean; error?: string; externalMessageId?: string | null }>;
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
    if (!response?.ok || !data?.ok) return { ok: false, error: data?.error || "Could not record the approval action." };
    const local: ApprovalEntry = {
      ...entry,
      recipient: entry.recipient?.trim() || "Not specified",
      id: data.entry?.id || `live-${Date.now()}`,
      time: new Date().toISOString(),
      externalMessageId: data.entry?.externalMessageId ?? null,
    };
    set((state) => ({ entries: [local, ...state.entries], hydrated: true }));
    return { ok: true, externalMessageId: local.externalMessageId };
  },
  clear: () => set({ entries: [] }),
}));
