import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const ADMIN_ONLY_PATHS = ['/settings/members'];

export const proxy = auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  if (!session?.user) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as { role?: string }).role || 'VIEWER';

  if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) && role !== 'ADMIN') {
    const forbiddenUrl = new URL('/dashboard', req.nextUrl);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/inbox/:path*', '/themes/:path*', '/reports/:path*', '/analysis/:path*', '/settings/:path*'],
};