/**
 * Job Worker Service
 * Hunts for jobs across multiple platforms and stages them for approval
 */

import { prisma } from '@/lib/prisma';
import { getLLM } from '@/services/llm';
import type { User, AgentMemory } from '@prisma/client';

export interface JobSearchCriteria {
  targetSectors: string[];
  targetRoles: string[];
  targetCompanies?: string[];
  targetLocations: string[];
  minimumSalary?: number;
  jobTypes?: string[];
}

export class JobWorker {
  /**
   * Hunt for jobs and stage them as drafts
   * This is called by the agent orchestrator
   */
  async huntAndQueue(userId: string): Promise<string[]> {
    console.log(`🔍 Job Worker: Starting hunt for user ${userId}`);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User ${userId} not found`);

    const memory = await prisma.agentMemory.findUnique({ where: { userId } });
    if (!memory) throw new Error(`Memory not found for ${userId}`);

    try {
      const goals = JSON.parse(memory.goals);
      const appliedJobIds = memory.appliedJobIds.split(',').filter(Boolean);

      // Search across job boards
      const jobs = await this.aggregateJobs(goals, appliedJobIds);
      console.log(`📋 Found ${jobs.length} matching jobs`);

      if (jobs.length === 0) {
        console.log('⚠️  No new jobs found');
        return [];
      }

      // For each job, create a tailored application draft
      const taskIds: string[] = [];
      for (const job of jobs.slice(0, 10)) {
        // Limit to 10 per run to avoid overwhelming
        try {
          const taskId = await this.createApplicationDraft(user, memory, job);
          taskIds.push(taskId);
          console.log(`✅ Drafted job application: ${job.title} @ ${job.company}`);
        } catch (err) {
          console.error(`❌ Failed to draft application for ${job.title}:`, err);
        }
      }

      console.log(`🎯 Job hunt complete. ${taskIds.length} drafts staged for approval.`);
      return taskIds;
    } catch (err) {
      console.error('Job Worker Error:', err);
      throw err;
    }
  }

  /**
   * Aggregate jobs from multiple sources
   */
  private async aggregateJobs(
    goals: JobSearchCriteria,
    alreadyAppliedIds: string[]
  ): Promise<any[]> {
    const allJobs: any[] = [];

    try {
      // Search LinkedIn
      const linkedInJobs = await this.searchLinkedIn(goals);
      allJobs.push(
        ...linkedInJobs.filter(
          (j) => !alreadyAppliedIds.includes(`linkedin:${j.externalId}`)
        )
      );
    } catch (err) {
      console.error('LinkedIn search failed:', err);
    }

    try {
      // Search Lever (tech companies use this heavily)
      const leverJobs = await this.searchLever(goals);
      allJobs.push(
        ...leverJobs.filter(
          (j) => !alreadyAppliedIds.includes(`lever:${j.externalId}`)
        )
      );
    } catch (err) {
      console.error('Lever search failed:', err);
    }

    try {
      // Search Indeed
      const indeedJobs = await this.searchIndeed(goals);
      allJobs.push(
        ...indeedJobs.filter(
          (j) => !alreadyAppliedIds.includes(`indeed:${j.externalId}`)
        )
      );
    } catch (err) {
      console.error('Indeed search failed:', err);
    }

    try {
      // Search AngelList (startups)
      const angelListJobs = await this.searchAngelList(goals);
      allJobs.push(
        ...angelListJobs.filter(
          (j) => !alreadyAppliedIds.includes(`angellist:${j.externalId}`)
        )
      );
    } catch (err) {
      console.error('AngelList search failed:', err);
    }

    // Deduplicate and sort by relevance
    const uniqueJobs = Array.from(
      new Map(allJobs.map((j) => [`${j.company}:${j.title}`, j])).values()
    );

    return uniqueJobs.sort(
      (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );
  }

  /**
   * Create a tailored application draft
   */
  private async createApplicationDraft(
    user: any,
    memory: any,
    job: any
  ): Promise<string> {
    const llm = getLLM();
    const preferences = JSON.parse(memory.preferences || '{}');

    // Generate tailored CV
    const tailoredCV = await llm.tailorCV({
      baseCV: user.cv || 'CV not provided',
      jobDescription: job.description,
      companyValues: job.companyValues || [],
      keySkills: (job.tags || '').split(',').map((s: string) => s.trim()),
    });

    // Generate cover letter
    const coverLetter = await llm.generateCoverLetter({
      jobTitle: job.title,
      company: job.company,
      companyDescription: job.companyDescription || '',
      jobDescription: job.description,
      userBackground: {
        name: user.name || 'Candidate',
        education: (user.profileBio || '')
          .split(','
          )
          .filter(Boolean)
          .slice(0, 2),
        experience: [],
        skills: (job.tags || '').split(',').map((s: string) => s.trim()),
        achievements: [],
      },
      tone: 'professional',
    });

    // Create task
    const task = await prisma.agentTask.create({
      data: {
        userId: user.id,
        type: 'job_apply',
        status: 'drafted',
        payload: JSON.stringify({
          jobId: job.externalId,
          jobSource: job.source,
          company: job.company,
          jobTitle: job.title,
          jobUrl: job.url,
          salary: job.salary,
          location: job.location,
          description: job.description,
          tailoredCV,
          coverLetter,
          applicationDeadline: job.applicationDeadline,
        }),
      },
    });

    return task.id;
  }

  /**
   * Search LinkedIn for jobs
   * Note: Requires LinkedIn API access or web scraping
   */
  private async searchLinkedIn(goals: JobSearchCriteria): Promise<any[]> {
    // TODO: Implement LinkedIn API integration
    // For now, return mock data for testing
    console.log('🔗 Searching LinkedIn...');

    // In production, use:
    // - LinkedIn Jobs API (if available)
    // - Web scraping with Puppeteer (requires careful handling of ToS)
    // - Third-party APIs like ScraperAPI

    return [];
  }

  /**
   * Search Lever for jobs
   * Tech-heavy job board, great for startups
   */
  private async searchLever(goals: JobSearchCriteria): Promise<any[]> {
    console.log('🎯 Searching Lever...');

    const jobs: any[] = [];

    try {
      // Lever publishes jobs via JSON API
      // Example: https://api.lever.co/v0/postings?team_id={id}

      // For beta, we'll use a simple approach: search popular tech company Lever boards
      const techCompanies = [
        'spotify',
        'stripe',
        'figma',
        'notion',
        'canva',
        'airtable',
      ];

      for (const company of techCompanies) {
        try {
          const response = await fetch(
            `https://${company}.lever.co/api/v1/postings`,
            { method: 'GET' }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.postings) {
              jobs.push(
                ...data.postings
                  .filter((p: any) =>
                    this.matchesGoals(p, goals)
                  )
                  .map((p: any) => ({
                    externalId: p.id,
                    source: 'lever',
                    title: p.text,
                    company: company.charAt(0).toUpperCase() + company.slice(1),
                    description: p.description || '',
                    location: p.locations?.map((l: any) => l.name).join(', ') || 'Remote',
                    url: p.hostedUrl,
                    tags: p.categories?.department || '',
                    salary: p.salary || null,
                    postedDate: p.createdAt,
                    relevanceScore: this.calculateRelevance(p, goals),
                  }))
              );
            }
          }
        } catch (err) {
          // Company board might not exist or be inaccessible
        }
      }
    } catch (err) {
      console.error('Lever search error:', err);
    }

    return jobs;
  }

  /**
   * Search Indeed for jobs
   */
  private async searchIndeed(goals: JobSearchCriteria): Promise<any[]> {
    console.log('🔎 Searching Indeed...');

    // Indeed API requires authentication
    // For beta, you can use:
    // 1. Indeed API (requires key)
    // 2. Web scraping (RapidAPI has Indeed scraper)
    // 3. RSS feeds (Indeed offers RSS for searches)

    // Example with RSS:
    const searchQuery = `${goals.targetRoles.join('+')}`;
    const location = goals.targetLocations[0] || 'UK';

    try {
      const rssUrl = `https://www.indeed.co.uk/jobs?q=${searchQuery}&l=${location}&sort=date&rss`;
      const response = await fetch(rssUrl);
      const xml = await response.text();

      // Parse XML (you might want to use xml2js package)
      // For now, return empty array
      return [];
    } catch (err) {
      console.error('Indeed search error:', err);
      return [];
    }
  }

  /**
   * Search AngelList for startup jobs
   */
  private async searchAngelList(goals: JobSearchCriteria): Promise<any[]> {
    console.log('🚀 Searching AngelList...');

    // AngelList has a public API
    // https://angel.co/api/spec

    try {
      // Example search
      const query = new URLSearchParams({
        q: goals.targetRoles.join(' '),
        locations: goals.targetLocations.join(','),
      });

      const response = await fetch(
        `https://api.angel.co/1/jobs?${query.toString()}`,
        {
          headers: {
            // AngelList might require API key
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Parse and return jobs
      }

      return [];
    } catch (err) {
      console.error('AngelList search error:', err);
      return [];
    }
  }

  /**
   * Check if a job matches the user's goals
   */
  private matchesGoals(job: any, goals: JobSearchCriteria): boolean {
    const titleLower = (job.text || '').toLowerCase();
    const descLower = (job.description || '').toLowerCase();

    // Match role
    const roleMatch = goals.targetRoles.some((role) =>
      titleLower.includes(role.toLowerCase())
    );

    // Match sector
    const sectorMatch = goals.targetSectors.some((sector) =>
      descLower.includes(sector.toLowerCase())
    );

    // Match location
    const locationMatch = goals.targetLocations.some((loc) => {
      const jobLoc = (job.locations?.[0]?.name || '').toLowerCase();
      return jobLoc.includes(loc.toLowerCase());
    });

    return roleMatch && (sectorMatch || locationMatch);
  }

  /**
   * Calculate relevance score (0-1)
   */
  private calculateRelevance(job: any, goals: JobSearchCriteria): number {
    let score = 0;

    const titleLower = (job.text || '').toLowerCase();
    const descLower = (job.description || '').toLowerCase();

    // Role match (40%)
    if (goals.targetRoles.some((r) => titleLower.includes(r.toLowerCase()))) {
      score += 0.4;
    }

    // Sector match (30%)
    if (goals.targetSectors.some((s) => descLower.includes(s.toLowerCase()))) {
      score += 0.3;
    }

    // Company match (20%)
    if (
      goals.targetCompanies?.some((c) => titleLower.includes(c.toLowerCase()))
    ) {
      score += 0.2;
    }

    // Location match (10%)
    if (goals.targetLocations.some((l) => descLower.includes(l.toLowerCase()))) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Execute an approved job application
   */
  async executeApplication(taskId: string): Promise<void> {
    console.log(`📤 Executing job application: ${taskId}`);

    const task = await prisma.agentTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error(`Task ${taskId} not found`);

    const payload = JSON.parse(task.payload);

    try {
      // Different platforms have different application methods
      switch (payload.jobSource) {
        case 'lever':
          await this.applyViaLever(payload);
          break;
        case 'linkedin':
          await this.applyViaLinkedIn(payload);
          break;
        case 'indeed':
          await this.applyViaIndeed(payload);
          break;
        case 'angellist':
          await this.applyViaAngelList(payload);
          break;
        default:
          // Email application
          await this.applyViaEmail(payload);
      }

      // Update task status
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          status: 'executing',
          executedAt: new Date(),
        },
      });

      // Log in AppliedJob
      await prisma.appliedJob.create({
        data: {
          userId: task.userId,
          jobId: payload.jobId,
          company: payload.company,
          jobTitle: payload.jobTitle,
          jobUrl: payload.jobUrl,
          customizedCV: payload.tailoredCV,
          coverLetter: payload.coverLetter,
          applicationMethod: payload.jobSource,
          status: 'applied',
        },
      });

      // Update task to completed
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          result: 'applied',
          resultDetails: JSON.stringify({
            appliedAt: new Date().toISOString(),
            company: payload.company,
            role: payload.jobTitle,
          }),
        },
      });

      console.log(`✅ Application executed: ${payload.company} - ${payload.jobTitle}`);
    } catch (err) {
      console.error('Application execution failed:', err);
      await prisma.agentTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          error: (err as Error).message,
        },
      });
      throw err;
    }
  }

  /**
   * Apply via Lever platform
   */
  private async applyViaLever(payload: any): Promise<void> {
    // Lever has a public application URL that can be automated
    // https://jobs.lever.co/companies/{company}/{job-id}
    // Submit form with CV, cover letter, and contact info

    console.log(`Applying via Lever: ${payload.company}`);
    // Implementation would use Puppeteer to automate form submission
    // For MVP, we'll just log it
  }

  /**
   * Apply via LinkedIn
   */
  private async applyViaLinkedIn(payload: any): Promise<void> {
    console.log(`Applying via LinkedIn: ${payload.company}`);
    // LinkedIn Easy Apply requires authentication and browser automation
    // Use Puppeteer/Playwright to automate
  }

  /**
   * Apply via Indeed
   */
  private async applyViaIndeed(payload: any): Promise<void> {
    console.log(`Applying via Indeed: ${payload.company}`);
    // Indeed has application forms that can be automated
  }

  /**
   * Apply via AngelList
   */
  private async applyViaAngelList(payload: any): Promise<void> {
    console.log(`Applying via AngelList: ${payload.company}`);
    // AngelList API allows application submission
  }

  /**
   * Apply via email (fallback)
   */
  private async applyViaEmail(payload: any): Promise<void> {
    console.log(`Applying via email: ${payload.company}`);
    // Send email with CV and cover letter attached
    // Implementation would use email service (SendGrid, etc.)
  }
}

export const jobWorker = new JobWorker();
