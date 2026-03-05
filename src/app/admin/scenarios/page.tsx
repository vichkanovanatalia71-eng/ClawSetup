import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import ScenarioActions from "./ScenarioActions";

export const dynamic = "force-dynamic";

export default async function ScenariosPage() {
  const t = await getTranslations("admin");

  const scenarios = await prisma.scenario.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, titleUk: true, status: true, order: true, slug: true },
          },
        },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neu-text">{t("scenariosAndContent")}</h1>
        <ScenarioActions />
      </div>

      {scenarios.map((scenario) => (
        <div key={scenario.id} className="rounded-2xl shadow-neu p-6 mb-6 bg-neu-bg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neu-text">{scenario.name}</h2>
              {scenario.nameUk && (
                <p className="text-sm text-brand-600">{scenario.nameUk}</p>
              )}
              <p className="text-sm text-neu-muted">{t("slug")}: {scenario.slug}</p>
              {scenario.description && (
                <p className="text-sm text-neu-muted mt-1">{scenario.description}</p>
              )}
              {scenario.descriptionUk && (
                <p className="text-sm text-neu-muted mt-0.5 italic">{scenario.descriptionUk}</p>
              )}
            </div>
          </div>

          {scenario.modules.map((mod) => (
            <div key={mod.id} className="ml-4 mb-4">
              <h3 className="font-medium text-neu-text text-sm mb-2 px-3 py-1.5 rounded-lg shadow-neu-flat inline-block">
                {mod.title}
                {mod.titleUk && <span className="text-brand-600 ml-2">/ {mod.titleUk}</span>}
              </h3>
              <div className="space-y-1 ml-4 mt-2">
                {mod.steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:shadow-neu-xs transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neu-muted w-6 text-center">#{step.order}</span>
                      <Link
                        href={`/admin/steps/${step.id}`}
                        className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                      >
                        {step.title}
                        {step.titleUk && <span className="text-neu-muted font-normal ml-2">/ {step.titleUk}</span>}
                      </Link>
                    </div>
                    <span
                      className={`neu-pill text-xs ${
                        step.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-500"
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
        <div className="text-center py-12 text-neu-muted">
          <p>{t("noScenarios")}</p>
        </div>
      )}
    </div>
  );
}
