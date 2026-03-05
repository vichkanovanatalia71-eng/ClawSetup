import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StepEditor from "./StepEditor";

export const dynamic = "force-dynamic";

export default async function StepEditPage({
  params,
}: {
  params: { id: string };
}) {
  const step = await prisma.step.findUnique({
    where: { id: params.id },
    include: {
      module: {
        include: { scenario: true },
      },
      subSteps: { orderBy: { order: "asc" } },
      imagePrompts: { orderBy: { order: "asc" } },
    },
  });

  if (!step) redirect("/admin/scenarios");

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          {step.module.scenario.name} / {step.module.title}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Edit: {step.title}</h1>
      </div>

      <StepEditor
        step={{
          id: step.id,
          title: step.title,
          slug: step.slug,
          goal: step.goal || "",
          prerequisites: step.prerequisites || "",
          contentMd: step.contentMd,
          expectedResult: step.expectedResult || "",
          commonErrors: step.commonErrors || "",
          status: step.status,
          tags: step.tags,
        }}
      />
    </div>
  );
}
