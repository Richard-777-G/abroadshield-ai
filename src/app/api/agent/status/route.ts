/**
 * GET /api/agent/status
 * Get agent status, recent activity, and stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
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

    // Get stats
    const stats = {
      totalDrafted: await prisma.agentTask.count({
        where: { userId: user.id, status: 'drafted' },
      }),
      totalApproved: await prisma.agentTask.count({
        where: { userId: user.id, status: 'approved' },
      }),
      totalCompleted: await prisma.agentTask.count({
        where: { userId: user.id, status: 'completed' },
      }),
      totalFailed: await prisma.agentTask.count({
        where: { userId: user.id, status: 'failed' },
      }),
      jobsApplied: await prisma.appliedJob.count({
        where: { userId: user.id },
      }),
      networksContacted: await prisma.networkContact.count({
        where: { userId: user.id },
      }),
    };

    // Get recent activity
    const recentTasks = await prisma.agentTask.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const recentActivity = recentTasks.map((t) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({
      ok: true,
      stats,
      recentActivity,
    });
  } catch (error) {
    console.error('GET /api/agent/status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
