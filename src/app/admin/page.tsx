import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
