import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateReportAI } from '@/lib/ai';

const reportSchema = z.object({
  title: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const workspaceId = sessionUser.workspaceId;

  try {
    const reports = await prisma.report.findMany({
      where: workspaceId ? { workspaceId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (e) {
    console.error('Reports GET error:', e);
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

  const userName = session.user.name || session.user.email || 'Admin';

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let feedbacks: any[] = [];
  let themes: any[] = [];

  try {
    feedbacks = await prisma.feedback.findMany({ where: { workspaceId } });
    themes = await prisma.theme.findMany({ where: { workspaceId } });
  } catch (e) {
    console.error('Database query error during report generation:', e);
  }

  // Synthesize report using Gemini 3.6 Flash
  const reportContent = await generateReportAI(feedbacks, themes, parsed.data.title);

  try {
    const report = await prisma.report.create({
      data: {
        title: parsed.data.title,
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        generatedBy: userName,
        workspaceId,
        contentJson: JSON.stringify(reportContent),
      },
    });
    return NextResponse.json(report);
  } catch (e) {
    console.error('Prisma report save error:', e);
    return NextResponse.json({ error: 'Failed to create executive report' }, { status: 500 });
  }
}
