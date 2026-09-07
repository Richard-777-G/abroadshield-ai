import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import { getAgentProfile } from "@/lib/abroadshield/journey-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checks = [
  ["destination", "Destination is set", "Choose the country you intend to study in."],
  ["course", "Course is set", "Add the course or degree you are targeting."],
  ["university", "University is set", "Add your current target university or institution."],
  ["intake", "Intake is set", "Add the intended intake so the journey has a time anchor."],
  ["careerGoal", "Career outcome is set", "Define the full-time role or career outcome you are building toward."],
  ["preferredUniversities", "University shortlist exists", "Add at least one alternative university or a shortlist."],
] as const;

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const profile = await getAgentProfile(user.id);
    if (!profile) return NextResponse.json({ ok: false, error: "Journey profile not found." }, { status: 404 });

    const results = checks.map(([field, label, guidance]) => ({
      field,
      label,
      guidance,
      passed: Boolean(String(profile[field as keyof typeof profile] ?? "").trim()),
    }));
    const passed = results.filter((item) => item.passed).length;
    const score = Math.round((passed / results.length) * 100);
    const criticalMissing = results.filter((item) => !item.passed).map((item) => item.field);
    const phase = profile.currentPhase;

    return NextResponse.json({
      ok: true,
      score,
      phase,
      passed,
      total: results.length,
      status: score === 100 ? "ready_for_agent_work" : score >= 67 ? "usable_with_gaps" : "profile_incomplete",
      results,
      next: criticalMissing.length ? results.find((item) => !item.passed)?.guidance : "Run a real journey task with the agent to test execution.",
    });
  } catch (error) {
    console.error("[abroadshield/profile-test]", error);
    return NextResponse.json({ ok: false, error: "Could not test the profile." }, { status: 500 });
  }
}
