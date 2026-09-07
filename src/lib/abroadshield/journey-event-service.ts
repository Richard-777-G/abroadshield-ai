import { db } from "@/lib/db";
import { normalizePhase } from "./journey";

export async function listJourneyEvents(userId: string) {
  return db.journeyEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function recordJourneyEvent(userId: string, input: {
  phase?: unknown;
  type?: unknown;
  title?: unknown;
  detail?: unknown;
  metadata?: unknown;
}) {
  const phase = typeof input.phase === "string" ? input.phase : undefined;

  return db.journeyEvent.create({
    data: {
      userId,
      phase: normalizePhase(phase),
      type: String(input.type || "activity"),
      title: String(input.title || "Journey activity"),
      detail: input.detail ? String(input.detail) : null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}
