import { getTool, type AgentCapability } from "./tool-registry";

const RULES: Array<[AgentCapability, RegExp[]]> = [
  ["document_check", [/\b(document|documents|passport|bank statement|cas|certificate|upload|file)\b/i]],
  ["draft_email", [/\b(draft|write|compose)\b.*\b(email|mail|message)\b/i, /\b(email|mail)\b.*\b(draft|write|compose|send)\b/i]],
  ["job_search", [/\b(find|search|look for|shortlist)\b.*\b(job|jobs|role|roles|employment|vacanc)/i, /\b(job|jobs|role|roles)\b.*\b(find|search|shortlist)/i]],
  ["tailor_cv", [/\b(tailor|adapt|customize|customise|rewrite)\b.*\b(cv|resume)\b/i]],
  ["deadline_scan", [/\b(deadline|deadlines|due date|due dates|what.*next|upcoming)\b/i]],
  ["housing_search", [/\b(find|search|look for|shortlist)\b.*\b(housing|house|room|rooms|flat|flats|accommodation|rent|rental)\b/i]],
  ["visa_check", [/\b(visa|immigration|residence permit|work hours|work-hour|graduate route|student visa)\b/i]],
];

export function detectCapability(message: string): AgentCapability | null {
  const text = message.trim();
  if (!text) return null;
  for (const [capability, patterns] of RULES) {
    if (patterns.some((pattern) => pattern.test(text)) && getTool(capability)) return capability;
  }
  return null;
}
