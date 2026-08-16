'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  ANALYST: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  VIEWER: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/inbox', label: 'Inbox', icon: '📥' },
    { href: '/analysis', label: 'Analytics', icon: '📈' },
    { href: '/themes', label: 'Themes', icon: '🏷️' },
    { href: '/reports', label: 'Reports', icon: '📄' },
    { href: '/settings/members', label: 'Members', icon: '👥' },
  ];

  const role = (session.user as { role?: string }).role || 'ADMIN';
  const name = session.user.name || 'User';
  const email = session.user.email || '';

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

      {/* Workspace & User Profile Dropdown */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-gray-300 font-medium">Acme SaaS Corp</span>
          <span className="text-gray-500">|</span>
          <span className="text-indigo-400 font-semibold uppercase tracking-wider">{role}</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all pl-1.5 pr-3 py-1.5 cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-indigo-500/20">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-200 leading-tight">{name}</span>
              <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[140px]">{email}</span>
            </div>
            <span className={`text-xs text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-panel p-2 space-y-1 animate-fadeIn" role="menu">
              <div className="px-3 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{email}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${ROLE_STYLES[role] || ROLE_STYLES.VIEWER}`}>
                    {role}
                  </span>
                  <span className="text-[10px] text-gray-500">Workspace: Acme SaaS Corp</span>
                </div>
              </div>

              <Link
                href="/settings/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <span>👤</span>
                <span>My Profile & Security</span>
              </Link>

              {role === 'ADMIN' && (
                <Link
                  href="/settings/members"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  <span>👥</span>
                  <span>Team Members</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/15 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer"
              >
                <span>↩</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}