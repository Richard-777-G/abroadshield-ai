/**
 * PATCH /api/agent/drafts/:id
 * Approve, edit, or decline a draft
 * Body: { action: "approved" | "edited" | "declined", editedContent?: {...} }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { jobWorker } from '@/services/agent/workers/jobWorker';
import { networkingWorker } from '@/services/agent/workers/networkingWorker';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the task
    const task = await prisma.agentTask.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action, editedContent } = body;

    if (!['approved', 'edited', 'declined'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update task
    const updated = await prisma.agentTask.update({
      where: { id: params.id },
      data: {
        studentAction: action,
        status: action === 'approved' ? 'approved' : action === 'declined' ? 'declined' : 'drafted',
        editedContent: editedContent ? JSON.stringify(editedContent) : null,
        approvedAt: action === 'approved' ? new Date() : null,
      },
    });

    // If approved, schedule execution
    if (action === 'approved') {
      try {
        // Execute based on task type
        if (task.type === 'job_apply') {
          await jobWorker.executeApplication(params.id);
        } else if (task.type === 'network_message') {
          await networkingWorker.executeSendMessage(params.id);
        }
      } catch (err) {
        console.error('Execution failed:', err);
        // Task will be marked as failed in the worker
      }
    }

    return NextResponse.json({
      ok: true,
      task: updated,
      message:
        action === 'approved'
          ? 'Draft approved and sent!'
          : action === 'declined'
            ? 'Draft declined.'
            : 'Draft saved for editing.',
    });
  } catch (error) {
    console.error('PATCH /api/agent/drafts/:id error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
