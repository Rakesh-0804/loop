'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/feedback', label: 'Feedback', icon: '💬' },
  { href: '/analysis', label: 'Analytics', icon: '📊' },
  { href: '/reports', label: 'Reports', icon: '📄' },
  { href: '/settings', label: 'Settings', icon: '⚙️' }, // Fixed
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-slate-950 text-slate-300 min-h-screen flex flex-col border-r border-slate-800">
      <div className="px-6 py-5">
        <h1 className="text-xl font-bold text-blue-400">
          Project LOOP
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + '/');

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}