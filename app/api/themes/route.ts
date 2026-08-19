import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const themeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const workspaceId = sessionUser.workspaceId;

  try {
    const themes = await prisma.theme.findMany({
      where: workspaceId ? { workspaceId } : {},
      include: {
        feedback: {
          include: {
            feedback: true,
          },
        },
      },
    });

    return NextResponse.json(themes);
  } catch (e) {
    console.error('Themes fetch error:', e);
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
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
