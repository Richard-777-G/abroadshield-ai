import { getJourneyApplicationSnapshot } from "./journey-query";
import type { DashboardViewModel } from "./types/view-models";
import type { PhaseId } from "./phase";

const PHASE_VIEW: Record<PhaseId, { name: string; copy: string }> = {
  "pre-departure": { name: "Pre-Departure", copy: "Define the path, strengthen the profile and prepare the move." },
  arrival: { name: "Arrival", copy: "Settle in and turn the study move into a career-building plan." },
  studying: { name: "Studying & Part-Time", copy: "Build evidence, skills and network while you study." },
  "job-success": { name: "Job Success", copy: "Convert your experience into targeted roles and full-time opportunities." },
};

const PHASE_ORDER: PhaseId[] = ["pre-departure", "arrival", "studying", "job-success"];

export async function getDashboardSnapshot(userId: string, asOf = new Date().toISOString().slice(0, 10)): Promise<DashboardViewModel | null> {
  const snapshot = await getJourneyApplicationSnapshot(userId, asOf);
  if (!snapshot) return null;

  const phaseIndex = PHASE_ORDER.indexOf(snapshot.phase);
  const phaseView = PHASE_VIEW[snapshot.phase];
  const policyEvidence = snapshot.requirements.requirements.find((item) => item.policyEvidence)?.policyEvidence ?? null;

  return {
    profile: {
      goal: snapshot.profile?.careerGoal || "Define the full-time career outcome you want to build toward.",
      destination: snapshot.profile?.destination ?? null,
      course: snapshot.profile?.course ?? null,
      university: snapshot.profile?.university ?? null,
      intake: snapshot.profile?.intake ?? null,
    },
    phase: { id: snapshot.phase, index: phaseIndex, name: phaseView.name, copy: phaseView.copy },
    route: PHASE_ORDER.map((id, index) => ({ id, name: PHASE_VIEW[id].name, current: index === phaseIndex, complete: index < phaseIndex })),
    stage: { title: snapshot.policy.title, mission: snapshot.policy.mission, objective: snapshot.policy.objective, capabilities: snapshot.policy.capabilities },
    readiness: snapshot.readiness,
    next: snapshot.next
      ? { id: snapshot.next.id, type: snapshot.next.type, title: snapshot.next.title, status: snapshot.next.status, priority: snapshot.next.priority, dueAt: snapshot.next.dueAt, result: snapshot.next.result }
      : snapshot.fallback,
    activeCount: snapshot.activeCount,
    blockedCount: snapshot.blockedCount,
    completedCount: snapshot.completedCount,
    blocked: snapshot.blocked.map((task) => ({ id: task.id, type: task.type, title: task.title, status: task.status, priority: task.priority, dueAt: task.dueAt, result: task.result, createdAt: task.createdAt })),
    recentCompleted: snapshot.recentCompleted.map((task) => ({ title: task.title, type: task.type, completedAt: task.completedAt })),
    allowedCapabilities: snapshot.policy.capabilities,
    policyEvidence,
  };
}
