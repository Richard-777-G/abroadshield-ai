/**
 * POST /api/agent/run
 * Manually trigger the agent to run immediately
 * (Normally it runs on schedule, but this allows on-demand)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { orchestrator } from '@/services/agent';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Run orchestrator for this user
    const results = await orchestrator.runAutonomousLoop(user.id);

    return NextResponse.json({
      ok: true,
      message: 'Agent run complete',
      results,
    });
  } catch (error) {
    console.error('POST /api/agent/run error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}
