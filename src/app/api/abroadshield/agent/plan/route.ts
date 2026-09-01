import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { normalizePhase } from "@/lib/abroadshield/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TaskType = "document_check" | "draft_email" | "job_search" | "tailor_cv" | "deadline_scan" | "housing_search" | "visa_check";
type Plan = { taskType: TaskType; title: string; reason: string; context: string; requiresApproval: boolean };

const ROUTES: Array<{ type: TaskType; patterns: RegExp[]; title: string; reason: string; approval: boolean }> = [
  { type: "document_check", patterns: [/document/i, /passport/i, /financial/i, /bank statement/i, /certificate/i, /letter/i], title: "Check documents", reason: "The request concerns evidence or document readiness.", approval: false },
  { type: "draft_email", patterns: [/email/i, /mail/i, /write to/i, /reply/i, /message/i, /contact/i], title: "Draft communication", reason: "The request needs an outbound communication draft.", approval: true },
  { type: "job_search", patterns: [/job/i, /work/i, /part.?time/i, /full.?time/i, /career/i, /vacanc/i, /employment/i], title: "Search opportunities", reason: "The request concerns employment or career opportunities.", approval: false },
  { type: "tailor_cv", patterns: [/cv/i, /resume/i, /cover letter/i, /tailor/i, /application/i], title: "Tailor application", reason: "The request needs application material based on the student's existing facts.", approval: false },
  { type: "deadline_scan", patterns: [/deadline/i, /due/i, /when do i/i, /calendar/i, /appointment/i, /date/i], title: "Scan deadlines", reason: "The request concerns dates or upcoming actions.", approval: false },
  { type: "housing_search", patterns: [/housing/i, /house/i, /room/i, /accommodation/i, /landlord/i, /rent/i], title: "Plan housing search", reason: "The request concerns accommodation.", approval: false },
  { type: "visa_check", patterns: [/visa/i, /immigration/i, /permit/i, /registration/i, /legal/i, /work.?hour/i], title: "Check immigration requirements", reason: "The request concerns immigration, compliance, or permission rules.", approval: false },
];

function inferTask(message: string, phase: string): Plan {
  const match = ROUTES.find((route) => route.patterns.some((pattern) => pattern.test(message)));
  if (match) return { taskType: match.type, title: match.title, reason: match.reason, context: message.trim(), requiresApproval: match.approval };
  const fallback: Record<string, { type: TaskType; title: string; reason: string }> = {
    "pre-departure": { type: "deadline_scan", title: "Find my next pre-departure action", reason: "No explicit task type was detected, so start with the current stage's next known date/action." },
    arrival: { type: "visa_check", title: "Check my arrival requirements", reason: "No explicit task type was detected, so verify arrival/registration requirements first." },
    studying: { type: "job_search", title: "Review current study-stage opportunities", reason: "No explicit task type was detected, so start with the most useful study-stage career action." },
    "job-success": { type: "job_search", title: "Review my job-search next step", reason: "No explicit task type was detected, so start with the current job-success workflow." },
  };
  const selected = fallback[phase] ?? fallback["pre-departure"];
  return { taskType: selected.type, title: selected.title, reason: selected.reason, context: message.trim(), requiresApproval: false };
}

const taskInstruction = (taskType: TaskType, profileContext: string, request: string, phase: string) => {
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
};

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
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
    const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const phase = normalizePhase(journey?.currentPhase);
    const plan = inferTask(message, phase);
    const profile: AgentProfile = { name: user.name ?? undefined, email: user.email, origin: journey?.origin, destination: journey?.destination, course: journey?.course, university: journey?.university, intake: journey?.intake, currentPhase: phase, documentsTotal: journey?.documentsTotal, documentsVerified: journey?.documentsVerified, visaAppointment: journey?.visaAppointment ?? undefined, funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined };

    const task = await db.journeyTask.create({ data: { userId: user.id, phase, type: plan.taskType, title: plan.title, status: "running", priority: "medium" } });
    await db.journeyEvent.create({ data: { userId: user.id, phase, type: "agent_planned", title: plan.title, detail: plan.reason, metadata: JSON.stringify({ taskId: task.id, taskType: plan.taskType, requiresApproval: plan.requiresApproval }) } });

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({ messages: [{ role: "assistant", content: taskInstruction(plan.taskType, buildAgentContext(profile), plan.context, phase) }, { role: "user", content: plan.context }], thinking: { type: "disabled" } });
      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!raw) throw new Error("Agent returned an empty result.");
      let result: unknown = raw;
      try { result = JSON.parse(raw); } catch { /* preserve raw result */ }
      await db.journeyTask.update({ where: { id: task.id }, data: { status: "completed", result: JSON.stringify(result), completedAt: new Date() } });
      await db.journeyEvent.create({ data: { userId: user.id, phase, type: "task_completed", title: plan.title, detail: `Planner executed ${plan.taskType}.`, metadata: JSON.stringify({ taskId: task.id, requiresApproval: plan.requiresApproval }) } });
      return NextResponse.json({ ok: true, plan, taskId: task.id, phase, result });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Task execution failed";
      await db.journeyTask.update({ where: { id: task.id }, data: { status: "failed", result: JSON.stringify({ error: detail }) } });
      await db.journeyEvent.create({ data: { userId: user.id, phase, type: "task_failed", title: plan.title, detail, metadata: JSON.stringify({ taskId: task.id, taskType: plan.taskType }) } });
      return NextResponse.json({ ok: false, error: "The planned task failed.", taskId: task.id, plan }, { status: 502 });
    }
  } catch (error) {
    console.error("[abroadshield/agent/plan]", error);
    return NextResponse.json({ ok: false, error: "Could not execute the agent plan." }, { status: 500 });
  }
}
