/**
 * POST /api/agent/memory
 * Update user's agent memory (goals, preferences, phase)
 * Body: { goals: {...}, preferences: {...}, currentPhase: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

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

    const body = await req.json();
    const { goals, preferences, currentPhase } = body;

    // Get or create memory
    let memory = await prisma.agentMemory.findUnique({
      where: { userId: user.id },
    });

    if (!memory) {
      memory = await prisma.agentMemory.create({
        data: {
          userId: user.id,
          currentPhase: currentPhase || 'pre-departure',
          goals: JSON.stringify(goals || {}),
          preferences: JSON.stringify(preferences || {}),
        },
      });
    } else {
      memory = await prisma.agentMemory.update({
        where: { userId: user.id },
        data: {
          ...(currentPhase && { currentPhase }),
          ...(goals && { goals: JSON.stringify(goals) }),
          ...(preferences && { preferences: JSON.stringify(preferences) }),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      memory,
      message: 'Memory updated successfully',
    });
  } catch (error) {
    console.error('POST /api/agent/memory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/memory
 * Retrieve user's agent memory
 */
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

    let memory = await prisma.agentMemory.findUnique({
      where: { userId: user.id },
    });

    if (!memory) {
      // Create default memory
      memory = await prisma.agentMemory.create({
        data: {
          userId: user.id,
          currentPhase: user.targetPhase || 'pre-departure',
          goals: JSON.stringify({
            wantJob: false,
            wantNetworking: false,
            targetSectors: [],
            targetRoles: [],
          }),
          preferences: JSON.stringify({}),
        },
      });
    }

    // Parse JSON fields
    const enriched = {
      ...memory,
      goals: JSON.parse(memory.goals || '{}'),
      preferences: JSON.parse(memory.preferences || '{}'),
      appliedJobIds: memory.appliedJobIds.split(',').filter(Boolean),
      networkedWith: memory.networkedWith.split(',').filter(Boolean),
    };

    return NextResponse.json({
      ok: true,
      memory: enriched,
    });
  } catch (error) {
    console.error('GET /api/agent/memory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
