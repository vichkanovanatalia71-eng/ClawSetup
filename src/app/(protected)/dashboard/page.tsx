import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, localized } from "@/lib/localized-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const scenarios = await prisma.scenario.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: { id: true, slug: true, title: true, titleUk: true },
          },
        },
      },
    },
  });

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { stepId: true },
  });

  const completedIds = new Set(progress.map((p) => p.stepId));

  // Grace period: PAST_DUE users get 3 days of access
  const isPastDueWithGrace =
    subscription?.status === "PAST_DUE" &&
    subscription.updatedAt &&
    Date.now() - new Date(subscription.updatedAt).getTime() < 3 * 24 * 60 * 60 * 1000;

  const hasActiveSubscription =
    subscription?.status === "ACTIVE" ||
    subscription?.status === "TRIALING" ||
    isPastDueWithGrace;

  const isTrialing = subscription?.status === "TRIALING";
  const trialDaysLeft = isTrialing && subscription?.currentPeriodEnd
    ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neu-text mb-2">{t("title")}</h1>
      <p className="text-neu-muted mb-8">
        {t("welcome")}, {session.user.name || session.user.email}!
      </p>

      {isTrialing && (
        <div className="rounded-2xl shadow-neu-sm p-6 mb-6 border-l-4 border-blue-400 bg-neu-bg">
          <h2 className="font-semibold text-neu-text mb-1">{t("freeTrialActive")}</h2>
          <p className="text-neu-muted text-sm">
            {t("trialDaysRemaining", { count: trialDaysLeft })}
          </p>
        </div>
      )}

      {isPastDueWithGrace && (
        <div className="rounded-2xl shadow-neu-sm p-6 mb-6 border-l-4 border-red-400 bg-neu-bg">
          <h2 className="font-semibold text-red-600 mb-1">{t("paymentFailed")}</h2>
          <p className="text-neu-muted text-sm mb-3">
            {t("paymentFailedDesc")}
          </p>
          <SubscribeButton label={t("updatePayment")} />
        </div>
      )}

      {!hasActiveSubscription && (
        <div className="rounded-2xl shadow-neu-sm p-6 mb-8 border-l-4 border-amber-400 bg-neu-bg">
          <h2 className="font-semibold text-neu-text mb-2">
            {t("subscriptionRequired")}
          </h2>
          <p className="text-neu-muted text-sm mb-4">
            {t("subscriptionRequiredDesc")}
          </p>
          <PlanSelector monthlyLabel={t("subscribeMonthly")} annualLabel={t("subscribeAnnual")} />
        </div>
      )}

      <h2 className="text-xl font-semibold text-neu-text mb-4">
        {t("chooseScenario")}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => {
          const totalSteps = scenario.modules.reduce(
            (sum, m) => sum + m.steps.length,
            0
          );
          const completedSteps = scenario.modules.reduce(
            (sum, m) =>
              sum + m.steps.filter((s) => completedIds.has(s.id)).length,
            0
          );
          const percentage =
            totalSteps > 0
              ? Math.round((completedSteps / totalSteps) * 100)
              : 0;

          // Find first incomplete step for "Continue where left off"
          let nextStep: { slug: string; title: string } | null = null;
          for (const mod of scenario.modules) {
            for (const s of mod.steps) {
              if (!completedIds.has(s.id)) {
                nextStep = { slug: s.slug, title: localized(s, "title", locale) };
                break;
              }
            }
            if (nextStep) break;
          }
          // If all complete, link to the first step
          if (!nextStep && scenario.modules[0]?.steps[0]) {
            const first = scenario.modules[0].steps[0];
            nextStep = { slug: first.slug, title: localized(first, "title", locale) };
          }

          return (
            <div
              key={scenario.id}
              className="rounded-2xl shadow-neu p-6 bg-neu-bg hover:shadow-neu-sm transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-neu-text mb-2">
                {localized(scenario, "name", locale)}
              </h3>
              {(scenario.description || scenario.descriptionUk) && (
                <p className="text-neu-muted text-sm mb-4">
                  {localized(scenario, "description", locale)}
                </p>
              )}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neu-muted">
                    {completedSteps}/{totalSteps} steps
                  </span>
                  <span className="text-neu-muted">{percentage}%</span>
                </div>
                <div className="neu-progress-track">
                  <div
                    className="neu-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              {hasActiveSubscription ? (
                <div>
                  <Link
                    href={nextStep ? `/instruction/${scenario.slug}/${nextStep.slug}` : `/instruction/${scenario.slug}`}
                    className="inline-block neu-btn-primary rounded-full px-6 py-2.5 text-sm"
                  >
                    {completedSteps > 0 ? t("continue") : t("start")}
                  </Link>
                  {completedSteps > 0 && nextStep && percentage < 100 && (
                    <p className="text-xs text-neu-muted mt-2">
                      {tc("resume")}: {nextStep.title}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-neu-muted text-sm">
                  {t("subscribeToAccess")}
                </span>
              )}
            </div>
          );
        })}

        {scenarios.length === 0 && (
          <div className="col-span-2 text-center py-12 text-neu-muted">
            <p>{t("noScenarios")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SubscribeButton({ label, plan = "monthly" }: { label: string; plan?: "monthly" | "annual" }) {
  return (
    <form
      action={async () => {
        "use server";
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/auth");
        const { createCheckoutSession } = await import("@/lib/stripe");

        const sess = await getServerSession(authOptions);
        if (!sess?.user?.id || !sess.user.email) {
          redirect("/login");
        }

        const priceId =
          plan === "annual"
            ? process.env.STRIPE_PRICE_ID_ANNUAL
            : process.env.STRIPE_PRICE_ID_MONTHLY;

        if (!priceId) {
          throw new Error("Stripe price not configured");
        }

        const checkoutSession = await createCheckoutSession(
          sess.user.id,
          sess.user.email,
          priceId
        );

        if (checkoutSession.url) {
          redirect(checkoutSession.url);
        }
      }}
    >
      <button
        type="submit"
        className="neu-btn-primary rounded-full px-6 py-2.5 text-sm"
      >
        {label}
      </button>
    </form>
  );
}

function PlanSelector({ monthlyLabel, annualLabel }: { monthlyLabel: string; annualLabel: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SubscribeButton plan="monthly" label={monthlyLabel} />
      <SubscribeButton plan="annual" label={annualLabel} />
    </div>
  );
}
