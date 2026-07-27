'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/inbox', label: 'Inbox' },
    { href: '/settings/members', label: 'Members' },
  ];

  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1 rounded ${
              pathname === link.href ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{session.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-gray-200 px-3 py-1 rounded text-sm"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}