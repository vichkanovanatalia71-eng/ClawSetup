"use client";

import { useSession } from "next-auth/react";

export default function Watermark() {
  const { data: session } = useSession();
  if (!session?.user?.email) return null;

  const text = `${session.user.email} | ${new Date().toISOString().slice(0, 10)}`;
  const items = Array.from({ length: 40 }, (_, i) => i);

  return (
    <div className="watermark-overlay" aria-hidden="true">
      {items.map((i) => (
        <span key={i} className="whitespace-nowrap">
          {text}
        </span>
      ))}
    </div>
  );
}
