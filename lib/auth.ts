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

const SYSTEM_ACCOUNTS: Record<string, AuthUser> = {
  'admin@projectloop.ai': {
    id: 'usr-admin-01',
    name: 'Alex Mercer (Admin)',
    email: 'admin@projectloop.ai',
    role: 'ADMIN',
    workspaceId: 'cmu001ws0000001',
  },
  'analyst@projectloop.ai': {
    id: 'usr-analyst-02',
    name: 'Sarah Chen (Analyst)',
    email: 'analyst@projectloop.ai',
    role: 'ANALYST',
    workspaceId: 'cmu001ws0000001',
  },
  'viewer@projectloop.ai': {
    id: 'usr-viewer-03',
    name: 'David Miller (Viewer)',
    email: 'viewer@projectloop.ai',
    role: 'VIEWER',
    workspaceId: 'cmu001ws0000001',
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
          console.error('Prisma auth error, attempting fallback:', e);
        }

        // System Account Fallback for Analyst, Admin & Viewer
        if (SYSTEM_ACCOUNTS[email] && password === 'password123') {
          return SYSTEM_ACCOUNTS[email];
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
        sessionUser.userId = (token.userId as string) || sessionUser.id;
        sessionUser.workspaceId = (token.workspaceId as string) || 'cmu001ws0000001';
        sessionUser.role = (token.role as string) || 'ADMIN';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});