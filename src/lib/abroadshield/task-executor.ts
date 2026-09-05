import { db } from "@/lib/db";
import { AIRuntimeError, generateText } from "./ai-runtime";
import { buildAgentContext, type AgentProfile } from "./task-context";
import { normalizePhase } from "./journey";
import { executeLiveTool } from "./live-tool-adapter";
import { AGENT_CAPABILITIES, type AgentCapability } from "./tool-registry";
import { buildStageSystemDirective, getStagePolicy, isCapabilityAllowedInStage } from "./stage-orchestrator";
import { parseModelJson } from "./parse-json";

export type TaskExecutionRequest = {
  taskType: string;
  context?: string;
  phase?: string;
  mode?: "execute" | "plan";
};

export type TaskExecutionResult = {
  taskId: string;
  taskType: AgentCapability;
  phase: string;
  mode: "execute" | "plan";
  planningAnotherStage: boolean;
  result: unknown;
  live: boolean;
};

export class TaskExecutionError extends Error {
  constructor(message: string, public readonly status: 400 | 409) {
    super(message);
    this.name = "TaskExecutionError";
  }
}

function isCapability(value: string): value is AgentCapability {
  return AGENT_CAPABILITIES.includes(value as AgentCapability);
}

function buildInstruction(taskType: AgentCapability, profileContext: string, request: string, phase: string, mode: "execute" | "plan") {
  const policy = getStagePolicy(normalizePhase(phase));
  const common = `You are an execution agent inside AbroadShield AI.\n${buildStageSystemDirective(policy.phase)}\nMODE: ${mode === "plan" ? "FUTURE-STAGE PLANNING" : "CURRENT-STAGE EXECUTION"}\nAUTHENTICATED STUDENT PROFILE:\n${profileContext}\n\nRules:\n- Work only with facts supplied by the profile, verified live sources, or the task request.\n- Never claim an external action happened unless this request actually performs it.\n- Never fabricate live URLs, employers, deadlines, prices, legal requirements, listings, or verification results.\n- If live external data or a connector is required but unavailable, say so explicitly.\n- In planning mode, explain what should be prepared and what must wait until that stage.\n- Return valid JSON only.`;

  const instructions: Record<AgentCapability, string> = {
    document_check: `${common}\nPerform an informational document pre-check, not legal certification. Return {"status":"verified|issue|missing|needs_review","summary":string,"issues":string[],"agentActions":string[],"priority":"critical|high|medium|low","verificationNote":string}.`,
    draft_email: `${common}\nDraft a professional email. Return {"subject":string,"to":"recipient/role","body":string,"notes":string,"requiresApproval":true}. Do not send it.`,
    job_search: `${common}\nSummarize only the verified live search results supplied to you. Do not invent roles or alter source URLs. Return {"status":"shortlist|no_results","query":string,"roles":[{"title":string,"company":string,"location":string,"matchReason":string,"source":string}],"nextAction":string}.`,
    tailor_cv: `${common}\nTailor CV content only from supplied facts. Never invent experience or metrics. Return {"role":string,"bulletPoints":string[],"keywords":string[],"coverLetterOpening":string,"agentNote":string}.`,
    deadline_scan: `${common}\nIdentify deadlines only from supplied dates. Never invent countdowns. Return {"status":"ready|needs_profile_data","deadlines":[{"title":string,"date":string,"severity":"critical|warning|info","description":string,"agentAction":string}],"missingData":string[]}.`,
    housing_search: `${common}\nSummarize only the verified live search results supplied to you. Do not invent listings or alter source URLs. Return {"status":"shortlist|no_results","searchArea":string,"criteria":string[],"listings":[{"title":string,"location":string,"price":string,"source":string}],"nextAction":string}.`,
    visa_check: `${common}\nUse only the verified live sources supplied to you for current guidance. Distinguish guidance from legal advice. Return {"question":string,"answer":string,"riskLevel":"none|low|medium|high","officialSources":[{"title":string,"url":string}],"agentActions":string[]}.`,
  };

  return `${instructions[taskType]}\n\nTASK REQUEST: ${request}`;
}

