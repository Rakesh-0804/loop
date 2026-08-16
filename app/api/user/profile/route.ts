import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { userId?: string; workspaceId?: string; name?: string; email?: string; role?: string };
  const userId = sessionUser.userId;
  const workspaceId = sessionUser.workspaceId;

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        workspaceId: true,
        workspace: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error('Profile fetch error:', e);
    return NextResponse.json(
      {
        id: userId,
        name: sessionUser.name || 'User',
        email: sessionUser.email || '',
        role: sessionUser.role || 'ADMIN',
        workspaceId,
        workspace: { id: workspaceId, name: 'My Workspace' },
      },
      { status: 200 }
    );
  }
}

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { userId?: string; workspaceId?: string };
  const userId = sessionUser.userId;
  const workspaceId = sessionUser.workspaceId;
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: { name: parsed.error.issues.map((i) => i.message) } },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({ where: { id: userId, workspaceId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true, role: true, workspaceId: true },
  });

  return NextResponse.json(updated);
}

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = session.user as { userId?: string; workspaceId?: string };
  const userId = sessionUser.userId;
  const workspaceId = sessionUser.workspaceId;
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: { newPassword: parsed.error.issues.map((i) => i.message) } },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({ where: { id: userId, workspaceId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: 'Current password is incorrect', fieldErrors: { currentPassword: ['Current password is incorrect'] } },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}