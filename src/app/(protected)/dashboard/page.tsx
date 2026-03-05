import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
            select: { id: true, slug: true, title: true },
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
      <h1 className="text-3xl font-bold text-neu-text mb-2">Dashboard</h1>
      <p className="text-neu-muted mb-8">
        Welcome back, {session.user.name || session.user.email}!
      </p>

      {isTrialing && (
        <div className="rounded-2xl shadow-neu-sm p-6 mb-6 border-l-4 border-blue-400 bg-neu-bg">
          <h2 className="font-semibold text-neu-text mb-1">Free Trial Active</h2>
          <p className="text-neu-muted text-sm">
            {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining in your trial.
            Your card will be charged after the trial ends.
          </p>
        </div>
      )}

      {isPastDueWithGrace && (
        <div className="rounded-2xl shadow-neu-sm p-6 mb-6 border-l-4 border-red-400 bg-neu-bg">
          <h2 className="font-semibold text-red-600 mb-1">Payment Failed</h2>
          <p className="text-neu-muted text-sm mb-3">
            Your last payment failed. Please update your payment method within 3 days to keep access.
          </p>
          <SubscribeButton label="Update Payment" />
        </div>
      )}

      {!hasActiveSubscription && (
        <div className="rounded-2xl shadow-neu-sm p-6 mb-8 border-l-4 border-amber-400 bg-neu-bg">
          <h2 className="font-semibold text-neu-text mb-2">
            Subscription Required
          </h2>
          <p className="text-neu-muted text-sm mb-4">
            You need an active subscription to access the setup guide.
          </p>
          <PlanSelector />
        </div>
      )}

      <h2 className="text-xl font-semibold text-neu-text mb-4">
        Choose Your Setup Scenario
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
                nextStep = { slug: s.slug, title: s.title };
                break;
              }
            }
            if (nextStep) break;
          }
          // If all complete, link to the first step
          if (!nextStep && scenario.modules[0]?.steps[0]) {
            const first = scenario.modules[0].steps[0];
            nextStep = { slug: first.slug, title: first.title };
          }

          return (
            <div
              key={scenario.id}
              className="rounded-2xl shadow-neu p-6 bg-neu-bg hover:shadow-neu-sm transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-neu-text mb-2">
                {scenario.name}
              </h3>
              {scenario.description && (
                <p className="text-neu-muted text-sm mb-4">
                  {scenario.description}
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
                    {completedSteps > 0 ? "Continue" : "Start"}
                  </Link>
                  {completedSteps > 0 && nextStep && percentage < 100 && (
                    <p className="text-xs text-neu-muted mt-2">
                      Resume: {nextStep.title}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-neu-muted text-sm">
                  Subscribe to access
                </span>
              )}
            </div>
          );
        })}

        {scenarios.length === 0 && (
          <div className="col-span-2 text-center py-12 text-neu-muted">
            <p>No scenarios available yet. Content is being prepared.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SubscribeButton({ label, plan = "monthly" }: { label?: string; plan?: "monthly" | "annual" }) {
  return (
    <form
      action={async () => {
        "use server";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
          }
        );
        const data = await res.json();
        if (data.url) {
          redirect(data.url);
        }
      }}
    >
      <button
        type="submit"
        className="neu-btn-primary rounded-full px-6 py-2.5 text-sm"
      >
        {label || (plan === "annual" ? "Subscribe — $278/year (save 20%)" : "Subscribe — $29/month")}
      </button>
    </form>
  );
}

function PlanSelector() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SubscribeButton plan="monthly" />
      <SubscribeButton plan="annual" />
    </div>
  );
}
