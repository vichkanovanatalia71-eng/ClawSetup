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
            select: { id: true },
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

  const hasActiveSubscription =
    subscription?.status === "ACTIVE" || subscription?.status === "TRIALING";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Welcome back, {session.user.name || session.user.email}!
      </p>

      {!hasActiveSubscription && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-amber-900 mb-2">
            Subscription Required
          </h2>
          <p className="text-amber-800 text-sm mb-4">
            You need an active subscription to access the setup guide.
          </p>
          <SubscribeButton />
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-4">
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

          const firstStep = scenario.modules[0]?.steps[0];

          return (
            <div
              key={scenario.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {scenario.name}
              </h3>
              {scenario.description && (
                <p className="text-gray-500 text-sm mb-4">
                  {scenario.description}
                </p>
              )}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">
                    {completedSteps}/{totalSteps} steps
                  </span>
                  <span className="text-gray-500">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              {hasActiveSubscription ? (
                <Link
                  href={`/instruction/${scenario.slug}`}
                  className="inline-block bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
                >
                  {completedSteps > 0 ? "Continue" : "Start"}
                </Link>
              ) : (
                <span className="text-gray-400 text-sm">
                  Subscribe to access
                </span>
              )}
            </div>
          );
        })}

        {scenarios.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <p>No scenarios available yet. Content is being prepared.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SubscribeButton() {
  return (
    <form
      action={async () => {
        "use server";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
      >
        Subscribe Now — $29/month
      </button>
    </form>
  );
}
