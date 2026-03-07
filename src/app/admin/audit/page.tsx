import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { email: true, name: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">{t("auditLog")}</h1>
      <div className="rounded-2xl shadow-neu bg-neu-bg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-neu-dark/15">
              <th className="text-left px-5 py-4 font-medium text-neu-muted">{t("date")}</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">{t("actor")}</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">{t("action")}</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">{t("entity")}</th>
              <th className="text-left px-5 py-4 font-medium text-neu-muted">{t("ip")}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-neu-dark/10 last:border-0">
                <td className="px-5 py-3 text-neu-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-neu-text">
                  {log.actor?.email || tc("system")}
                </td>
                <td className="px-5 py-3">
                  <span className="neu-pill text-xs bg-blue-100 text-blue-700">{log.action}</span>
                </td>
                <td className="px-5 py-3 text-neu-muted">
                  {log.entity} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ""}
                </td>
                <td className="px-5 py-3 text-neu-muted text-xs font-mono">{log.ip || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12 text-neu-muted">{t("noAuditLogs")}</div>
        )}
      </div>
    </div>
  );
}
