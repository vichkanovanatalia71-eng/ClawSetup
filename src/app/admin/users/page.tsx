import { prisma } from "@/lib/prisma";
import UserRoleManager from "./UserRoleManager";

export const dynamic = "force-dynamic";

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
