import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Get user emails for tickets
  const userIds = Array.from(new Set(tickets.map((t) => t.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">{t("supportTickets")}</h1>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-2xl shadow-neu p-5 bg-neu-bg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-neu-text text-sm">{ticket.subject}</h3>
                <p className="text-xs text-neu-muted">
                  {userMap[ticket.userId] || tc("unknown")} - {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`neu-pill text-xs font-medium ${
                ticket.status === "OPEN" ? "bg-amber-100 text-amber-700" :
                ticket.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                "bg-green-100 text-green-700"
              }`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-sm text-neu-muted mb-3">{ticket.message}</p>
            {ticket.aiSnapshot && (
              <details className="text-xs text-neu-muted">
                <summary className="cursor-pointer hover:text-neu-text">{t("viewAiConversation")}</summary>
                <pre className="mt-2 p-3 rounded-xl shadow-neu-inset-sm text-xs overflow-x-auto max-h-48">
                  {JSON.stringify(ticket.aiSnapshot, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="text-center text-neu-muted py-8">{t("noTickets")}</p>
        )}
      </div>
    </div>
  );
}
