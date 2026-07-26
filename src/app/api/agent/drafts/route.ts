/**
 * GET /api/agent/drafts
 * List all pending agent tasks for the user
 * Query: ?status=drafted&type=job_apply&limit=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'drafted';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch tasks
    const tasks = await prisma.agentTask.findMany({
      where: {
        userId: user.id,
        status,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Parse payloads
    const enriched = tasks.map((task) => ({
      ...task,
      payload: JSON.parse(task.payload || '{}'),
      editedContent: task.editedContent ? JSON.parse(task.editedContent) : null,
    }));

    return NextResponse.json({
      ok: true,
      count: enriched.length,
      tasks: enriched,
    });
  } catch (error) {
    console.error('GET /api/agent/drafts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
