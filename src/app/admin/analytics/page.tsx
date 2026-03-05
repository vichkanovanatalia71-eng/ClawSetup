import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  // Get all published steps
  const steps = await prisma.step.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      order: true,
      module: { select: { title: true, order: true } },
    },
  });

  const stepIds = steps.map((s) => s.id);

  // Get completion counts per step
  const completions = await prisma.userProgress.groupBy({
    by: ["stepId"],
    where: { stepId: { in: stepIds }, completed: true },
    _count: true,
  });
  const completionMap = Object.fromEntries(completions.map((c) => [c.stepId, c._count]));

  // Get AI ticket counts per step
  const aiCounts = await prisma.aITicket.groupBy({
    by: ["stepId"],
    where: { stepId: { in: stepIds } },
    _count: true,
  });
  const aiMap = Object.fromEntries(aiCounts.map((a) => [a.stepId, a._count]));

  // Get feedback per step
  const feedback = await prisma.stepFeedback.groupBy({
    by: ["stepId"],
    where: { stepId: { in: stepIds } },
    _count: true,
  });
  const helpfulFeedback = await prisma.stepFeedback.groupBy({
    by: ["stepId"],
    where: { stepId: { in: stepIds }, helpful: true },
    _count: true,
  });
  const feedbackMap = Object.fromEntries(feedback.map((f) => [f.stepId, f._count]));
  const helpfulMap = Object.fromEntries(helpfulFeedback.map((f) => [f.stepId, f._count]));

  // Get average time spent per step
  const timeEvents = await prisma.stepEvent.groupBy({
    by: ["stepId"],
    where: { stepId: { in: stepIds }, event: "TIME_SPENT" },
    _avg: { durationMs: true },
    _count: true,
  });
  const timeMap = Object.fromEntries(timeEvents.map((t) => [t.stepId, {
    avgMs: t._avg.durationMs || 0,
    count: t._count,
  }]));

  const totalUsers = await prisma.user.count();
  // NPS summary
  const npsResponses = await prisma.nPSResponse.findMany({
    select: { score: true },
  });
  const npsCount = npsResponses.length;
  const promoters = npsResponses.filter((r) => r.score >= 9).length;
  const detractors = npsResponses.filter((r) => r.score <= 6).length;
  const npsScore = npsCount > 0 ? Math.round(((promoters - detractors) / npsCount) * 100) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neu-text mb-6">Content Analytics</h1>

      {/* NPS Score */}
      {npsScore !== null && (
        <div className="rounded-2xl shadow-neu p-6 bg-neu-bg mb-6 flex items-center gap-6">
          <div>
            <p className="text-sm text-neu-muted">NPS Score</p>
            <p className={`text-4xl font-bold ${npsScore >= 50 ? "text-green-600" : npsScore >= 0 ? "text-amber-600" : "text-red-600"}`}>
              {npsScore}
            </p>
          </div>
          <div className="text-xs text-neu-muted space-y-1">
            <p>Promoters (9-10): {promoters}</p>
            <p>Passives (7-8): {npsCount - promoters - detractors}</p>
            <p>Detractors (0-6): {detractors}</p>
            <p>Total responses: {npsCount}</p>
          </div>
        </div>
      )}

      {/* Step Funnel */}
      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg mb-6">
        <h2 className="font-semibold text-neu-text mb-4">Step Completion Funnel</h2>
        <div className="space-y-2">
          {steps.map((step) => {
            const count = completionMap[step.id] || 0;
            const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            const aiCount = aiMap[step.id] || 0;
            const totalFb = feedbackMap[step.id] || 0;
            const helpFb = helpfulMap[step.id] || 0;
            const fbPct = totalFb > 0 ? Math.round((helpFb / totalFb) * 100) : null;
            const time = timeMap[step.id];
            const avgMin = time ? Math.round(time.avgMs / 60000) : null;

            return (
              <div key={step.id} className="flex items-center gap-3 text-sm">
                <div className="w-48 truncate text-neu-text text-xs" title={step.title}>
                  {step.module.title} &gt; {step.title}
                </div>
                <div className="flex-1 h-6 rounded-lg shadow-neu-inset-sm overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-brand-500 rounded-lg transition-all"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-neu-text">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-16 text-xs text-neu-muted text-center" title="AI requests">
                  AI: {aiCount}
                </div>
                <div className="w-16 text-xs text-neu-muted text-center" title="Helpful %">
                  {fbPct !== null ? `${fbPct}%` : "---"}
                </div>
                <div className="w-16 text-xs text-neu-muted text-center" title="Avg time">
                  {avgMin !== null ? `${avgMin}m` : "---"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-xs text-neu-muted mt-4 pt-3 border-t border-neu-dark/10">
          <div className="w-48">Step</div>
          <div className="flex-1 text-center">Completions</div>
          <div className="w-16 text-center">AI Reqs</div>
          <div className="w-16 text-center">Helpful</div>
          <div className="w-16 text-center">Avg Time</div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl shadow-neu p-6 bg-neu-bg">
        <h2 className="font-semibold text-neu-text mb-4">Insights</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {/* Highest drop-off */}
          {steps.length > 1 && (() => {
            let maxDrop = 0;
            let dropStep = steps[0];
            for (let i = 1; i < steps.length; i++) {
              const prev = completionMap[steps[i - 1].id] || 0;
              const curr = completionMap[steps[i].id] || 0;
              const drop = prev - curr;
              if (drop > maxDrop) {
                maxDrop = drop;
                dropStep = steps[i];
              }
            }
            return maxDrop > 0 ? (
              <div className="rounded-xl shadow-neu-xs p-4">
                <p className="text-amber-600 font-medium text-xs mb-1">Biggest Drop-off</p>
                <p className="text-neu-text">{dropStep.title}</p>
                <p className="text-neu-muted text-xs">{maxDrop} users dropped off at this step</p>
              </div>
            ) : null;
          })()}

          {/* Most AI-heavy step */}
          {(() => {
            const maxAI = Math.max(...Object.values(aiMap).map(Number), 0);
            const maxAIStep = steps.find((s) => (aiMap[s.id] || 0) === maxAI);
            return maxAI > 0 && maxAIStep ? (
              <div className="rounded-xl shadow-neu-xs p-4">
                <p className="text-blue-600 font-medium text-xs mb-1">Most AI Requests</p>
                <p className="text-neu-text">{maxAIStep.title}</p>
                <p className="text-neu-muted text-xs">{maxAI} AI requests (may need better instructions)</p>
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}
