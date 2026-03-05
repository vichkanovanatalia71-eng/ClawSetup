import { prisma } from "@/lib/prisma";

export type ChurnRisk = "LOW" | "MEDIUM" | "HIGH";

export interface ChurnScore {
  score: number;
  risk: ChurnRisk;
  factors: string[];
}

export async function calculateChurnScore(userId: string): Promise<ChurnScore> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Single query to reduce N+1
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastLoginAt: true,
      createdAt: true,
      subscription: { select: { status: true, updatedAt: true } },
      progress: {
        where: { completed: true },
        select: { completedAt: true },
      },
      aiTickets: {
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { id: true },
      },
    },
  });

  if (!user) return { score: 100, risk: "HIGH", factors: ["User not found"] };

  let score = 0;
  const factors: string[] = [];

  // Factor 1: Days since last login (0-25 points)
  const daysSinceLogin = user.lastLoginAt
    ? Math.floor((Date.now() - new Date(user.lastLoginAt).getTime()) / (24 * 60 * 60 * 1000))
    : 999;
  if (daysSinceLogin > 30) {
    score += 25;
    factors.push(`No login in ${daysSinceLogin} days`);
  } else if (daysSinceLogin > 14) {
    score += 18;
    factors.push(`Last login ${daysSinceLogin} days ago`);
  } else if (daysSinceLogin > 7) {
    score += 10;
    factors.push(`Last login ${daysSinceLogin} days ago`);
  }

  // Factor 2: Progress stall (0-25 points)
  const recentProgress = user.progress.filter(
    (p) => p.completedAt && p.completedAt >= sevenDaysAgo
  ).length;
  if (recentProgress === 0) {
    if (user.progress.length > 0) {
      score += 25;
      factors.push("No progress in 7+ days");
    } else {
      score += 15;
      factors.push("Never completed a step");
    }
  }

  // Factor 3: Declining AI usage (0-25 points)
  if (user.aiTickets.length === 0) {
    score += 25;
    factors.push("No AI usage in 14 days");
  } else if (user.aiTickets.length < 3) {
    score += 10;
    factors.push(`Only ${user.aiTickets.length} AI usage in 14 days`);
  }

  // Factor 4: NPS score (0-25 points)
  const nps = await prisma.nPSResponse.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { score: true },
  });
  if (nps && nps.score <= 6) {
    score += 25;
    factors.push(`Low NPS score: ${nps.score}`);
  } else if (nps && nps.score <= 8) {
    score += 10;
    factors.push(`Passive NPS score: ${nps.score}`);
  }

  const risk: ChurnRisk = score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";

  return { score: Math.min(score, 100), risk, factors };
}
