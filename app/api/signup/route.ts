import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, workspaceName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {    
    const workspace = await tx.workspace.create({ data: { name: workspaceName } });
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'ADMIN',
        workspaceId: workspace.id,
      },
    });
    return { workspace, user };
  });

  return NextResponse.json({ success: true, userId: result.user.id });
}