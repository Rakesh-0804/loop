import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  workspaceId: string;
};

const DEMO_USERS: Record<string, AuthUser> = {
  'admin@projectloop.ai': {
    id: 'demo-admin-id',
    name: 'Alex Mercer (Admin)',
    email: 'admin@projectloop.ai',
    role: 'ADMIN',
    workspaceId: 'demo-workspace-id',
  },
  'analyst@projectloop.ai': {
    id: 'demo-analyst-id',
    name: 'Sarah Chen (Analyst)',
    email: 'analyst@projectloop.ai',
    role: 'ANALYST',
    workspaceId: 'demo-workspace-id',
  },
  'viewer@projectloop.ai': {
    id: 'demo-viewer-id',
    name: 'David Miller (Viewer)',
    email: 'viewer@projectloop.ai',
    role: 'VIEWER',
    workspaceId: 'demo-workspace-id',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'super-secret-loop-auth-key-2026',
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string)?.trim().toLowerCase();
        const password = credentials?.password as string;
        if (!email || !password) return null;

        // Try Prisma DB lookup
        try {
          const { prisma } = await import('@/lib/db');
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (valid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                workspaceId: user.workspaceId,
                role: user.role,
              };
            }
          }
        } catch (e) {
          console.error('Prisma auth error, attempting demo fallback:', e);
        }

        // Demo Fallback for Vercel Serverless environment
        if (DEMO_USERS[email] && password === 'password123') {
          return DEMO_USERS[email];
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.userId = authUser.id;
        token.workspaceId = authUser.workspaceId;
        token.role = authUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as { id?: string; userId?: string; workspaceId?: string; role?: string };
        sessionUser.userId = (token.userId as string) || sessionUser.id || undefined;
        sessionUser.workspaceId = (token.workspaceId as string) || 'demo-workspace-id';
        sessionUser.role = (token.role as string) || 'ADMIN';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});