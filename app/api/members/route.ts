import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const DEMO_MEMBERS = [
  { id: 'demo-admin-id', name: 'Alex Mercer (Admin)', email: 'admin@projectloop.ai', role: 'ADMIN' },
  { id: 'demo-analyst-id', name: 'Sarah Chen (Analyst)', email: 'analyst@projectloop.ai', role: 'ANALYST' },
  { id: 'demo-viewer-id', name: 'David Miller (Viewer)', email: 'viewer@projectloop.ai', role: 'VIEWER' },
];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId?: string }).workspaceId;

  try {
    const members = await prisma.user.findMany({
      where: { workspaceId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (members.length > 0) {
      return NextResponse.json(members);
    }
  } catch (e) {
    console.error('Members fetch error, returning demo fallback:', e);
  }

  return NextResponse.json(DEMO_MEMBERS);
}

const addMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
  password: z.string().min(6).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { role?: string; workspaceId?: string };
  const userRole = sessionUser.role;
  if (userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Only admins can invite members' }, { status: 403 });
  }

  const workspaceId = sessionUser.workspaceId || 'demo-workspace-id';
  const body = await req.json();
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid member details' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password || 'password123', 10);

  const newMember = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      workspaceId,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(newMember);
}

const roleUpdateSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { role?: string; workspaceId?: string };
  const role = sessionUser.role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspaceId = sessionUser.workspaceId;
  const body = await req.json();
  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const target = await prisma.user.findFirst({
    where: { id: parsed.data.userId, workspaceId },
  });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
  });
  return NextResponse.json(updated);
}