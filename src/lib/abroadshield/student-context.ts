import { db } from "@/lib/db";
import { normalizePhase } from "./journey";

export type StudentContextSnapshot = {
  student: { id: string; name?: string; email?: string; origin?: string; homeLanguage?: string };
  education: { course?: string; university?: string; intake?: string };
  destination: { country?: string; city?: string };
  journey: { phase: ReturnType<typeof normalizePhase>; readiness: number; documentsTotal: number; documentsVerified: number };
  career: { goal?: string; preferredUniversities?: string };
  constraints: { visaAppointment?: string; funding?: string };
};

function splitDestination(value?: string | null): { country?: string; city?: string } {
  const text = value?.trim();
  if (!text) return {};
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length >= 2 ? { city: parts[0], country: parts[parts.length - 1] } : { country: parts[0] };
}

/** Application DTO: keeps agent workflows independent from Prisma/domain record shapes. */
export async function getStudentContextSnapshot(userId: string): Promise<StudentContextSnapshot | null> {
  const [user, profile] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } }),
    db.journeyProfile.findUnique({ where: { userId } }),
  ]);
  if (!user) return null;
  const documentsTotal = profile?.documentsTotal ?? 0;
  const documentsVerified = profile?.documentsVerified ?? 0;
  const readiness = documentsTotal > 0 ? Math.round((documentsVerified / Math.max(documentsTotal, 1)) * 100) : profile?.readiness ?? 0;
  return {
    student: { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined, origin: profile?.origin ?? undefined, homeLanguage: profile?.homeLanguage ?? undefined },
    education: { course: profile?.course ?? undefined, university: profile?.university ?? undefined, intake: profile?.intake ?? undefined },
    destination: splitDestination(profile?.destination),
    journey: { phase: normalizePhase(profile?.currentPhase), readiness, documentsTotal, documentsVerified },
    career: { goal: profile?.careerGoal ?? undefined, preferredUniversities: profile?.preferredUniversities ?? undefined },
    constraints: { visaAppointment: profile?.visaAppointment ?? undefined, funding: profile?.funding ?? undefined },
  };
}
