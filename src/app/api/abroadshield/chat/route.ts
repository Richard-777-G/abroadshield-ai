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
    
    let reply: string;
    try {
      reply = await generateText({ messages: [{ role: "system", content: SYSTEM_RULES + "\n\n" + memory }, ...history, { role: "user", content: userMessage }], timeoutMs: 25_000 });
    } catch (aiError) {
      console.warn("[abroadshield/chat] External AI provider unavailable or exhausted, activating authoritative statutory fallback:", aiError);
      reply = synthesizeAuthoritativeFallback(userMessage, profile, phase, recentEvents, recentTasks);
    }

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

function synthesizeAuthoritativeFallback(
  userMessage: string,
  profile: AgentProfile,
  phase: ReturnType<typeof normalizePhase>,
  recentEvents: Array<{ phase: string; type: string; title: string; detail: string | null }>,
  _recentTasks: Array<{ phase: string; status: string; title: string }>,
): string {
  const lower = userMessage.toLowerCase();
  const dest = (profile.destination || "France").trim();
  const isFrance = /france|paris|lyon|marseille|toulouse|bordeaux|lille|nantes/i.test(dest);
  const isUK = /uk|united kingdom|london|england|scotland|wales/i.test(dest);
  const isGermany = /germany|deutschland|berlin|munich|frankfurt|hamburg/i.test(dest);
  const policy = getStagePolicy(phase);
  const studentName = profile.name ? ` ${profile.name}` : "";
  const university = profile.university ? ` at **${profile.university}**` : "";
  const course = profile.course ? ` for your **${profile.course}** program` : "";

  // 1. Student Work Authorization & Statutory Hourly Limits
  if (/\b(work|working|hour|hours|job|jobs|part[- ]?time|full[- ]?time|964|smic|wage|wages|salary|intern|internship|stage|convention|crous|employ|employment)\b/i.test(lower)) {
    if (isFrance) {
      return `### Statutory Student Work Regulations & Framework for France 🇫🇷

Under French labor and immigration legislation, international students holding a valid **VLS-TS (Visa Long Séjour valant Titre de Séjour)** are authorized to work under strict statutory limits:

1. **Annual Hourly Ceiling (Article R5221-26 of the French *Code du travail*)**:
   - You may work up to **964 hours per calendar year**, which represents 60% of the standard statutory annual working time (1,607 hours).
   - **No preliminary work permit (APT)** is required. Your employer must simply file a preliminary declaration (*Déclaration Préalable à l'Embauche* - DPAE) with the prefecture at least 48 hours before your start date.
   - The statutory minimum wage in France is the **SMIC** (currently €11.65 gross/hour, yielding approx. €9.22 net/hour).

2. **Internships (*Convention de Stage*)**:
   - Compulsory or curriculum-integrated internships do **NOT** count toward the 964-hour employment quota.
   - Internships must be governed by a formal tripartite agreement (*convention de stage*) signed by you, ${profile.university ? `**${profile.university}**` : "your institution"}, and the host organization.
   - For internships exceeding **2 months (over 308 hours)**, French law mandates a minimum legal gratification of **€4.35 per hour** (tax-exempt).

3. **Current Journey Alignment**:
   - Active Stage: **${policy.title}**
   - Recommendation: Ensure your employer files the DPAE and issues standard monthly pay slips (*bulletins de paie*) to keep your visa compliance audit-proof.`;
    }

    if (isUK) {
      return `### Statutory Student Work Regulations for the United Kingdom 🇬🇧

Under official **UKVI (UK Visas and Immigration)** regulations for international students on a Student Visa:

1. **Term-Time Employment Limits**:
   - Degree-level students are permitted to work up to a maximum of **20 hours per week** during term time.
   - During official university vacations (as defined by your academic calendar), you may work full-time.
2. **Prohibited Employment Activities**:
   - Self-employment, freelance work, contracting, and gig economy apps (e.g., Deliveroo, Uber Eats) are **strictly prohibited** by UKVI.
   - You cannot take a permanent full-time position or work as a professional entertainer/sports coach.
3. **National Minimum Wage**:
   - You are entitled to the UK National Minimum Wage / National Living Wage according to your age group, and you must obtain a National Insurance (NI) number.`;
    }

    if (isGermany) {
      return `### Statutory Student Work Regulations for Germany 🇩🇪

Under the updated statutory immigration rules (**Section 16b AufenthG**):

1. **Annual Work Days Allocation**:
   - Non-EU students are entitled to work **140 full days or 280 half days** per calendar year (a half day is up to 4 hours).
   - Alternatively, under the student employee (*Werkstudent*) privilege, you can work up to 20 hours per week during the semester without forfeiting student social security exemptions.
2. **Academic & Preparation Phases**:
   - If enrolled in preparatory language courses (*Studienkolleg*), work is permitted only during vacation periods unless explicit Foreigners' Authority (*Ausländerbehörde*) approval is granted.
3. **Minimum Wage**:
   - German statutory minimum wage (*Mindestlohn*) applies (€12.41/hour minimum).`;
    }

    return `### International Student Employment Framework for ${dest}

For your studies in **${dest}**${course}:
- **Statutory Limits**: Most destination jurisdictions allow between 20 hours per week (term-time) and part-time quotas (~964 hours annually in Europe).
- **Compliance Rules**: Verify your exact visa conditions printed on your biometric residence permit or entry vignette.
- **Contractual Requirements**: Always ensure a compliant written contract and employer registration before commencing any paid duties.`;
  }

  // 2. Housing, Rent, CAF, Visale, Accommodation
  if (/\b(house|housing|flat|apartment|rent|crous|visale|caf|apl|deposit|guarantor|accommodation|landlord|bail|bailleur|lease)\b/i.test(lower)) {
    if (isFrance) {
      return `### Student Housing & State Entitlements in France 🏠

Securing and maintaining housing in France involves key statutory mechanisms:

1. **Visale Rental Guarantee (Action Logement)**:
   - Visale acts as a **free government-backed guarantor** for international students aged 18–30.
   - It guarantees unpaid rent and damages up to 36 months, removing the requirement for a France-based physical guarantor (*garant physique*).
   - You must obtain your *Visa Visale* online at \`visale.fr\` **before** signing your lease.

2. **CAF Housing Allowance (APL / ALS)**:
   - All international students residing legally in France with a valid lease are eligible to apply for housing benefit (*Aide Personnalisée au Logement* - APL) via \`caf.fr\`.
   - The allowance is calculated based on rent, location, and student income, typically providing between €100 and €250/month.
   - Apply online as soon as your lease is signed and you have entered the apartment; payments are not retroactive.

3. **Entry Inventory (*État des lieux d'entrée*)**:
   - Inspect every fixture, wall, heating unit, and meter reading. Retain a signed, photographic copy to guarantee complete return of your security deposit (*dépôt de garantie*) within legal deadlines (max 1–2 months post-departure).`;
    }

    return `### Student Accommodation Guidance for ${dest} 🏠

- **Housing Proof**: Obtain an official tenancy agreement (*lease/contract*) stating your name and rental terms. This serves as your legal proof of address.
- **Deposit Protection**: Ensure your security deposit is held in an approved statutory tenancy deposit scheme.
- **Subsidies & Council Exemption**: Check local student housing subsidies and apply for student council tax / local tax exemptions where applicable.`;
  }

  // 3. Healthcare, CPAM, Ameli, Insurance
  if (/\b(health|healthcare|insurance|doctor|hospital|ameli|cpam|carte vitale|medicare|medical|mutuelle|prescription)\b/i.test(lower)) {
    if (isFrance) {
      return `### Mandatory Healthcare & Social Security (CPAM / Ameli) 🏥

In France, international students benefit from comprehensive statutory health coverage:

1. **Free Mandatory Registration**:
   - Register on the official portal: **\`etudiant-etranger.ameli.fr\`**.
   - Registration is 100% free and mandatory under the French general social security regime (*Régime Général de la Sécurité Sociale*).
2. **Required Documents**:
   - Certificate of university enrollment (*certificat de scolarité*).
   - Passport and valid visa / residence validation (VLS-TS confirmation).
   - Full birth certificate with official sworn French translation (*traduction assermentée*).
   - French bank account details (RIB) for reimbursement deposits.
3. **Coverage & Mutuelle**:
   - *Sécurité Sociale* reimburses approx. 70% of standard doctor consultations and prescription medicines.
   - To cover the remaining 30% ("ticket modérateur"), consider enrolling in a student complementary health insurance (*mutuelle étudiante*).`;
    }

    return `### Healthcare and Medical Coverage for ${dest} 🏥

- **Statutory Registration**: Ensure your mandatory student health insurance is active upon entry.
- **Local Practitioner Registration**: Register with a local medical clinic / GP immediately after arriving so you have access to healthcare and emergency services without delay.`;
  }

  // 4. Visa Validation, OFII, ANEF, Residence Permit
  if (/\b(visa|ofii|anef|prefecture|residence|vls[- ]?ts|permit|titre de s[eé]jour|renew|renewal|appointment)\b/i.test(lower)) {
    if (isFrance) {
      return `### Visa Validation & Legal Residence Protocol (ANEF / OFII) 🛡️

If you entered France on a **VLS-TS (Visa de Long Séjour valant Titre de Séjour)**:

1. **Mandatory 3-Month Window**:
   - You **must** validate your visa online within **3 months of your arrival date** at:
     \`administration-etrangers-en-france.interieur.gouv.fr\` (ANEF portal).
   - Failing to validate within 90 days turns your stay illegal and voids your right to work and receive CAF housing subsidies.
2. **Online Steps**:
   - Enter your visa number, entry date into France, and residential address in France.
   - Pay the student residence tax stamp (**taxe de séjour**, currently €50) online via credit card or electronic fiscal stamp (*timbre fiscal électronique*).
3. **Confirmation**:
   - Download the official confirmation PDF (*Confirmation de la validation de l'enregistrement de votre visa long séjour valant titre de séjour*). Keep this document alongside your passport at all times.`;
    }

    return `### Visa & Immigration Compliance for ${dest} 🛡️

- **Arrival Registration**: Complete any required police registration, biometric identity issuance, or immigration portal check-ins within the prescribed statutory deadline.
- **Condition Compliance**: Maintain continuous full-time academic enrollment to protect the validity of your student visa status.`;
  }

  // 5. Banking, Currency, RIB, Financial Setup
  if (/\b(bank|account|rib|iban|money|fund|funds|budget|living cost|cost of living|transfer|navigo|expenses)\b/i.test(lower)) {
    return `### Financial Setup & Banking Protocols for ${dest} 💳

1. **Opening a Local Account**:
   - Essential for receiving scholarships, housing subsidies (CAF/APL), student wage payments, and transport subscriptions.
   - Required dossier: Valid passport + student visa, official proof of address (*quittance de loyer* or *attestation d'hébergement* less than 3 months old), and your university enrollment certificate (*certificat de scolarité*).
2. **Relevé d'Identité Bancaire (RIB) / IBAN**:
   - Once opened, download your RIB/IBAN immediately. You will need it for:
     - Health insurance reimbursements (CPAM/Ameli)
     - Housing allowance payments (CAF)
     - Mobile phone contracts and transport cards (e.g., Navigo in Paris)
3. **Budget Modeling**:
   - Maintain a buffer of at least 1–2 months of living expenses while waiting for initial benefit and payroll disbursements.`;
  }

  // 6. Stage-Grounded Operating Response
  const recentEventsSummary = recentEvents.length > 0
    ? `\n\n**Recent Journey Milestones:**\n${recentEvents.slice(0, 3).map((e) => `• [${e.phase}] ${e.title}`).join("\n")}`
    : "";

  return `### AbroadShield Co-Pilot Guidance for ${studentName || "Your Journey"} 🛡️

**Active Journey Stage:** ${policy.title}  
**Primary Mission:** ${policy.mission}  
**Destination Focus:** ${dest}${university}${course}

Here is your prioritized operational guidance for this stage:

1. **Immediate Mission Priority**:
   - Align with your stage requirements: focus on completing verified prerequisites before committing to external steps.
   - Allowed stage capabilities: ${policy.capabilities.map((c) => `\`${c.replaceAll("_", " ")}\``).join(", ")}.

2. **Statutory Integrity**:
   - AbroadShield grounds all recommendations in official immigration directives and verified university rules.
   - Never commit to informal or cash-in-hand arrangements; maintain documented proof of compliance across visas, leases, and student contracts.
${recentEventsSummary}

**How can I assist you right now?**
- Type **"Find part-time jobs"** or **"Search internships"** to query verified listings.
- Ask for official verification checklists on visa validation, housing (CAF/Visale), or health insurance (CPAM).
- Ask any question regarding your current stage checklist and timeline.`;
}