function buildDeterministicPlan(taskType: AgentCapability, profile: AgentProfile, phase: string, request: string) {
  const destination = profile.destination || "your destination country";
  const course = profile.course || "your programme";
  const common = [
    `Target stage: ${getStagePolicy(normalizePhase(phase)).title}`,
    `Destination: ${destination}`,
    `Programme: ${course}`,
    "No external action was taken.",
    "No live data was used in planning mode.",
  ];

  const plans: Record<AgentCapability, { summary: string; nextSteps: string[]; prerequisites: string[] }> = {
    document_check: {
      summary: "Prepare a structured document inventory and identify missing or unverified items before execution.",
      nextSteps: ["List required documents from official destination-specific requirements.", "Mark each document as missing, ready, or needing review.", "Attach or connect the evidence needed for any item that needs verification."],
      prerequisites: ["Official requirement source", "Document inventory", "Copies or scans of relevant documents"],
    },
    draft_email: {
      summary: "Prepare the facts, recipient, purpose, and desired outcome for a reviewable draft. Sending remains approval-gated.",
      nextSteps: ["Confirm the recipient or institution.", "Collect the relevant dates, reference numbers, and facts.", "Prepare the draft for review before any outbound communication."],
      prerequisites: ["Recipient", "Purpose of message", "Verified facts to include"],
    },
    job_search: {
      summary: "Prepare a compliant job-search brief for the selected stage. Live vacancies will be fetched only during execution.",
      nextSteps: ["Define target role families and locations.", "Define sponsorship and work-authorization constraints.", "Prepare the CV/profile facts used for matching.", "Run the live search when this stage is ready for execution."],
      prerequisites: ["Target roles", "Target geography", "Work-authorization constraints"],
    },
    tailor_cv: {
      summary: "Prepare the source CV facts and target role before generating tailored content.",
      nextSteps: ["Select the target role.", "Identify verified experience and skills relevant to that role.", "Generate tailored bullets only from those supplied facts."],
      prerequisites: ["Current CV facts", "Target role description", "Verified achievements"],
    },
    deadline_scan: {
      summary: "Prepare a deadline inventory; exact dates must come from supplied or verified sources.",
      nextSteps: ["Collect application, visa, travel, accommodation, and enrolment dates.", "Record the source for each date.", "Run the deadline scan after source data is available."],
      prerequisites: ["Known dates", "Source for each date", "Relevant destination/stage"],
    },
    housing_search: {
      summary: "Prepare housing criteria and constraints. Live listings will be fetched only during execution.",
      nextSteps: ["Define area or acceptable commute.", "Set budget and required amenities.", "Define move-in date and eligibility constraints.", "Run the live search when execution is appropriate."],
      prerequisites: ["Search area", "Budget", "Move-in timing", "Housing constraints"],
    },
    visa_check: {
      summary: "Prepare the visa question and the official-source checklist. Current guidance will be fetched only during execution.",
      nextSteps: ["State the exact visa or immigration question.", "Identify the destination and current stage.", "Use official government/consular sources when executing the check.", "Separate official guidance from legal advice."],
      prerequisites: ["Exact question", "Destination", "Current stage"],
    },
  };

  return {
    status: "plan_ready",
    capability: taskType,
    request,
    summary: plans[taskType].summary,
    context: common,
    nextSteps: plans[taskType].nextSteps,
    prerequisites: plans[taskType].prerequisites,
  };
}

async function markTaskFailed(taskId: string, userId: string, phase: string, title: string, taskType: AgentCapability, error: unknown) {
  await db.journeyTask.update({
    where: { id: taskId },
    data: { status: "failed", result: JSON.stringify({ error: error instanceof Error ? error.message : "Task execution failed" }) },
  });
  await db.journeyEvent.create({
    data: { userId, phase, type: "task_failed", title, detail: `Agent task ${taskType} failed.` },
  });
}

