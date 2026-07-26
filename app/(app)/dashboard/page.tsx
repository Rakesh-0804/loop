'use client';
import { signOut } from 'next-auth/react';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-4 bg-gray-200 px-4 py-2 rounded"
      >
        Log out
      </button>
    </div>
  );
}