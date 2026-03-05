"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const roles = ["USER", "EDITOR", "ADMIN", "SUPERADMIN"];

const roleColors: Record<string, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  EDITOR: "bg-amber-100 text-amber-700",
  USER: "bg-gray-200 text-gray-600",
};

export default function UserRoleManager({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newRole: string) {
    if (newRole === role) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setRole(newRole);
        router.refresh();
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className={`neu-pill text-xs font-medium border-0 cursor-pointer ${roleColors[role] || roleColors.USER} disabled:opacity-50`}
    >
      {roles.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
