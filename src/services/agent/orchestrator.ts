/**
 * Agent Orchestrator
 * The main brain that decides what workers to activate and when
 */

import { prisma } from '@/lib/prisma';
import { jobWorker } from './workers/jobWorker';
import { networkingWorker } from './workers/networkingWorker';

export class AgentOrchestrator {
  /**
   * Run the autonomous loop for a user
   * Called periodically (e.g., every 6 hours)
   */
  async runAutonomousLoop(userId: string): Promise<{
    jobDrafts: string[];
    networkDrafts: string[];
    housingDrafts: string[];
  }> {
    console.log(`\n🤖 Agent Orchestrator: Starting loop for user ${userId}`);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User ${userId} not found`);

    const memory = await prisma.agentMemory.findUnique({ where: { userId } });
    if (!memory) throw new Error(`Memory not found for ${userId}`);

    const phase = user.targetPhase || 'pre-departure';
    console.log(`📍 User phase: ${phase}`);

    const results = {
      jobDrafts: [] as string[],
      networkDrafts: [] as string[],
      housingDrafts: [] as string[],
    };

    try {
      // Phase-specific logic
      if (phase === 'job_success') {
        // Focus on job hunting and networking
        console.log('\n💼 Running job hunt...');
        results.jobDrafts = await jobWorker.huntAndQueue(userId);

        console.log('\n🤝 Running networking...');
        results.networkDrafts = await networkingWorker.findAndDraftMessages(
          userId
        );
      } else if (phase === 'studying') {
        // Maintain networking, explore internships
        console.log('\n🤝 Running networking...');
        results.networkDrafts = await networkingWorker.findAndDraftMessages(
          userId
        );
      } else if (phase === 'arrival') {
        // Focus on housing (handled separately)
        console.log('📍 Arrival phase - housing focus');
      } else if (phase === 'pre-departure') {
        // Prepare for journey
        console.log('📋 Pre-departure phase - visa/banking focus');
      }

      const totalDrafts =
        results.jobDrafts.length +
        results.networkDrafts.length +
        results.housingDrafts.length;

      console.log(`\n✅ Autonomous loop complete.`);
      console.log(`   Job drafts: ${results.jobDrafts.length}`);
      console.log(`   Network drafts: ${results.networkDrafts.length}`);
      console.log(`   Total: ${totalDrafts} items staged for approval`);

      return results;
    } catch (err) {
      console.error('❌ Orchestrator error:', err);
      throw err;
    }
  }

  /**
   * Schedule periodic runs (every 6 hours)
   */
  schedulePeriodic(): void {
    const interval = 6 * 60 * 60 * 1000; // 6 hours

    console.log(`⏰ Scheduling agent orchestrator to run every 6 hours`);

    setInterval(async () => {
      try {
        const users = await prisma.user.findMany();
        console.log(`\n🔄 Running orchestrator for ${users.length} users...`);

        for (const user of users) {
          try {
            await this.runAutonomousLoop(user.id);
          } catch (err) {
            console.error(`Failed to run loop for ${user.id}:`, err);
          }
        }
      } catch (err) {
        console.error('Orchestrator scheduling error:', err);
      }
    }, interval);
  }
}

export const orchestrator = new AgentOrchestrator();
