export type LiveJob = {
  id: string;
  source: "remotive" | "arbeitnow";
  title: string;
  company: string;
  location: string;
  employmentType: string;
  postedAt: string;
  salary: string;
  url: string;
  description: string;
  remote: boolean;
};

const REMOTIVE = "https://remotive.com/api/remote-jobs";
const ARBEITNOW = "https://www.arbeitnow.com/api/job-board-api";

function cleanHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function matches(job: LiveJob, query: string, location?: string, employmentType?: string) {
  const q = query.trim().toLowerCase();
  const haystack = `${job.title} ${job.company} ${job.description} ${job.location}`.toLowerCase();
  const locationOk = !location || location.trim().length === 0 || job.location.toLowerCase().includes(location.trim().toLowerCase()) || job.location.toLowerCase().includes("worldwide") || job.remote;
  const typeOk = !employmentType || employmentType.trim().length === 0 || job.employmentType.toLowerCase().includes(employmentType.trim().toLowerCase());
  return (!q || haystack.includes(q)) && locationOk && typeOk;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "AbroadShield-AI/1.0" }, cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Job source returned HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

async function remotive(query: string, limit: number): Promise<LiveJob[]> {
  const data = await fetchJson<{ jobs?: Array<Record<string, unknown>> }>(`${REMOTIVE}?limit=${Math.min(Math.max(limit, 1), 50)}`);
  return (data.jobs ?? []).map((job) => ({
    id: `remotive:${String(job.id)}`,
    source: "remotive" as const,
    title: String(job.title ?? ""),
    company: String(job.company_name ?? ""),
    location: String(job.candidate_required_location ?? "Worldwide"),
    employmentType: String(job.job_type ?? ""),
    postedAt: String(job.publication_date ?? ""),
    salary: String(job.salary ?? ""),
    url: String(job.url ?? ""),
    description: cleanHtml(job.description),
    remote: true,
  })).filter((job) => job.title && job.url && matches(job, query));
}

async function arbeitnow(query: string, limit: number): Promise<LiveJob[]> {
  const data = await fetchJson<{ data?: Array<Record<string, unknown>> }>(ARBEITNOW);
  return (data.data ?? []).map((job) => ({
    id: `arbeitnow:${String(job.slug ?? job.id ?? job.url)}`,
    source: "arbeitnow" as const,
    title: String(job.title ?? ""),
    company: String(job.company_name ?? job.company ?? ""),
    location: String(job.location ?? ""),
    employmentType: String(job.job_types ?? job.job_type ?? ""),
    postedAt: String(job.created_at ?? ""),
    salary: String(job.salary ?? ""),
    url: String(job.url ?? ""),
    description: cleanHtml(job.description),
    remote: Boolean(job.remote),
  })).filter((job) => job.title && job.url && matches(job, query)).slice(0, limit);
}

export async function searchLiveJobs(options: { query: string; location?: string; employmentType?: string; limit?: number }) {
  const limit = Math.min(Math.max(options.limit ?? 12, 1), 25);
  const settled = await Promise.allSettled([remotive(options.query, limit * 2), arbeitnow(options.query, limit * 2)]);
  const jobs = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!jobs.length && settled.every((result) => result.status === "rejected")) {
    throw new Error("All configured live job sources are unavailable.");
  }
  const filtered = jobs.filter((job) => matches(job, options.query, options.location, options.employmentType));
  const unique = new Map(filtered.map((job) => [job.id, job]));
  return Array.from(unique.values())
    .sort((a, b) => String(b.postedAt).localeCompare(String(a.postedAt)))
    .slice(0, limit);
}
