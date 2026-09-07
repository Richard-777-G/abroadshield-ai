import type { PhaseId } from "../phase";

export type PolicyEvidenceView = {
  ruleId: string;
  ruleVersionId: string | null;
  status: string;
  authority: string | null;
  sourceUrl: string | null;
  reason?: string;
};

export type DashboardViewModel = {
  profile: {
    goal: string;
    destination: string | null;
    course: string | null;
    university: string | null;
    intake: string | null;
  };
  phase: { id: PhaseId; index: number; name: string; copy: string };
  route: Array<{ id: PhaseId; name: string; current: boolean; complete: boolean }>;
  stage: { title: string; mission: string; objective: string; capabilities: readonly string[] };
  readiness: number;
  next: {
    id?: string;
    title: string;
    reason?: string;
    type?: string;
    status?: string;
    priority?: string | number;
    dueAt?: string | Date | null;
    result?: unknown;
    capability?: string;
  } | null;
  activeCount: number;
  blockedCount: number;
  completedCount: number;
  blocked: Array<Record<string, unknown>>;
  recentCompleted: Array<Record<string, unknown>>;
  allowedCapabilities: readonly string[];
  policyEvidence: PolicyEvidenceView | null;
};
