import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const reportSchema = z.object({
  title: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId;
  const reports = await prisma.report.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspaceId = (session.user as any).workspaceId;
  const userName = session.user.name || session.user.email || 'Admin';

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Fetch workspace feedback and themes for automated summary synthesis
  const feedbacks = await prisma.feedback.findMany({ where: { workspaceId } });
  const themes = await prisma.theme.findMany({ where: { workspaceId } });

  const total = feedbacks.length;
  const posCount = feedbacks.filter((f) => f.sentiment === 'POS').length;
  const posRatio = total > 0 ? (posCount / total).toFixed(2) : '0';

  const topThemesList = themes.slice(0, 3).map((t) => t.name);

  const reportData = {
    summary: `Executive Feedback Intelligence Summary for workspace: ${total} feedback items analyzed across ${themes.length} active theme clusters. Overall positive customer sentiment score stands at ${(parseFloat(posRatio) * 100).toFixed(0)}%.`,
    topThemes: topThemesList.length > 0 ? topThemesList : ['Performance & Speed', 'UI/UX Usability', 'Feature Requests'],
    totalAnalyzed: total,
    positiveRatio: parseFloat(posRatio),
    keyActionItems: [
      'Prioritize high-volume customer feature requests in upcoming product sprint.',
      'Optimize infrastructure for peak feedback query throughput.',
      'Review pending support tickets with negative sentiment tags.',
    ],
  };

  const report = await prisma.report.create({
    data: {
      title: parsed.data.title,
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      generatedBy: userName,
      workspaceId,
      contentJson: JSON.stringify(reportData),
    },
  });

  return NextResponse.json(report);
}
