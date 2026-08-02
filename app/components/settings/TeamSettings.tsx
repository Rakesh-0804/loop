"use client";

import { Plus } from "lucide-react";

const members = [
  {
    name: "John Doe",
    role: "Admin",
    email: "john@example.com",
  },
  {
    name: "Sarah Wilson",
    role: "Manager",
    email: "sarah@example.com",
  },
  {
    name: "David Lee",
    role: "Viewer",
    email: "david@example.com",
  },
];

export default function TeamSettings() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Team Members
        </h2>

        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.email}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
          >
            <div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-slate-500">{member.email}</p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}