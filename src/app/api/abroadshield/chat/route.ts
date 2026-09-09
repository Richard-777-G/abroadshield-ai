import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import { generateText, AIRuntimeError } from "@/lib/abroadshield/ai-runtime";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { detectCapability } from "@/lib/abroadshield/capability-router";
import { buildStageSystemDirective, buildWholeJourneyDirective, getStagePolicy, isCapabilityAllowedInStage, isExplorationRequest } from "@/lib/abroadshield/stage-orchestrator";
import { normalizePhase } from "@/lib/abroadshield/journey";
import { executeAgentTask } from "@/lib/abroadshield/task-executor";
import { AGENT_CAPABILITIES, getTool } from "@/lib/abroadshield/tool-registry";
import type { AgentCapability } from "@/lib/abroadshield/tool-registry";
import { getStudentContextSnapshot } from "@/lib/abroadshield/student-context";
import { searchOpportunities, type OpportunityIntent } from "@/lib/abroadshield/opportunity-engine";
import { createFranceTravailAdapter } from "@/lib/abroadshield/france-travail-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };
type DeterministicKind = "greeting" | "capabilities" | "positioning" | "stage";

const SYSTEM_RULES = `You are AbroadShield AI, an agentic study-abroad execution assistant.
You operate as a stage-specialized system, not a generic assistant. The active journey stage determines the current mission, priorities and allowed execution capabilities.
Use the student's persistent journey record as the source of truth. The agent remembers the whole journey, but it must prioritize the active stage.
The student can inspect, understand and plan any stage of the journey at any time. Do not treat future-stage exploration as a request to execute that stage's tools.
Act instead of merely advising when a permitted real tool or artifact is available. Never claim an external action happened unless the application actually executed it. Never fabricate live jobs, listings, deadlines, URLs, legal requirements, or connector state. If live data or a connector is unavailable, say so clearly and give the next executable step.
For emails and outbound communications, draft first and require explicit approval before sending. For visa/legal matters, distinguish general guidance from official advice and point to the relevant official authority.
Keep responses concise, practical and professional.`;

function summarizeTask(capability: string, result: unknown): string {
  const label = capability.replaceAll("_", " ");
  if (!result || typeof result !== "object") return `I completed the ${label} task and recorded the result in your journey.`;
  const data = result as Record<string, unknown>;
  const lines: string[] = [];
  if (typeof data.summary === "string") lines.push(data.summary);
  if (typeof data.status === "string") lines.push(`Status: ${data.status}`);
  if (Array.isArray(data.issues)) {
    const issues = data.issues.filter((x): x is string => typeof x === "string");
    if (issues.length) lines.push(`Issues: ${issues.join("; ")}`);
  }
  if (typeof data.nextAction === "string") lines.push(`Next: ${data.nextAction}`);
  return lines.join("\n") || `I completed the ${label} task and recorded the result in your journey.`;
}

function isGreeting(message: string): boolean {
  return /^(hi|hey|hello|hiya|good morning|good afternoon|good evening|yo)[.!\s]*$/i.test(message.trim());
}
function isCapabilityQuestion(message: string): boolean {
  return /\b(what can you do|what do you do|what can i do|your capabilities|your tools|what tools|what tasks can|how can you help|what are your functions|available tasks)\b/i.test(message);
}
function isPositioningQuestion(message: string): boolean {
  return /\b(why should i choose you|why choose you|why use you|better than claude|better than chatgpt|vs claude|vs chatgpt|compared with claude|compared with chatgpt|why you over|what makes you different)\b/i.test(message);
}
function buildGreeting(name: string | null | undefined, phase: ReturnType<typeof normalizePhase>, destination?: string | null): string {
  const policy = getStagePolicy(phase);
  const who = name ? ` ${name}` : "";
  const place = destination ? ` for **${destination}**` : "";
  return `Hi${who}. I’m ready to work with your journey context${place}.\n\n**Current stage:** ${policy.title}\n**Current mission:** ${policy.mission}\n\nGive me a concrete task, or ask what needs attention next.`;
}
function buildCapabilityReply(phase: ReturnType<typeof normalizePhase>): string {
  const policy = getStagePolicy(phase);
  const current = new Set(policy.capabilities);
  const rows = AGENT_CAPABILITIES.map((capability) => {
    const tool = getTool(capability)!;
    const status = current.has(capability) ? "Available now" : "Available in the relevant stage";
    const mode = tool.requiresLiveData ? "live data" : tool.requiresApproval ? "draft + approval" : "task execution";
    return `| ${tool.label} | ${mode} | ${status} |`;
  }).join("\n");
  return `I’m not a replacement for a general-purpose model. AbroadShield is specialized around **your study-abroad journey** and the execution layer behind it.\n\n**What the agent can do**\n| Capability | Execution | Stage |\n| --- | --- | --- |\n${rows}\n\nYour active stage is **${policy.title}**. I prioritize the capabilities allowed there, while you can still plan for later stages without accidentally executing them.`;
}
function buildPositioningReply(phase: ReturnType<typeof normalizePhase>): string {
  const policy = getStagePolicy(phase);
  return `You should not choose AbroadShield because it claims to be a smarter base model than Claude or ChatGPT. That would be an unsupported claim.\n\nChoose it for a different layer of the problem: **an operational study-abroad workspace built around your journey**. It keeps a persistent journey profile, enforces stage-specific capabilities, separates planning from execution, routes live-data tasks through explicit tools, gates outbound communication behind approval, and records task/event state in the application.\n\nA general-purpose assistant may be better for broad reasoning, writing, coding, or open-ended research. AbroadShield’s advantage is the workflow around the student: **context → stage policy → task → evidence/tool result → recorded outcome → next action**.\n\nRight now your active stage is **${policy.title}**, so that orchestration is the layer I should use rather than pretending to compete on raw model intelligence.`;
}
async function persistDeterministic(userId: string, phase: ReturnType<typeof normalizePhase>, userMessage: string, reply: string, kind: DeterministicKind) {
  await db.agentMessage.createMany({ data: [
    { userId, role: "user", content: userMessage, phase },
    { userId, role: "assistant", content: reply, phase },
  ] });
  return NextResponse.json({ ok: true, reply, phase, executed: false, deterministic: true, kind });
}

