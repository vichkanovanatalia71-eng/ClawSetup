import { prisma } from "@/lib/prisma";
import UserRoleManager from "./UserRoleManager";
import { calculateChurnScore, type ChurnRisk } from "@/lib/churn-scoring";

export const dynamic = "force-dynamic";

const riskBadge: Record<ChurnRisk, { bg: string; text: string }> = {
  LOW: { bg: "bg-green-100", text: "text-green-700" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-700" },
  HIGH: { bg: "bg-red-100", text: "text-red-700" },
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      subscription: {
        select: { status: true, plan: true },
      },
    },
  });

  // Calculate churn scores for active subscribers
  const churnScores: Record<string, { risk: ChurnRisk; score: number }> = {};
  for (const user of users) {
    if (user.subscription?.status === "ACTIVE") {
      const cs = await calculateChurnScore(user.id);
      churnScores[user.id] = { risk: cs.risk, score: cs.score };
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">Users</h1>
      <div className="rounded-2xl shadow-neu bg-neu-bg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neu-dark/15">
              <th className="text-left px-5 py-4 font-medium text-neu-muted">Email</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">Name</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">Role</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">Subscription</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">Churn Risk</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                className={`border-b border-neu-dark/10 last:border-0 ${
                  i % 2 === 0 ? "" : "bg-white/20"
                }`}
              >
                <td className="px-5 py-3.5 text-neu-text">{user.email}</td>
                <td className="px-5 py-3.5 text-neu-muted">{user.name || "---"}</td>
                <td className="px-5 py-3.5">
                  <UserRoleManager userId={user.id} currentRole={user.role} />
                </td>
                <td className="px-5 py-3.5">
                  {user.subscription ? (
                    <span className={`neu-pill text-xs ${
                      user.subscription.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {user.subscription.status}
                    </span>
                  ) : (
                    <span className="text-neu-muted">---</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {churnScores[user.id] ? (
                    <span className={`neu-pill text-xs ${riskBadge[churnScores[user.id].risk].bg} ${riskBadge[churnScores[user.id].risk].text}`}>
                      {churnScores[user.id].risk} ({churnScores[user.id].score})
                    </span>
                  ) : (
                    <span className="text-neu-muted">---</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-neu-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
