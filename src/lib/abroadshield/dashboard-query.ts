import { db } from "@/lib/db";
import { buildRequirementSnapshot } from "./requirements";
import { normalizePhase } from "./journey";
import { getStagePolicy } from "./stage-orchestrator";

export async function getDashboardSnapshot(userId: string) {
  const [user, profile] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, include: { journey: true } }),
    db.journeyProfile.findUnique({ where: { userId } }),
  ]);
  if (!user) return null;

  const phase = normalizePhase(profile?.currentPhase);
  const policy = getStagePolicy(phase);
  const [active, blocked, completed, recentCompleted] = await Promise.all([
    db.journeyTask.findMany({
      where: { userId, phase, status: { in: ["queued", "running"] } },
      orderBy: [{ priority: "asc" }, { dueAt: "asc" }, { createdAt: "asc" }],
      take: 10,
    }),
    db.journeyTask.findMany({
      where: { userId, phase, status: "blocked" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, title: true, status: true, priority: true, dueAt: true, result: true, createdAt: true },
    }),
    db.journeyTask.count({ where: { userId, phase, status: "completed" } }),
    db.journeyTask.findMany({
      where: { userId, phase, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 3,
      select: { title: true, type: true, completedAt: true },
    }),
  ]);

  const blockedTypes = new Set(blocked.map((task) => task.type));
  const fallbackCapability = policy.capabilities.find((capability) => !blockedTypes.has(capability)) ?? policy.capabilities[0];
  const readiness = profile?.documentsTotal ? Math.round((profile.documentsVerified / Math.max(profile.documentsTotal, 1)) * 100) : profile?.readiness ?? 0;
  const next = active[0] ?? null;
  const requirements = buildRequirementSnapshot(user.journey ?? undefined);
  const policyEvidence = requirements.requirements.find((item) => item.policyEvidence)?.policyEvidence ?? null;

  return {
    phase,
    stage: { title: policy.title, mission: policy.mission, objective: policy.objective, capabilities: policy.capabilities },
    readiness,
    next: next ? { id: next.id, type: next.type, title: next.title, status: next.status, priority: next.priority, dueAt: next.dueAt, result: next.result } : {
      type: fallbackCapability,
      title: phase === "pre-departure" ? "Review your next pre-departure action" : `Review your next ${policy.title.toLowerCase()} action`,
      reason: policy.objective,
      capability: fallbackCapability,
    },
    activeCount: active.length,
    blockedCount: blocked.length,
    completedCount: completed,
    blocked: blocked.map((task) => ({ id: task.id, type: task.type, title: task.title, status: task.status, priority: task.priority, dueAt: task.dueAt, result: task.result, createdAt: task.createdAt })),
    recentCompleted: recentCompleted.map((task) => ({ title: task.title, type: task.type, completedAt: task.completedAt })),
    allowedCapabilities: policy.capabilities,
    policyEvidence,
  };
}
