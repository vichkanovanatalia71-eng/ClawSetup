import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const icons = [
  "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
];

export default async function AdminPage() {
  const [userCount, subCount, stepCount, ticketCount] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.step.count({ where: { status: "PUBLISHED" } }),
    prisma.aITicket.count(),
  ]);

  const stats = [
    { label: "Total Users", value: userCount },
    { label: "Active Subscriptions", value: subCount },
    { label: "Published Steps", value: stepCount },
    { label: "AI Requests", value: ticketCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-2xl shadow-neu p-6 bg-neu-bg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl shadow-neu-inset-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[i]} />
                </svg>
              </div>
              <p className="text-sm text-neu-muted">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold text-neu-text">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
