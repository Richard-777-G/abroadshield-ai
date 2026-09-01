import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { normalizePhase } from "@/lib/abroadshield/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TASKS = ["document_check", "draft_email", "job_search", "tailor_cv", "deadline_scan", "housing_search", "visa_check"] as const;
type TaskType = (typeof TASKS)[number];
type TaskRequest = { taskType?: string; context?: string; phase?: string };

function taskInstruction(taskType: TaskType, profileContext: string, request: string, phase: string) {
  const common = `You are an execution agent inside AbroadShield AI.\nCURRENT STAGE: ${phase}\nAUTHENTICATED STUDENT PROFILE:\n${profileContext}\n\nRules:\n- Work only with facts supplied by the profile or task request.\n- Never claim an external action happened unless this request actually performs it.\n- Never fabricate live URLs, employers, deadlines, prices, legal requirements, listings, or verification results.\n- If live external data or a connector is required but unavailable, say so explicitly.\n- Return valid JSON only.`;
  const instructions: Record<TaskType, string> = {
    document_check: `${common}\nPerform an informational document pre-check, not legal certification. Return {"status":"verified|issue|missing|needs_review","summary":string,"issues":string[],"agentActions":string[],"priority":"critical|high|medium|low","verificationNote":string}.`,
    draft_email: `${common}\nDraft a professional email. Return {"subject":string,"to":"recipient/role","body":string,"notes":string,"requiresApproval":true}. Do not send it.`,
    job_search: `${common}\nCreate a research-ready search specification for the CURRENT STAGE. If live job data is unavailable, return a search specification and say live results require live search. Return {"status":"needs_live_search|shortlist","query":string,"criteria":string[],"roles":[{"title":string,"company":string,"location":string,"matchReason":string,"sponsorshipStatus":"unknown|verified","source":"needs_live_search"}],"nextAction":string}.`,
    tailor_cv: `${common}\nTailor CV content only from supplied facts. Never invent experience or metrics. Return {"role":string,"bulletPoints":string[],"keywords":string[],"coverLetterOpening":string,"agentNote":string}.`,
    deadline_scan: `${common}\nIdentify deadlines only from supplied dates. Never invent countdowns. Return {"status":"ready|needs_profile_data","deadlines":[{"title":string,"date":string,"severity":"critical|warning|info","description":string,"agentAction":string}],"missingData":string[]}.`,
    housing_search: `${common}\nBuild a housing search specification. Do not invent live listings. Return {"status":"needs_live_search|ready","searchArea":string,"criteria":string[],"budget":string,"nextAction":string}.`,
    visa_check: `${common}\nAnswer conservatively, distinguish guidance from legal advice, and name the official authority to verify. Return {"question":string,"answer":string,"riskLevel":"none|low|medium|high","officialAuthority":string,"agentActions":string[]}.`,
  };
  return `${instructions[taskType]}\n\nTASK REQUEST: ${request}`;
}

async function resolveUser() {
  const session = await getServerSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!id && !email) return null;
  return id
    ? db.user.upsert({ where: { id }, update: { name: session?.user?.name ?? undefined, email: email ?? undefined }, create: { id, email: email || `${id}@local.invalid`, name: session?.user?.name ?? undefined } })
    : db.user.upsert({ where: { email: email! }, update: { name: session?.user?.name ?? undefined }, create: { email: email!, name: session?.user?.name ?? undefined } });
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as TaskRequest;
    const taskType = body.taskType as TaskType | undefined;
    if (!taskType || !TASKS.includes(taskType)) return NextResponse.json({ ok: false, error: `Unknown task type. Valid types: ${TASKS.join(", ")}` }, { status: 400 });
    const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const phase = normalizePhase(body.phase || journey?.currentPhase);
    const profile: AgentProfile = {
      name: user.name ?? undefined, email: user.email, origin: journey?.origin, destination: journey?.destination,
      course: journey?.course, university: journey?.university, intake: journey?.intake, currentPhase: phase,
      documentsTotal: journey?.documentsTotal, documentsVerified: journey?.documentsVerified,
      visaAppointment: journey?.visaAppointment ?? undefined, funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined,
    };
    const request = body.context?.trim() || `Execute ${taskType} for this student.`;
    const task = await db.journeyTask.create({ data: { userId: user.id, phase, type: taskType, title: request.slice(0, 120), status: "running" } });
    await db.journeyEvent.create({ data: { userId: user.id, phase, type: "task_started", title: request.slice(0, 120), detail: `Agent started ${taskType}.` } });
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({ messages: [{ role: "system", content: taskInstruction(taskType, buildAgentContext(profile), request, phase) }, { role: "user", content: request }], thinking: { type: "disabled" } });
      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!raw) throw new Error("Agent returned an empty result.");
      let result: unknown = raw;
      try { result = JSON.parse(raw); } catch { /* preserve raw result */ }
      const resultStatus = typeof result === "object" && result !== null && "status" in result ? String((result as { status?: unknown }).status) : "completed";
      const externallyBlocked = resultStatus === "needs_live_search" || resultStatus === "needs_profile_data";
      const status = externallyBlocked ? "blocked" : "completed";
      await db.journeyTask.update({ where: { id: task.id }, data: { status, result: JSON.stringify(result), completedAt: externallyBlocked ? null : new Date() } });
      await db.journeyEvent.create({ data: { userId: user.id, phase, type: externallyBlocked ? "task_blocked" : "task_completed", title: request.slice(0, 120), detail: externallyBlocked ? `Agent completed its available work for ${taskType}; external/profile data is still required.` : `Agent completed ${taskType}.` } });
      return NextResponse.json({ ok: true, taskId: task.id, taskType, phase, status, result });
    } catch (error) {
      await db.journeyTask.update({ where: { id: task.id }, data: { status: "failed", result: JSON.stringify({ error: error instanceof Error ? error.message : "Task execution failed" }) } });
      await db.journeyEvent.create({ data: { userId: user.id, phase, type: "task_failed", title: request.slice(0, 120), detail: `Agent task ${taskType} failed.` } });
      throw error;
    }
  } catch (error) {
    console.error("[abroadshield/tasks] error", error);
    return NextResponse.json({ ok: false, error: "Task execution failed." }, { status: 500 });
  }
}
