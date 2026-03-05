import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function TroubleshootAdminPage() {
  const t = await getTranslations("admin");

  const trees = await prisma.troubleshootTree.findMany({
    include: {
      step: { select: { title: true } },
      _count: { select: { nodes: true } },
    },
    orderBy: { title: "asc" },
  });

  const steps = await prisma.step.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    select: { id: true, title: true, module: { select: { title: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neu-text">{t("troubleshootTrees")}</h1>
      </div>

      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg mb-6">
        <h2 className="font-semibold text-neu-text mb-4">{t("existingTrees")}</h2>
        {trees.length === 0 ? (
          <p className="text-sm text-neu-muted">{t("noTrees")}</p>
        ) : (
          <div className="space-y-2">
            {trees.map((tree) => (
              <div
                key={tree.id}
                className="flex items-center justify-between rounded-xl shadow-neu-xs p-4"
              >
                <div>
                  <p className="text-sm font-medium text-neu-text">{tree.title}</p>
                  <p className="text-xs text-neu-muted">
                    {t("step")}: {tree.step.title} | {tree._count.nodes} {t("nodes")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg">
        <h2 className="font-semibold text-neu-text mb-4">{t("stepsAvailable")}</h2>
        <p className="text-xs text-neu-muted mb-3">
          {t("stepsAvailableDesc")}
        </p>
        <div className="grid md:grid-cols-2 gap-2">
          {steps.map((step) => (
            <div key={step.id} className="rounded-xl shadow-neu-xs p-3 text-xs">
              <span className="text-neu-muted">{step.module.title} &gt; </span>
              <span className="text-neu-text font-medium">{step.title}</span>
              <span className="text-neu-muted ml-2">ID: {step.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