export async function executeAgentTask(userId: string, profile: AgentProfile, input: TaskExecutionRequest): Promise<TaskExecutionResult> {
  if (!isCapability(input.taskType)) throw new TaskExecutionError("Unknown task type.", 400);

  const taskType = input.taskType;
  const currentPhase = normalizePhase(profile.currentPhase);
  const phase = normalizePhase(input.phase || currentPhase);
  const mode = input.mode || "execute";
  const planningAnotherStage = mode === "plan" && phase !== currentPhase;

  if (!isCapabilityAllowedInStage(phase, taskType) && !planningAnotherStage) {
    const policy = getStagePolicy(phase);
    throw new TaskExecutionError(`${taskType.replaceAll("_", " ")} is not part of the ${policy.title} workflow.`, 409);
  }

  const request = input.context?.trim() || `${mode === "plan" ? "Plan" : "Execute"} ${taskType} for this student.`;
  const title = (planningAnotherStage ? "[Planned] " : "") + request.slice(0, 120);
  const task = await db.journeyTask.create({ data: { userId, phase, type: taskType, title, status: "running" } });
  await db.journeyEvent.create({ data: { userId, phase, type: "task_started", title: request.slice(0, 120), detail: `Agent started ${mode} ${taskType}.` } });

  try {
    if (mode === "plan") {
      const result = buildDeterministicPlan(taskType, profile, phase, request);
      await db.journeyTask.update({
        where: { id: task.id },
        data: { status: "completed", result: JSON.stringify(result), completedAt: new Date() },
      });
      await db.journeyEvent.create({
        data: { userId, phase, type: "task_completed", title: request.slice(0, 120), detail: `Agent completed deterministic planning for ${taskType}.` },
      });
      return { taskId: task.id, taskType, phase, mode, planningAnotherStage, result, live: false };
    }

    let result: unknown;
    let live = false;

    if (taskType === "job_search" || taskType === "housing_search" || taskType === "visa_check") {
      const liveResult = await executeLiveTool(taskType, request);
      if (liveResult.status !== "ready") {
        result = { status: "blocked", query: liveResult.query, sources: liveResult.sources, nextAction: liveResult.message };
        await db.journeyTask.update({ where: { id: task.id }, data: { status: "blocked", result: JSON.stringify(result) } });
        await db.journeyEvent.create({ data: { userId, phase, type: "task_blocked", title: request.slice(0, 120), detail: `Agent task ${taskType} is blocked because live data is unavailable.` } });
        return { taskId: task.id, taskType, phase, mode, planningAnotherStage, result, live };
      }
      live = true;
      const raw = await generateText({
        messages: [
          { role: "system", content: buildInstruction(taskType, buildAgentContext(profile), request, phase, mode) },
          { role: "user", content: JSON.stringify({ query: liveResult.query, sources: liveResult.sources }) },
        ],
        timeoutMs: 25_000,
        jsonMode: true,
      });
      result = parseModelJson(raw);
    } else {
      const raw = await generateText({
        messages: [
          { role: "system", content: buildInstruction(taskType, buildAgentContext(profile), request, phase, mode) },
          { role: "user", content: request },
        ],
        timeoutMs: 25_000,
        jsonMode: true,
      });
      result = parseModelJson(raw);
    }

    await db.journeyTask.update({
      where: { id: task.id },
      data: { status: "completed", result: JSON.stringify(result), completedAt: new Date() },
    });
    await db.journeyEvent.create({
      data: { userId, phase, type: "task_completed", title: request.slice(0, 120), detail: `Agent completed ${mode} ${taskType}.` },
    });

    return { taskId: task.id, taskType, phase, mode, planningAnotherStage, result, live };
  } catch (error) {
    await markTaskFailed(task.id, userId, phase, request.slice(0, 120), taskType, error);
    throw error;
  }
}

export function taskErrorResponseMessage(error: unknown): { message: string; status: number } {
  if (error instanceof AIRuntimeError) return { message: error.message, status: error.status };
  if (error instanceof TaskExecutionError) return { message: error.message, status: error.status };
  return { message: error instanceof Error ? error.message : "Task execution failed.", status: 500 };
}
