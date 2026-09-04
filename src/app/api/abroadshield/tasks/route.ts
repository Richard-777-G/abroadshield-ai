import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { generateText, AIRuntimeError } from "@/lib/abroadshield/ai-runtime";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { normalizePhase } from "@/lib/abroadshield/journey";
import { executeLiveTool } from "@/lib/abroadshield/live-tool-adapter";
import { getStagePolicy, buildStageSystemDirective, isCapabilityAllowedInStage } from "@/lib/abroadshield/stage-orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TASKS = ["document_check", "draft_email", "job_search", "tailor_cv", "deadline_scan", "housing_search", "visa_check"] as const;
type TaskType = (typeof TASKS)[number];
type TaskRequest = { taskType?: string; context?: string; phase?: string; mode?: "execute" | "plan" };
const LIVE_TASKS = new Set<TaskType>(["job_search", "housing_search", "visa_check"]);

function taskInstruction(taskType: TaskType, profileContext: string, request: string, phase: string, mode: "execute" | "plan") {
  const policy = getStagePolicy(normalizePhase(phase));
  const common = `You are an execution agent inside AbroadShield AI.\n${buildStageSystemDirective(policy.phase)}\nMODE: ${mode === "plan" ? "FUTURE-STAGE PLANNING" : "CURRENT-STAGE EXECUTION"}\nAUTHENTICATED STUDENT PROFILE:\n${profileContext}\n\nRules:\n- Work only with facts supplied by the profile, verified live sources, or task request.\n- Never claim an external action happened unless this request actually performs it.\n- Never fabricate live URLs, employers, deadlines, prices, legal requirements, listings, or verification results.\n- If live external data or a connector is required but unavailable, say so explicitly.\n- In planning mode, explain what should be prepared and what must wait until that stage; do not imply the student has reached it.\n- Return valid JSON only.`;
  const instructions: Record<TaskType, string> = {
    document_check: `${common}\nPerform an informational document pre-check, not legal certification. Return {"status":"verified|issue|missing|needs_review","summary":string,"issues":string[],"agentActions":string[],"priority":"critical|high|medium|low","verificationNote":string}.`,
    draft_email: `${common}\nDraft a professional email. Return {"subject":string,"to":"recipient/role","body":string,"notes":string,"requiresApproval":true}. Do not send it.`,
    job_search: `${common}\nSummarize the verified live search results supplied to you. Do not invent roles or alter source URLs. Return {"status":"shortlist|no_results","query":string,"roles":[{"title":string,"company":string,"location":string,"matchReason":string,"source":string}],"nextAction":string}.`,
    tailor_cv: `${common}\nTailor CV content only from supplied facts. Never invent experience or metrics. Return {"role":string,"bulletPoints":string[],"keywords":string[],"coverLetterOpening":string,"agentNote":string}.`,
    deadline_scan: `${common}\nIdentify deadlines only from supplied dates. Never invent countdowns. Return {"status":"ready|needs_profile_data","deadlines":[{"title":string,"date":string,"severity":"critical|warning|info","description":string,"agentAction":string}],"missingData":string[]}.`,
    housing_search: `${common}\nSummarize the verified live search results supplied to you. Do not invent listings or alter source URLs. Return {"status":"shortlist|no_results","searchArea":string,"criteria":string[],"listings":[{"title":string,"location":string,"price":string,"source":string}],"nextAction":string}.`,
    visa_check: `${common}\nUse only the verified live sources supplied to you for current guidance. Distinguish guidance from legal advice. Return {"question":string,"answer":string,"riskLevel":"none|low|medium|high","officialSources":[{"title":string,"url":string}],"agentActions":string[]}.`,
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
    const currentPhase = normalizePhase(journey?.currentPhase);
    const phase = normalizePhase(body.phase || currentPhase);
    const mode = body.mode || "execute";
    const planningAnotherStage = mode === "plan" && phase !== currentPhase;
    if (!isCapabilityAllowedInStage(phase, taskType) && !planningAnotherStage) {
      const policy = getStagePolicy(phase);
      return NextResponse.json({ ok: false, error: `${taskType.replaceAll("_", " ")} is not part of the ${policy.title} workflow.`, phase, stage: policy.title, allowedCapabilities: policy.capabilities }, { status: 409 });
    }
    const profile: AgentProfile = {
      name: user.name ?? undefined, email: user.email, origin: journey?.origin, destination: journey?.destination,
      course: journey?.course, university: journey?.university, intake: journey?.intake, currentPhase,
      documentsTotal: journey?.documentsTotal, documentsVerified: journey?.documentsVerified,
      visaAppointment: journey?.visaAppointment ?? undefined, funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined,
    };
    const request = body.context?.trim() || `${mode === "plan" ? "Plan" : "Execute"} ${taskType} for this student.`;
    const task = await db.journeyTask.create({ data: { userId: user.id, phase, type: taskType, title: (planningAnotherStage ? "[Planned] " : "") + request.slice(0, 120), status: "running" } });
    await db.journeyEvent.create({ data: { userId: user.id, phase, type: "task_started", title: request.slice(0, 120), detail: `Agent started ${mode} ${taskType}.` } });

    try {
      let result: unknown;
      let live = false;
      if (LIVE_TASKS.has(taskType)) {
        const liveResult = await executeLiveTool(taskType, request);
        if (liveResult.status !== "ready") {
          result = { status: "needs_live_search", query: liveResult.query, sources: liveResult.sources, nextAction: liveResult.message };
        } else {
          live = true;
          result = JSON.parse(await generateText({
            messages: [
              { role: "system", content: taskInstruction(taskType, buildAgentContext(profile), request, phase, mode) },
              { role: "user", content: JSON.stringify({ query: liveResult.query, sources: liveResult.sources }) },
            ],
            timeoutMs: 25_000,
            jsonMode: true,
          }));
        }
      } else {
        result = JSON.parse(await generateText({
          messages: [
            { role: "system", content: taskInstruction(taskType, buildAgentContext(profile), request, phase, mode) },
            { role: "user", content: request },
          ],
          timeoutMs: 25_000,
          jsonMode: true,
        }));
      }

      await db.journeyTask.update({ where: { id: task.id }, data: { status: "completed", result: JSON.stringify(result), completedAt: new Date() } });
      await db.journeyEvent.create({ data: { userId: user.id, phase, type: "task_completed", title: request.slice(0, 120), detail: `Agent completed ${mode} ${taskType}.` } });
      return NextResponse.json({ ok: true, taskId: task.id, taskType, phase, mode, planningAnotherStage, result, live });
    } catch (error) {
      await db.journeyTask.update({ where: { id: task.id }, data: { status: "failed", result: JSON.stringify({ error: error instanceof Error ? error.message : "Task execution failed" }) } });
      await db.journeyEvent.create({ data: { userId: user.id, phase, type: "task_failed", title: request.slice(0, 120), detail: `Agent task ${taskType} failed.` } });
      throw error;
    }
  } catch (error) {
    console.error("[abroadshield/tasks] error", error);
    if (error instanceof AIRuntimeError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    return NextResponse.json({ ok: false, error: "Task execution failed." }, { status: 500 });
  }
}