function opportunityIntentFromMessage(message: string, student: Awaited<ReturnType<typeof getStudentContextSnapshot>>): OpportunityIntent {
  const lower = message.toLowerCase();
  const category = /internship|intern|stage|internships|stages/.test(lower)
    ? "internship"
    : /apprenticeship|apprenticeships|alternance|apprentice/.test(lower)
      ? "apprenticeship"
      : /full[- ]?time|full time|permanent/.test(lower)
        ? "full_time"
        : /temporary|temp job|seasonal/.test(lower)
          ? "temporary"
          : /freelance|freelancing|self[- ]employed/.test(lower)
            ? "freelance"
            : "part_time";
  const paris = /\bparis\b/i.test(message);
  const location = paris ? "Paris" : student?.destination.city ?? student?.destination.country;
  return { category, location, query: message.replace(/\b(find|search|look for|looking for|me|jobs?|job|internships?|intern|stages?|part[- ]?time|full[- ]?time|apprenticeships?|alternance|in|at|for|around|near|paris|france)\b/gi, " ").replace(/\s+/g, " ").trim() || undefined };
}

function formatOpportunitySearch(
  reply: Awaited<ReturnType<typeof searchOpportunities>>,
  intent: OpportunityIntent,
  student?: Awaited<ReturnType<typeof getStudentContextSnapshot>>,
): string {
  const label = intent.category.replaceAll("_", " ");
  const locationText = intent.location ? ` in **${intent.location}**` : "";
  const course = student?.education.course;
  const university = student?.education.university;
  const contextNote = course ? ` for your background in **${course}**${university ? ` at **${university}**` : ""}` : "";

  if (!reply.opportunities.length) {
    const source = reply.sourceErrors.length
      ? `\n\n• **Configured Source Status:** ${reply.sourceErrors.map((item) => `\`${item.sourceId}\`: ${item.error}`).join(", ")}.`
      : "";
    return `I queried verified employment platforms for live **${label}** opportunities${locationText}${contextNote}, but no verified active listings were returned by the configured provider adapter.${source}\n\nAbroadShield never manufactures mock or unverified fallback listings.`;
  }

  // Synthesize student-specific intelligence
  const total = reply.opportunities.length;
  const highFitMatches = reply.matches.filter((m) => m.fit === "high");
  const mediumFitMatches = reply.matches.filter((m) => m.fit === "medium");
  const freshCount = reply.opportunities.filter((o) => o.freshness === "fresh").length;
  const requiresFrenchCount = reply.opportunities.filter((o) =>
    o.requiredLanguages?.some((l) => /french|français/i.test(l)),
  ).length;

  const insights: string[] = [];

  // Course / Degree fit insight
  if (highFitMatches.length > 0) {
    insights.push(`**Course Alignment:** ${highFitMatches.length} of ${total} listings show direct alignment with your ${course || "academic"} coursework and skills.`);
  } else if (mediumFitMatches.length > 0) {
    insights.push(`**Course Alignment:** ${mediumFitMatches.length} listings have partial technical overlap with your field of study.`);
  }

  // Work-authorization statutory insight (deterministic, never claiming blanket exemption)
  if (intent.category === "part_time") {
    insights.push(`**Statutory Work Limits:** Student employment in France is legally capped at **964 hours per year** (~60% of annual full-time hours). Individual status remains *Requires verification*.`);
  } else if (intent.category === "internship") {
    insights.push(`**Legal Framework:** Internships (*stages*) in France require an official tripartite internship convention (*convention de stage*) signed by you, ${university || "your university"}, and the employer.`);
  } else if (intent.category === "apprenticeship") {
    insights.push(`**Alternance Framework:** Apprenticeship contracts require formal tripartite registration and OPCO funding validation.`);
  }

  // Language proficiency insight
  if (requiresFrenchCount > 0) {
    insights.push(`**Language Considerations:** ${requiresFrenchCount} listing${requiresFrenchCount === 1 ? "" : "s"} specify French language proficiency.`);
  }

  // Freshness insight
  if (freshCount > 0) {
    insights.push(`**Freshness:** ${freshCount} listing${freshCount === 1 ? " is" : "s are"} fresh (published within the last 7 days).`);
  }

  const rows = reply.opportunities.slice(0, 5).map((opportunity, index) => {
    const match = reply.matches.find((item) => item.opportunityId === opportunity.canonicalId);
    const fit = match?.fit ? match.fit.toUpperCase() : "POTENTIAL";
    const url = opportunity.applicationUrl ?? opportunity.sourceUrl;
    return `${index + 1}. **${opportunity.title}** — *${opportunity.employer}*\n   📍 ${opportunity.location || "Paris"} · 💼 ${opportunity.contractType.replaceAll("_", " ")} · 🎯 Fit: **${fit}**\n   [Open verified listing](${url})`;
  }).join("\n\n");

  const insightSection = insights.length > 0
    ? `\n\n**Co-Pilot Intelligence Analysis:**\n${insights.map((ins) => `• ${ins}`).join("\n")}\n\n`
    : "\n\n";

  return `I found **${total} verified ${label} opportunit${total === 1 ? "y" : "ies"}**${locationText}${contextNote}.${insightSection}${rows}\n\n*Note: France Travail listings carry L1 capability (Discovery + Preparation). Use the interactive cards below to save to your journey or prepare tailored application materials.*`;
}

function isApplicationCapabilityQuestion(message: string): boolean {
  return /\b(can you apply|apply for (these|the|them|internships?|jobs?)|submit my application|will you apply|auto[- ]apply|can i apply through you)\b/i.test(message);
}

function buildApplicationCapabilityReply(): string {
  return `AbroadShield **does not auto-submit applications** to external employers or portals without verified connector confirmation.

