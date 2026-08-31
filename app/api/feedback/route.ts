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
    return NextResponse.json({ error: 'Please log in to submit feedback.' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const role = sessionUser.role || 'ADMIN';
  if (role === 'VIEWER') {
    return NextResponse.json({ error: 'Viewer account has read-only access. Please log in as Admin or Analyst to submit feedback.' }, { status: 403 });
  }

  const workspaceId = sessionUser.workspaceId || 'cmu001ws0000001';

  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide valid feedback content.' }, { status: 400 });
  }

  try {
    // 1. Ensure Workspace exists to prevent foreign key errors
    await prisma.workspace.upsert({
      where: { id: workspaceId },
      update: {},
      create: {
        id: workspaceId,
        name: 'Acme SaaS Corp',
      },
    });

    // 2. Fetch active workspace themes
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
    });
    const themeNames = existingThemes.map((t) => t.name);

    // 3. Run AI Sentiment & Theme Analysis via Gemini AI / Local Engine
    const { analyzeFeedbackAI } = await import('@/lib/ai');
    const aiResult = await analyzeFeedbackAI(parsed.data.content, themeNames);

    // 4. Create Feedback Record
    const feedback = await prisma.feedback.create({
      data: {
        content: parsed.data.content,
        channel: parsed.data.channel,
        sourceRef: parsed.data.sourceRef || null,
        customerLabel: parsed.data.customerLabel || null,
        sentiment: aiResult.sentiment,
        sentimentScore: aiResult.sentimentScore,
        workspaceId,
      },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    // 5. Connect Matched Themes
    if (aiResult.themes && aiResult.themes.length > 0) {
      for (const tName of aiResult.themes) {
        let themeRecord = existingThemes.find((t) => t.name.toLowerCase() === tName.toLowerCase());
        if (!themeRecord) {
          try {
            themeRecord = await prisma.theme.create({
              data: {
                name: tName,
                description: `AI auto-generated category for ${tName}`,
                color: '#6366f1',
                workspaceId,
              },
            });
          } catch (te) {
            console.error('Theme create note:', te);
          }
        }
        if (themeRecord) {
          try {
            await prisma.feedbackTheme.create({
              data: {
                feedbackId: feedback.id,
                themeId: themeRecord.id,
                confidence: 0.9,
              },
            });
          } catch (fte) {
            // Duplicate link ignored
          }
        }
      }
    }

    // Refetch connected themes for clean response
    const finalFeedback = await prisma.feedback.findUnique({
      where: { id: feedback.id },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    return NextResponse.json(finalFeedback || feedback);
  } catch (e) {
    console.error('Prisma create error:', e);
    return NextResponse.json({ error: 'Failed to create feedback record. Please try again.' }, { status: 500 });
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