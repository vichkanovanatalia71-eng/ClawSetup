import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StepPageClient from "./StepPageClient";
import JsonLd from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { scenarioSlug: string; stepSlug: string };
}): Promise<Metadata> {
  const step = await prisma.step.findFirst({
    where: {
      slug: params.stepSlug,
      module: { scenario: { slug: params.scenarioSlug } },
    },
    select: { title: true, goal: true },
  });

  return {
    title: step ? `${step.title} — ClawSetup` : "Step — ClawSetup",
    description: step?.goal || "Interactive OpenClaw setup guide step",
  };
}

export default async function StepPage({
  params,
}: {
  params: { scenarioSlug: string; stepSlug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const hasActiveSubscription =
    subscription?.status === "ACTIVE" || subscription?.status === "TRIALING";

  const scenario = await prisma.scenario.findUnique({
    where: { slug: params.scenarioSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              goal: true,
              prerequisites: true,
              contentMd: true,
              expectedResult: true,
              commonErrors: true,
              order: true,
              media: {
                where: { type: "video" },
                select: { url: true, alt: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!scenario) redirect("/dashboard");

  // Find current step
  let currentStep = null;
  for (const mod of scenario.modules) {
    const found = mod.steps.find((s) => s.slug === params.stepSlug);
    if (found) {
      currentStep = { ...found, moduleId: mod.id, moduleTitle: mod.title };
      break;
    }
  }

  if (!currentStep) redirect(`/instruction/${params.scenarioSlug}`);

  // Freemium: allow access to first module without subscription
  const firstModuleOrder = Math.min(...scenario.modules.map((m) => m.order));
  const stepModule = scenario.modules.find((m) => m.id === currentStep.moduleId);
  const isFirstModule = stepModule?.order === firstModuleOrder;

  if (!hasActiveSubscription && !isFirstModule) {
    redirect("/dashboard");
  }

  // Get user progress
  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    select: { stepId: true, completed: true },
  });

  const progressMap: Record<string, boolean> = {};
  progress.forEach((p) => {
    progressMap[p.stepId] = p.completed;
  });

  const navModules = scenario.modules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    order: mod.order,
    steps: mod.steps.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      order: s.order,
      completed: progressMap[s.id] || false,
    })),
  }));

  const totalSteps = navModules.reduce((sum, m) => sum + m.steps.length, 0);
  const completedSteps = navModules.reduce(
    (sum, m) => sum + m.steps.filter((s) => s.completed).length,
    0
  );

  const stepJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowToStep",
    name: currentStep.title,
    text: currentStep.goal || currentStep.contentMd.slice(0, 200),
    position: currentStep.order,
  };

  return (
    <>
    <JsonLd data={stepJsonLd} />
    <StepPageClient
      scenarioSlug={params.scenarioSlug}
      scenarioName={scenario.name}
      moduleTitle={currentStep.moduleTitle}
      step={{
        id: currentStep.id,
        moduleId: currentStep.moduleId,
        title: currentStep.title,
        goal: currentStep.goal,
        prerequisites: currentStep.prerequisites,
        contentMd: currentStep.contentMd,
        expectedResult: currentStep.expectedResult,
        commonErrors: currentStep.commonErrors,
        completed: progressMap[currentStep.id] || false,
        videoUrl: currentStep.media?.[0]?.url || null,
      }}
      navModules={navModules}
      totalSteps={totalSteps}
      completedSteps={completedSteps}
    />
    </>
  );
}
