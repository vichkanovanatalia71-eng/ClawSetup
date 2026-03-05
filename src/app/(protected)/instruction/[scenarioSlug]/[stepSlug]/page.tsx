import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, localized } from "@/lib/localized-content";
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
    select: { title: true, titleUk: true, goal: true, goalUk: true },
  });

  const locale = await getLocale();
  const title = step ? localized(step, "title", locale) : "Step";
  const goal = step ? localized(step, "goal", locale) : "";

  return {
    title: `${title} — ClawSetup`,
    description: goal || "Interactive OpenClaw setup guide step",
  };
}

export default async function StepPage({
  params,
}: {
  params: { scenarioSlug: string; stepSlug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const locale = await getLocale();

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
              titleUk: true,
              goal: true,
              goalUk: true,
              prerequisites: true,
              prerequisitesUk: true,
              contentMd: true,
              contentMdUk: true,
              expectedResult: true,
              expectedResultUk: true,
              commonErrors: true,
              commonErrorsUk: true,
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
      currentStep = { ...found, moduleId: mod.id, moduleTitle: localized(mod, "title", locale) };
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
    title: localized(mod, "title", locale),
    order: mod.order,
    steps: mod.steps.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: localized(s, "title", locale),
      order: s.order,
      completed: progressMap[s.id] || false,
    })),
  }));

  const totalSteps = navModules.reduce((sum, m) => sum + m.steps.length, 0);
  const completedSteps = navModules.reduce(
    (sum, m) => sum + m.steps.filter((s) => s.completed).length,
    0
  );

  const stepTitle = localized(currentStep, "title", locale);
  const stepJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowToStep",
    name: stepTitle,
    text: localized(currentStep, "goal", locale) || localized(currentStep, "contentMd", locale).slice(0, 200),
    position: currentStep.order,
  };

  return (
    <>
    <JsonLd data={stepJsonLd} />
    <StepPageClient
      scenarioSlug={params.scenarioSlug}
      scenarioName={localized(scenario, "name", locale)}
      moduleTitle={currentStep.moduleTitle}
      step={{
        id: currentStep.id,
        moduleId: currentStep.moduleId,
        title: stepTitle,
        goal: localized(currentStep, "goal", locale) || null,
        prerequisites: localized(currentStep, "prerequisites", locale) || null,
        contentMd: localized(currentStep, "contentMd", locale),
        expectedResult: localized(currentStep, "expectedResult", locale) || null,
        commonErrors: localized(currentStep, "commonErrors", locale) || null,
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
