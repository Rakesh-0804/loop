import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { DEMO_FEEDBACKS } from '@/lib/demo-data';

const reportSchema = z.object({
  title: z.string().min(1),
});

function buildDemoReport() {
  const total = DEMO_FEEDBACKS.length;
  const posCount = DEMO_FEEDBACKS.filter((f) => f.sentiment === 'POS').length;
  const posRatio = total > 0 ? posCount / total : 0;

  const themeCounts = new Map<string, number>();
  for (const fb of DEMO_FEEDBACKS) {
    for (const t of fb.themes) {
      themeCounts.set(t.theme.name, (themeCounts.get(t.theme.name) || 0) + 1);
    }
  }
  const topThemesList = [...themeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const reportData = {
    summary: `Executive Feedback Intelligence Summary for workspace: ${total} feedback items analyzed across ${themeCounts.size} active theme clusters. Overall positive customer sentiment score stands at ${(posRatio * 100).toFixed(0)}%.`,
    topThemes: topThemesList.length > 0 ? topThemesList : ['Performance & Speed', 'UI/UX Usability', 'Feature Requests'],
    totalAnalyzed: total,
    positiveRatio: posRatio,
    keyActionItems: [
      'Prioritize high-volume customer feature requests in upcoming product sprint.',
      'Optimize infrastructure for peak feedback query throughput.',
      'Review pending support tickets with negative sentiment tags.',
    ],
  };

  return {
    id: 'demo-report-1',
    title: 'Q3 Customer Feedback Intelligence Report',
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
    generatedBy: 'Alex Mercer (Admin)',
    createdAt: new Date(),
    contentJson: JSON.stringify(reportData),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId?: string }).workspaceId;

  try {
    const reports = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    if (reports.length > 0) {
      return NextResponse.json(reports);
    }
  } catch (e) {
    console.error('Reports fetch error, returning demo fallback:', e);
  }

  return NextResponse.json([buildDemoReport()]);
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

  const workspaceId = sessionUser.workspaceId || 'demo-workspace-id';
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
