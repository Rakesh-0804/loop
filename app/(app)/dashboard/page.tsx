'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4 flex gap-3">
        <Link href="/inbox" className="bg-gray-100 px-4 py-2 rounded">
          Feedback Inbox
        </Link>
        <Link href="/settings/members" className="bg-gray-100 px-4 py-2 rounded">
          Members
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Log out
        </button>
      </div>
    </div>
  );
}