import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TroubleshootAdminPage() {
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
        <h1 className="text-2xl font-bold text-neu-text">Troubleshooting Trees</h1>
      </div>

      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg mb-6">
        <h2 className="font-semibold text-neu-text mb-4">Existing Trees</h2>
        {trees.length === 0 ? (
          <p className="text-sm text-neu-muted">No troubleshooting trees yet.</p>
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
                    Step: {tree.step.title} | {tree._count.nodes} nodes
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg">
        <h2 className="font-semibold text-neu-text mb-4">Steps Available</h2>
        <p className="text-xs text-neu-muted mb-3">
          Use the API to create troubleshooting trees for these steps.
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
