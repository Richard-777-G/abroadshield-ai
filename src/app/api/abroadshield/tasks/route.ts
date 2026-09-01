import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * AbroadShield AI — Task Automation Engine
 *
 * This endpoint handles specific agentic tasks that go beyond free-form chat.
 * Each task type has a tailored system prompt that produces a structured result.
 *
 * Supported task types:
 *  - document_check   : analyze a document type and return gap report
 *  - draft_email      : draft a context-aware email for a given purpose
 *  - job_search       : return a shortlist of roles matching the student profile
 *  - tailor_cv        : rewrite CV bullet points for a specific job role
 *  - deadline_scan    : return the next 3 critical deadlines with agent actions
 *  - housing_search   : return a shortlist of student accommodation options
 *  - visa_check       : country-specific visa requirement check
 */

const BASE_CONTEXT = `
STUDENT: Aarav Mehta | Pune, India → Manchester, UK | MSc Data Science, University of Manchester | September 2026 intake
CURRENT PHASE: Pre-Departure (visa not yet stamped)
VISA APPOINTMENT: 28 Aug 2026, 09:30 IST at VFS Global Mumbai
DOCUMENTS: 11 of 13 verified. Bank statement missing page 3. Passport photo flagged low-res.
FUNDING: £28,500 shown. Sponsorship letter awaiting approval.
VISA TYPE: UK Student Visa (Tier 4)
WORK CAP: 20 hrs/week term-time | unlimited vacations
POST-STUDY: Graduate Route (2 years)
HOME LANGUAGE: Marathi | Family currency: INR
`;

const TASK_PROMPTS: Record<string, string> = {
  document_check: `${BASE_CONTEXT}
You are AbroadShield's document verification agent.
Given a document type, return a JSON object with:
{
  "status": "verified" | "issue" | "missing",
  "summary": "one-sentence summary",
  "issues": ["list of specific issues found"],
  "agentActions": ["list of immediate actions the agent will take"],
  "requiredBy": "deadline date or phase name",
  "priority": "critical" | "high" | "medium" | "low"
}
Be specific to the UK Student Visa requirements. Return ONLY the JSON, no markdown wrapper.`,

  draft_email: `${BASE_CONTEXT}
You are AbroadShield's email drafting agent. You write real, ready-to-send emails.
Given a purpose, draft a complete professional email. Return a JSON object:
{
  "subject": "email subject line",
  "to": "recipient name/role",
  "body": "full email body — formal, professional, carrying Aarav's specific details",
  "notes": "one-line context note for the student",
  "phase": "which phase this relates to"
}
Include Aarav's specific details (name, course, university, visa appointment date, etc.) in the email.
Return ONLY the JSON, no markdown wrapper.`,

  job_search: `${BASE_CONTEXT}
You are AbroadShield's job search agent for the Job Success phase.
Return a JSON array of 5 realistic job opportunities. Each item:
{
  "id": "unique-id",
  "title": "job title",
  "company": "company name",
  "location": "UK city",
  "salary": "salary range",
  "sponsorship": true | false,
  "matchScore": 85,
  "skills": ["required skills"],
  "url": "realistic job URL",
  "agentAction": "what the agent will do next for this role",
  "deadline": "application deadline",
  "status": "not_applied"
}
Focus on Data Science / Machine Learning / AI roles in the UK that offer Graduate Route visa sponsorship.
Return ONLY the JSON array, no markdown wrapper.`,

  tailor_cv: `${BASE_CONTEXT}
You are AbroadShield's CV tailoring agent.
Given a job title and description, rewrite 4 bullet points for Aarav's work experience section.
Return a JSON object:
{
  "role": "job title being applied to",
  "bulletPoints": [
    "tailored bullet point 1 (action verb + metric + impact)",
    "tailored bullet point 2",
    "tailored bullet point 3",
    "tailored bullet point 4"
  ],
  "keywords": ["ATS keywords from the job description to include"],
  "coverLetterOpening": "first paragraph of a tailored cover letter",
  "agentNote": "one specific piece of advice for this application"
}
Aarav's background: Computer Engineering graduate, Python/ML/SQL skills, data analysis project experience.
Return ONLY the JSON, no markdown wrapper.`,

  deadline_scan: `${BASE_CONTEXT}
You are AbroadShield's deadline monitoring agent.
Return the 3 most critical upcoming deadlines as a JSON array. Each item:
{
  "id": "deadline-id",
  "title": "deadline name",
  "daysUntil": 0,
  "phase": "phase name",
  "severity": "critical" | "warning" | "info",
  "description": "what this deadline means",
  "agentAction": "what the agent will do / has already done",
  "actionLabel": "button label for agent action"
}
Base on the student's current state (visa appointment 28 Aug, intake Sep 2026).
Return ONLY the JSON array, no markdown wrapper.`,

  housing_search: `${BASE_CONTEXT}
You are AbroadShield's housing search agent.
Return a JSON array of 4 Manchester student accommodation options:
{
  "id": "option-id",
  "name": "accommodation name",
  "type": "studio" | "en-suite" | "shared" | "flat",
  "area": "Manchester neighbourhood",
  "pricePerWeek": 180,
  "distanceToUni": "10 min walk",
  "included": ["bills", "wifi", "gym"],
  "agentVerified": true,
  "agentAction": "agent has sent an inquiry",
  "url": "rightmove or sparoom URL format",
  "rating": 4.2,
  "availableFrom": "Sep 2026"
}
Budget: £180-220/week. Priority: close to University of Manchester, all-bills-included.
Return ONLY the JSON array, no markdown wrapper.`,

  visa_check: `${BASE_CONTEXT}
You are AbroadShield's visa compliance agent.
Given a question about visa rules, return a JSON object:
{
  "question": "the specific question asked",
  "answer": "direct, factual answer with the specific rule",
  "ruleSource": "the official rule source (e.g. UKVI, Home Office)",
  "riskLevel": "none" | "low" | "medium" | "high",
  "agentActions": ["what the agent will do to help"],
  "relatedRules": ["other rules the student should know"]
}
Return ONLY the JSON, no markdown wrapper.`,
};

interface TaskRequest {
  taskType: string;
  context?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { taskType, context } = body as TaskRequest;

    if (!taskType || !TASK_PROMPTS[taskType]) {
      return NextResponse.json(
        { ok: false, error: `Unknown task type: ${taskType}. Valid types: ${Object.keys(TASK_PROMPTS).join(", ")}` },
        { status: 400 }
      );
    }

    const systemPrompt = TASK_PROMPTS[taskType];
    const userMessage = context
      ? `Task context: ${context}`
      : `Execute the ${taskType} task for the current student profile.`;

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    if (!raw.trim()) {
      return NextResponse.json(
        { ok: false, error: "Agent returned empty result." },
        { status: 502 }
      );
    }

    // Try to parse as JSON; if it fails, return the raw string
    try {
      const parsed = JSON.parse(raw.trim());
      return NextResponse.json({ ok: true, taskType, result: parsed });
    } catch {
      return NextResponse.json({ ok: true, taskType, result: raw.trim(), raw: true });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[abroadshield/tasks] error:", message);
    return NextResponse.json(
      { ok: false, error: "Task agent hit an error. Please try again." },
      { status: 500 }
    );
  }
}
