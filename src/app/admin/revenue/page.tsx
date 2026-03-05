import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: "ACTIVE" },
  });
  const annualSubs = await prisma.subscription.count({
    where: { status: "ACTIVE", plan: "annual" },
  });
  const monthlySubs = activeSubscriptions - annualSubs;

  const mrr = monthlySubs * 29 + Math.round((annualSubs * 278) / 12);
  const arr = mrr * 12;

  const canceledLast30 = await prisma.subscription.count({
    where: {
      status: "CANCELED",
      updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  const newLast30 = await prisma.subscription.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  // Monthly revenue from payments
  const now = new Date();
  const months: { label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const payments = await prisma.payment.aggregate({
      where: {
        status: "succeeded",
        createdAt: { gte: start, lt: end },
      },
      _sum: { amount: true },
    });
    months.push({
      label: start.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      revenue: Math.round((payments._sum.amount || 0) / 100),
    });
  }

  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">Revenue Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "MRR", value: `$${mrr.toLocaleString()}`, color: "text-green-600" },
          { label: "ARR", value: `$${arr.toLocaleString()}`, color: "text-blue-600" },
          { label: "New (30d)", value: `+${newLast30}`, color: "text-brand-600" },
          { label: "Churned (30d)", value: `-${canceledLast30}`, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl shadow-neu p-5 bg-neu-bg">
            <p className="text-xs text-neu-muted mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg mb-8">
        <h2 className="font-semibold text-neu-text mb-4">Monthly Revenue</h2>
        <div className="flex items-end gap-3 h-48">
          {months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-neu-muted mb-1">${m.revenue}</span>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-brand-500 rounded-t-lg transition-all"
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 160, 4)}px` }}
                />
              </div>
              <span className="text-xs text-neu-muted">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg">
        <h2 className="font-semibold text-neu-text mb-2">Subscription Breakdown</h2>
        <div className="text-sm text-neu-muted space-y-1">
          <p>Monthly subscribers: {monthlySubs}</p>
          <p>Annual subscribers: {annualSubs}</p>
          <p>Total active: {activeSubscriptions}</p>
        </div>
      </div>
    </div>
  );
}
