import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      createdAt: true,
      subscription: { select: { status: true } },
      progress: { where: { completed: true }, select: { completedAt: true } },
    },
  });

  // Group users by registration month
  const cohorts: Record<string, { total: number; activeByMonth: Record<number, number> }> = {};

  for (const user of users) {
    const cohortKey = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = { total: 0, activeByMonth: {} };
    }
    cohorts[cohortKey].total++;

    // Check activity in each subsequent month
    const isActive = user.subscription?.status === "ACTIVE" || user.subscription?.status === "TRIALING";
    const lastActivity = user.progress.length > 0
      ? Math.max(...user.progress.map((p) => p.completedAt?.getTime() || 0))
      : 0;

    if (isActive || lastActivity > 0) {
      const monthsSinceRegistration = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      for (let m = 0; m <= Math.min(monthsSinceRegistration, 6); m++) {
        const monthStart = new Date(user.createdAt.getTime() + m * 30 * 24 * 60 * 60 * 1000);
        const monthEnd = new Date(monthStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        const hadActivity = user.progress.some(
          (p) => p.completedAt && p.completedAt >= monthStart && p.completedAt < monthEnd
        );
        if (hadActivity || (m === 0)) {
          cohorts[cohortKey].activeByMonth[m] = (cohorts[cohortKey].activeByMonth[m] || 0) + 1;
        }
      }
    }
  }

  const sortedCohorts = Object.entries(cohorts).sort(([a], [b]) => b.localeCompare(a)).slice(0, 12);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">Retention Cohorts</h1>
      <div className="rounded-2xl shadow-neu bg-neu-bg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neu-dark/15">
              <th className="text-left px-4 py-3 font-medium text-neu-muted">Cohort</th>
              <th className="text-center px-4 py-3 font-medium text-neu-muted">Users</th>
              {[0, 1, 2, 3, 4, 5, 6].map((m) => (
                <th key={m} className="text-center px-4 py-3 font-medium text-neu-muted">M{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCohorts.map(([key, data]) => (
              <tr key={key} className="border-b border-neu-dark/10">
                <td className="px-4 py-3 text-neu-text font-medium">{key}</td>
                <td className="px-4 py-3 text-center text-neu-muted">{data.total}</td>
                {[0, 1, 2, 3, 4, 5, 6].map((m) => {
                  const active = data.activeByMonth[m] || 0;
                  const pct = data.total > 0 ? Math.round((active / data.total) * 100) : 0;
                  const bg = pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-yellow-100 text-yellow-700" : pct > 0 ? "bg-red-100 text-red-700" : "";
                  return (
                    <td key={m} className={`px-4 py-3 text-center text-xs ${bg}`}>
                      {pct > 0 ? `${pct}%` : "---"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
