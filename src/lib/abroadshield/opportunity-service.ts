import { db } from "@/lib/db";
import type { Opportunity } from "./opportunity-types";
import { normalizePhase } from "./journey";
import {
  getStudentContextSnapshot,
  type StudentContextSnapshot,
} from "./student-context";

export type ApplicationPreparationPlan = {
  opportunityId: string;
  title: string;
  employer: string;
  sourceUrl: string;
  contractType: string;
  capabilityLevel: "L1";
  analysis: {
    matchingStrengths: string[];
    potentialGaps: string[];
    keyKeywords: string[];
  };
  recommendedActions: Array<{
    step: number;
    title: string;
    description: string;
    actionablePrompt: string;
  }>;
  externalApplicationNotice: string;
};

export type SavedOpportunityRecord = {
  id: string;
  opportunityId: string;
  title: string;
  employer: string;
  location?: string;
  contractType: string;
  sourceUrl: string;
  status: "saved" | "preparing" | "applied" | "archived";
  savedAt: string;
  opportunity: Opportunity;
};

/**
 * Save an opportunity into the student's persistent journey.
 * Uses JourneyTask with type "saved_opportunity" so it remains durable across sessions.
 */
export async function saveOpportunity(
  userId: string,
  opportunity: Opportunity,
): Promise<{ ok: boolean; savedId: string; alreadySaved: boolean }> {
  const existing = await db.journeyTask.findFirst({
    where: {
      userId,
      type: "saved_opportunity",
      title: opportunity.title,
    },
  });

  if (existing) {
    return { ok: true, savedId: existing.id, alreadySaved: true };
  }

  const profile = await db.journeyProfile.findUnique({
    where: { userId },
    select: { currentPhase: true },
  });
  const phase = normalizePhase(profile?.currentPhase);

  const task = await db.journeyTask.create({
    data: {
      userId,
      phase,
      type: "saved_opportunity",
      title: opportunity.title,
      status: "saved",
      priority: "medium",
      result: JSON.stringify(opportunity),
    },
  });

  await db.journeyEvent.create({
    data: {
      userId,
      phase,
      type: "opportunity_saved",
      title: `Saved opportunity: ${opportunity.title}`,
      detail: `${opportunity.employer} · ${opportunity.location || "France"} (${opportunity.contractType.replaceAll("_", " ")})`,
      metadata: JSON.stringify({
        canonicalId: opportunity.canonicalId,
        providerId: opportunity.providerId,
        sourceUrl: opportunity.applicationUrl || opportunity.sourceUrl,
      }),
    },
  });

  return { ok: true, savedId: task.id, alreadySaved: false };
}

/**
 * List all saved opportunities for a student.
 */
export async function listSavedOpportunities(
  userId: string,
): Promise<SavedOpportunityRecord[]> {
  const tasks = await db.journeyTask.findMany({
    where: {
      userId,
      type: "saved_opportunity",
    },
    orderBy: { createdAt: "desc" },
  });

  const records: SavedOpportunityRecord[] = [];
  for (const task of tasks) {
    try {
      if (!task.result) continue;
      const opportunity = JSON.parse(task.result) as Opportunity;
      records.push({
        id: task.id,
        opportunityId: opportunity.canonicalId,
        title: opportunity.title,
        employer: opportunity.employer,
        location: opportunity.location,
        contractType: opportunity.contractType,
        sourceUrl: opportunity.applicationUrl || opportunity.sourceUrl,
        status: (task.status as SavedOpportunityRecord["status"]) || "saved",
        savedAt: task.createdAt.toISOString(),
        opportunity,
      });
    } catch {
      // Ignore corrupted entries
    }
  }

  return records;
}

/**
 * Prepare application materials for an opportunity.
 * Computes deterministic requirement comparison and suggests tailored CV actions.
 * Does NOT falsely claim an external application was submitted.
 */
export async function prepareOpportunityApplication(
  userId: string,
  opportunity: Opportunity,
  existingStudent?: StudentContextSnapshot | null,
): Promise<ApplicationPreparationPlan> {
  let student = existingStudent ?? null;
  if (!student) {
    try {
      student = await getStudentContextSnapshot(userId);
    } catch {
      student = null;
    }
  }
  const course = student?.education.course || "your course";
  const university = student?.education.university || "your university";

  const matchingStrengths: string[] = [];
  const potentialGaps: string[] = [];
  const keyKeywords: string[] = [];

  if (opportunity.requiredSkills && opportunity.requiredSkills.length > 0) {
    keyKeywords.push(...opportunity.requiredSkills.slice(0, 6));
  } else {
    keyKeywords.push(opportunity.title, course, "Student worker");
  }

  matchingStrengths.push(
    `Aligned with degree in ${course} at ${university}.`,
    `Location fits student destination (${opportunity.location || "France"}).`,
  );

  if (opportunity.contractType === "apprenticeship") {
    potentialGaps.push(
      "Alternance requires formal tripartite contract (university + employer + student) and OPCO validation.",
    );
  } else if (opportunity.contractType === "part_time") {
    potentialGaps.push(
      "Confirm scheduled working hours comply with 964-hour annual student work budget.",
    );
  }

  if (opportunity.requiredLanguages && opportunity.requiredLanguages.length > 0) {
    potentialGaps.push(
      `Required language proficiency: ${opportunity.requiredLanguages.join(", ")}.`,
    );
  }

  const plan: ApplicationPreparationPlan = {
    opportunityId: opportunity.canonicalId,
    title: opportunity.title,
    employer: opportunity.employer,
    sourceUrl: opportunity.applicationUrl || opportunity.sourceUrl,
    contractType: opportunity.contractType,
    capabilityLevel: "L1",
    analysis: {
      matchingStrengths,
      potentialGaps,
      keyKeywords,
    },
    recommendedActions: [
      {
        step: 1,
        title: "Tailor your CV for this role",
        description: `Highlight ${keyKeywords.slice(0, 3).join(", ")} and your ${course} coursework.`,
        actionablePrompt: `Tailor my CV specifically for the position of "${opportunity.title}" at "${opportunity.employer}". Emphasize keywords: ${keyKeywords.join(", ")}.`,
      },
      {
        step: 2,
        title: "Draft application motivation note",
        description: `Prepare a concise French cover letter / motivation note structured for ${opportunity.employer}.`,
        actionablePrompt: `Draft a professional motivation letter in French for "${opportunity.title}" at "${opportunity.employer}", explaining my background in ${course} and availability.`,
      },
      {
        step: 3,
        title: "Submit directly on official source",
        description: "Review your tailored materials and submit through the verified provider link.",
        actionablePrompt: `I am ready to review the final application checklist for "${opportunity.title}".`,
      },
    ],
    externalApplicationNotice:
      "This listing has L1 capability (Discovery + Preparation). AbroadShield does not auto-submit applications to France Travail or external employers. You will submit directly using the verified link.",
  };

  // Update task status if saved and DB is accessible
  if (process.env.DATABASE_URL) {
    try {
      const existing = await db.journeyTask.findFirst({
        where: {
          userId,
          type: "saved_opportunity",
          title: opportunity.title,
        },
      });

      if (existing) {
        await db.journeyTask.update({
          where: { id: existing.id },
          data: { status: "preparing" },
        });
      }
    } catch {
      // Database is optional during isolated unit testing
    }
  }

  return plan;
}
