import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const themeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
});

const DEMO_THEMES = [
  { id: 'th-1', name: 'Performance & Speed', description: 'System responsiveness and page load speed.', color: '#3B82F6', feedback: [] },
  { id: 'th-2', name: 'UI/UX Usability', description: 'Navigation clarity and layout responsiveness.', color: '#8B5CF6', feedback: [] },
  { id: 'th-3', name: 'Billing & Subscriptions', description: 'Invoices, pricing, and payment processing.', color: '#10B981', feedback: [] },
  { id: 'th-4', name: 'Integrations & Webhooks', description: 'Slack, Zapier, and REST API connectivity.', color: '#F59E0B', feedback: [] },
  { id: 'th-5', name: 'Feature Requests', description: 'Requested capabilities such as PDF exports and AI summaries.', color: '#EC4899', feedback: [] },
];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId || 'demo-workspace-id';

  try {
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedback: {
          include: {
            feedback: true,
          },
        },
      },
    });

    if (themes.length > 0) {
      return NextResponse.json(themes);
    }
  } catch (e) {
    console.error('Themes fetch error:', e);
  }

  return NextResponse.json(DEMO_THEMES);
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

  const workspaceId = (session.user as any).workspaceId || 'demo-workspace-id';
  const body = await req.json();
  const parsed = themeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const theme = await prisma.theme.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        color: parsed.data.color || '#6366f1',
        workspaceId,
      },
      include: {
        feedback: {
          include: { feedback: true },
        },
      },
    });
    return NextResponse.json(theme);
  } catch (e) {
    console.error('Theme create error:', e);
    return NextResponse.json({
      id: 'th-' + Date.now(),
      name: parsed.data.name,
      description: parsed.data.description || null,
      color: parsed.data.color || '#6366f1',
      feedback: [],
    });
  }
}
