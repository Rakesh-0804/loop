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
          console.error('Prisma auth error:', e);
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
        sessionUser.workspaceId = token.workspaceId as string;
        sessionUser.role = (token.role as string) || 'ADMIN';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});