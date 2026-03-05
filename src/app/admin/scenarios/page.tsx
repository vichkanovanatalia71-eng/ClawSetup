import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ScenarioActions from "./ScenarioActions";

export const dynamic = "force-dynamic";

export default async function ScenariosPage() {
  const scenarios = await prisma.scenario.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, status: true, order: true, slug: true },
          },
        },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scenarios & Content</h1>
        <ScenarioActions />
      </div>

      {scenarios.map((scenario) => (
        <div key={scenario.id} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{scenario.name}</h2>
              <p className="text-sm text-gray-500">Slug: {scenario.slug}</p>
              {scenario.description && (
                <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
              )}
            </div>
          </div>

          {scenario.modules.map((mod) => (
            <div key={mod.id} className="ml-4 mb-4">
              <h3 className="font-medium text-gray-800 text-sm mb-2">
                {mod.title}
              </h3>
              <div className="space-y-1 ml-4">
                {mod.steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between py-1.5 px-3 rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">#{step.order}</span>
                      <Link
                        href={`/admin/steps/${step.id}`}
                        className="text-sm text-brand-600 hover:text-brand-700"
                      >
                        {step.title}
                      </Link>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        step.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {scenarios.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No scenarios yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