The opportunities discovered through **France Travail** carry an **L1 capability level** (Discovery + Preparation + Deep-link):

| Workflow | Behavior |
| :--- | :--- |
| **Discovery** | Canonical provider records with title, contract, location, and verified URL. |
| **Preparation** | Tailor your CV keywords, identify requirement gaps, and draft motivation letters. |
| **Submission** | Review your tailored materials and submit directly on the provider's official portal via **Open verified listing**. |

Would you like me to prepare application materials or tailor your CV for one of the listings?`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const userMessage = typeof body.message === "string" ? body.message : messages.find((m) => m.role === "user")?.content ?? "";
    if (!userMessage.trim()) return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
    const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const phase = normalizePhase(journey?.currentPhase);
    const policy = getStagePolicy(phase);
    const capability = detectCapability(userMessage) as AgentCapability | null;
    const exploring = isExplorationRequest(userMessage);

    if (isGreeting(userMessage)) return persistDeterministic(user.id, phase, userMessage, buildGreeting(user.name, phase, journey?.destination), "greeting");
    if (isCapabilityQuestion(userMessage)) return persistDeterministic(user.id, phase, userMessage, buildCapabilityReply(phase), "capabilities");
    if (isPositioningQuestion(userMessage)) return persistDeterministic(user.id, phase, userMessage, buildPositioningReply(phase), "positioning");
    if (isApplicationCapabilityQuestion(userMessage)) return persistDeterministic(user.id, phase, userMessage, buildApplicationCapabilityReply(), "capabilities");

    // Opportunity discovery is a research/planning operation, not a stage execution block.
    // A student in Pre-Departure or Arrival may search future-city employment/internships
    // before arrival without executing an employment action. The application layer performs
    // live retrieval and returns only canonical provider-backed records.
    if (capability === "job_search" && /\b(find|search|look for|looking for|show me|opportunities|jobs?|internships?|stages?|part[- ]?time|full[- ]?time|apprenticeships?|alternance)\b/i.test(userMessage)) {
      const student = await getStudentContextSnapshot(user.id);
      if (!student) return NextResponse.json({ ok: false, error: "Student journey context is not available." }, { status: 409 });
      const intent = opportunityIntentFromMessage(userMessage, student);
      const country = student.destination.country?.toLowerCase();
      const isFranceContext = country === "france" || country === "fr" || (intent.location?.toLowerCase().includes("paris") ?? false);
      if (!isFranceContext) {
        const reply = `I can structure this search, but the live opportunity adapter currently configured for this workspace is France Travail for France. I will not present unverified listings as live results.`;
        return persistDeterministic(user.id, phase, userMessage, reply, "stage");
      }
      const searchResult = await searchOpportunities({ student, intent, asOf: new Date().toISOString() }, [createFranceTravailAdapter()]);
      const reply = formatOpportunitySearch(searchResult, intent, student);
      await db.agentMessage.createMany({ data: [
        { userId: user.id, role: "user", content: userMessage, phase },
        { userId: user.id, role: "assistant", content: reply, phase },
      ] });
      return NextResponse.json({
        ok: true,
        reply,
        phase,
        capability,
        executed: false,
        opportunitySearch: true,
        intent,
        opportunities: searchResult.opportunities,
        matches: searchResult.matches,
        sourceIds: searchResult.sourceIds,
        sourceErrors: searchResult.sourceErrors,
      });
    }

    if (capability && exploring) {
      const tool = getTool(capability)!;
      const status = isCapabilityAllowedInStage(phase, capability)
        ? `That capability is available in **${policy.title}**.`
        : `That capability is not enabled for **${policy.title}**, but you can plan for it without changing stages.`;
      const reply = `${status}\n\n**${tool.label}** uses ${tool.requiresLiveData ? "verified live data" : tool.requiresApproval ? "a draft-and-approval workflow" : "the task engine"}. I will only execute it when the active stage and request allow execution.`;
      return persistDeterministic(user.id, phase, userMessage, reply, "stage");
    }
    if (capability && !isCapabilityAllowedInStage(phase, capability) && !exploring) {
      const reply = `That action belongs to a different journey stage. You are currently in **${policy.title}**. You can still explore or plan that future stage with me; to execute the action, make the relevant stage active first.`;
      return persistDeterministic(user.id, phase, userMessage, reply, "stage");
    }
    if (capability && !exploring && isCapabilityAllowedInStage(phase, capability)) {
      const profile: AgentProfile = {
        name: user.name ?? undefined, email: user.email,
        origin: journey?.origin, destination: journey?.destination, course: journey?.course, university: journey?.university,
        intake: journey?.intake, currentPhase: phase, documentsTotal: journey?.documentsTotal, documentsVerified: journey?.documentsVerified,
        visaAppointment: journey?.visaAppointment ?? undefined, funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined,
      };
      const taskResult = await executeAgentTask(user.id, profile, { taskType: capability, context: userMessage, phase, mode: "execute" });
      const reply = summarizeTask(capability, taskResult.result);
      await db.agentMessage.createMany({ data: [
        { userId: user.id, role: "user", content: userMessage, phase },
        { userId: user.id, role: "assistant", content: reply, phase },
      ] });
      return NextResponse.json({ ok: true, reply, phase, capability, taskId: taskResult.taskId, result: taskResult.result, executed: true });
    }

    const [recentEvents, recentTasks] = await Promise.all([
      db.journeyEvent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
      db.journeyTask.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 8 }),
    ]);
    const profile: AgentProfile = {
      name: user.name ?? undefined, email: user.email,
      origin: journey?.origin, destination: journey?.destination, course: journey?.course, university: journey?.university,
      intake: journey?.intake, currentPhase: phase, documentsTotal: journey?.documentsTotal, documentsVerified: journey?.documentsVerified,
      visaAppointment: journey?.visaAppointment ?? undefined, funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined,
    };
    const memory = `PERSISTENT JOURNEY:\n${buildAgentContext(profile)}\nACTIVE STAGE POLICY:\n${buildStageSystemDirective(phase)}\nWHOLE JOURNEY POLICY:\n${buildWholeJourneyDirective(phase)}\nRECENT EVENTS:\n${recentEvents.map((e) => `- [${e.phase}] ${e.type}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n") || "none yet"}\nRECENT TASKS:\n${recentTasks.map((t) => `- [${t.phase}] ${t.status}: ${t.title}`).join("\n") || "none yet"}`;
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    const reply = await generateText({ messages: [{ role: "system", content: SYSTEM_RULES + "\n\n" + memory }, ...history, { role: "user", content: userMessage }], timeoutMs: 25_000 });
    await db.agentMessage.createMany({ data: [
      { userId: user.id, role: "user", content: userMessage, phase },
      { userId: user.id, role: "assistant", content: reply, phase },
    ] });
    return NextResponse.json({ ok: true, reply, phase, executed: false });
  } catch (error) {
    console.error("[abroadshield/chat] error", error);
    if (error instanceof AIRuntimeError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    return NextResponse.json({ ok: false, error: "The agent hit an unexpected error. Please try again." }, { status: 500 });
  }
}
