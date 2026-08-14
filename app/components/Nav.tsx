'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/inbox', label: 'Inbox', icon: '📥' },
    { href: '/themes', label: 'Themes', icon: '🏷️' },
    { href: '/reports', label: 'Reports', icon: '📄' },
    { href: '/settings/members', label: 'Members', icon: '👥' },
  ];

  const role = (session.user as any).role || 'ADMIN';

  async function handleSignOut() {
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between shadow-lg">
      {/* Brand Logo & Nav items */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            ∞
          </div>
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            LOOP <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Workspace & User Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-gray-300 font-medium">Acme SaaS Corp</span>
          <span className="text-gray-500">|</span>
          <span className="text-indigo-400 font-semibold uppercase tracking-wider">{role}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-200">{session.user.name || 'User'}</span>
            <span className="text-xs text-gray-400">{session.user.email}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 border border-white/10 transition-all cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}