import { db } from "@/lib/db";
import { buildRequirementSnapshot } from "./requirements";
import { normalizePhase } from "./journey";
import { getStagePolicy } from "./stage-orchestrator";

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export async function getJourneyApplicationSnapshot(userId: string, asOf = new Date().toISOString().slice(0, 10)) {
  if (!isValidDateOnly(asOf)) throw new Error("Invalid application date boundary.");
  const [user, profile] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, include: { journey: true } }),
    db.journeyProfile.findUnique({ where: { userId } }),
  ]);
  if (!user) return null;

  const phase = normalizePhase(profile?.currentPhase);
  const policy = getStagePolicy(phase);
  const [active, blocked, completed, recentCompleted] = await Promise.all([
    db.journeyTask.findMany({ where: { userId, phase, status: { in: ["queued", "running"] } }, orderBy: [{ priority: "asc" }, { dueAt: "asc" }, { createdAt: "asc" }], take: 10 }),
    db.journeyTask.findMany({ where: { userId, phase, status: "blocked" }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, type: true, title: true, status: true, priority: true, dueAt: true, result: true, createdAt: true } }),
    db.journeyTask.count({ where: { userId, phase, status: "completed" } }),
    db.journeyTask.findMany({ where: { userId, phase, status: "completed" }, orderBy: { completedAt: "desc" }, take: 3, select: { title: true, type: true, completedAt: true } }),
  ]);

  const blockedTypes = new Set(blocked.map((task) => task.type));
  const fallbackCapability = policy.capabilities.find((capability) => !blockedTypes.has(capability)) ?? policy.capabilities[0];
  const readiness = profile?.documentsTotal ? Math.round((profile.documentsVerified / Math.max(profile.documentsTotal, 1)) * 100) : profile?.readiness ?? 0;
  const next = active[0] ?? null;
  const fallback = !next ? { type: fallbackCapability, title: phase === "pre-departure" ? "Review your next pre-departure action" : `Review your next ${policy.title.toLowerCase()} action`, reason: policy.objective, capability: fallbackCapability } : null;

  return {
    user,
    profile,
    phase,
    policy,
    readiness,
    next,
    fallback,
    activeCount: active.length,
    blockedCount: blocked.length,
    completedCount: completed,
    blocked,
    recentCompleted,
    requirements: buildRequirementSnapshot({ destination: profile?.destination ?? undefined, currentPhase: profile?.currentPhase ?? undefined, documentsTotal: profile?.documentsTotal ?? undefined, documentsVerified: profile?.documentsVerified ?? undefined, readiness: profile?.readiness ?? undefined, visaAppointment: profile?.visaAppointment ?? undefined, funding: profile?.funding ?? undefined, asOf }),
  };
}
