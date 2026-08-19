import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const feedbackSchema = z.object({
  content: z.string().min(1),
  channel: z.enum(['support_ticket', 'app_store', 'nps_survey', 'sales_call', 'community_post']),
  sourceRef: z.string().optional(),
  customerLabel: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const workspaceId = sessionUser.workspaceId;

  try {
    const feedback = await prisma.feedback.findMany({
      where: workspaceId ? { workspaceId } : {},
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(feedback);
  } catch (e) {
    console.error('Feedback fetch error:', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const role = sessionUser.role;
  if (role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspaceId = sessionUser.workspaceId;
  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
  }

  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const text = parsed.data.content.toLowerCase();
  let sentiment: 'POS' | 'NEU' | 'NEG' = 'NEU';
  let sentimentScore = 0.5;

  if (text.includes('love') || text.includes('great') || text.includes('fast') || text.includes('improved') || text.includes('seamless')) {
    sentiment = 'POS';
    sentimentScore = 0.92;
  } else if (text.includes('slow') || text.includes('bug') || text.includes('failed') || text.includes('confusing') || text.includes('incorrect')) {
    sentiment = 'NEG';
    sentimentScore = 0.15;
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        content: parsed.data.content,
        channel: parsed.data.channel,
        sourceRef: parsed.data.sourceRef || null,
        customerLabel: parsed.data.customerLabel || null,
        sentiment,
        sentimentScore,
        workspaceId,
      },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });
    return NextResponse.json(feedback);
  } catch (e) {
    console.error('Prisma create error:', e);
    return NextResponse.json({ error: 'Failed to create feedback record' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const role = sessionUser.role;
  if (role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspaceId = sessionUser.workspaceId;
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: 'Missing feedback ID' }, { status: 400 });
  }

  try {
    const existing = await prisma.feedback.findFirst({
      where: workspaceId ? { id: body.id, workspaceId } : { id: body.id },
    });

    if (existing) {
      const updated = await prisma.feedback.update({
        where: { id: body.id },
        data: {
          status: body.status !== undefined ? body.status : existing.status,
          sentiment: body.sentiment !== undefined ? body.sentiment : existing.sentiment,
        },
        include: {
          themes: {
            include: { theme: true },
          },
        },
      });
      return NextResponse.json(updated);
    }
  } catch (e) {
    console.error('PATCH error:', e);
  }

  return NextResponse.json({ error: 'Feedback record not found' }, { status: 404 });
}