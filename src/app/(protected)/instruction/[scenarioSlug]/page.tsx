import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScenarioPage({
  params,
}: {
  params: { scenarioSlug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const scenario = await prisma.scenario.findUnique({
    where: { slug: params.scenarioSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: { slug: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!scenario) redirect("/dashboard");

  // Find first step to redirect to
  const firstStep = scenario.modules[0]?.steps[0];
  if (firstStep) {
    redirect(`/instruction/${params.scenarioSlug}/${firstStep.slug}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{scenario.name}</h1>
      <p className="text-gray-500">No steps available yet for this scenario.</p>
    </div>
  );
}
