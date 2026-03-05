import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import StepEditor from "./StepEditor";

export const dynamic = "force-dynamic";

export default async function StepEditPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations("common");

  const step = await prisma.step.findUnique({
    where: { id: params.id },
    include: {
      module: {
        include: { scenario: true },
      },
      subSteps: { orderBy: { order: "asc" } },
      imagePrompts: { orderBy: { order: "asc" } },
      media: { where: { type: "video" }, take: 1 },
    },
  });

  if (!step) redirect("/admin/scenarios");

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          {step.module.scenario.name} / {step.module.title}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{t("edit")}: {step.title}</h1>
      </div>

      <StepEditor
        step={{
          id: step.id,
          title: step.title,
          titleUk: step.titleUk || "",
          slug: step.slug,
          goal: step.goal || "",
          goalUk: step.goalUk || "",
          prerequisites: step.prerequisites || "",
          prerequisitesUk: step.prerequisitesUk || "",
          contentMd: step.contentMd,
          contentMdUk: step.contentMdUk || "",
          expectedResult: step.expectedResult || "",
          expectedResultUk: step.expectedResultUk || "",
          commonErrors: step.commonErrors || "",
          commonErrorsUk: step.commonErrorsUk || "",
          status: step.status,
          tags: step.tags,
          videoUrl: step.media?.[0]?.url || "",
        }}
      />
    </div>
  );
}
