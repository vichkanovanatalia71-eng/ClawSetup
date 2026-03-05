import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

const icons = [
  "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
];

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [userCount, subCount, stepCount, ticketCount, revenueData, weeklyTickets] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.step.count({ where: { status: "PUBLISHED" } }),
    prisma.aITicket.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "succeeded" },
    }),
    prisma.aITicket.count({
      where: { createdAt: { gte: weekAgo } },
    }),
  ]);

  const totalRevenue = (revenueData._sum.amount || 0) / 100;

  const stats = [
    { label: t("totalUsers"), value: userCount },
    { label: t("activeSubscriptions"), value: subCount },
    { label: t("publishedSteps"), value: stepCount },
    { label: t("aiRequests"), value: ticketCount },
    { label: t("revenueLabel"), value: `$${totalRevenue.toFixed(0)}` },
    { label: t("aiWeek"), value: weeklyTickets },
  ];

  const recentAudit = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { actor: { select: { email: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">{t("adminOverview")}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

      {recentAudit.length > 0 && (
        <div className="rounded-2xl shadow-neu p-6 bg-neu-bg">
          <h2 className="font-semibold text-neu-text mb-4">{t("recentActivity")}</h2>
          <div className="space-y-3">
            {recentAudit.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-neu-dark/10 last:border-0">
                <div>
                  <span className="text-neu-text font-medium">{log.action}</span>
                  <span className="text-neu-muted ml-2">{log.entity}</span>
                  {log.details && <span className="text-neu-muted ml-2 text-xs">- {log.details}</span>}
                </div>
                <div className="text-xs text-neu-muted">
                  {log.actor?.email || tc("system")} - {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
