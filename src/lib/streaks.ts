import { prisma } from "@/lib/prisma";

export async function updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  if (!user) return { currentStreak: 0, longestStreak: 0 };

  // Use ISO date strings to avoid DST issues
  const todayStr = new Date().toISOString().slice(0, 10);
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  const lastStr = lastActive?.toISOString().slice(0, 10) ?? null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newStreak = user.currentStreak;

  if (!lastStr) {
    // First activity ever
    newStreak = 1;
  } else if (lastStr === todayStr) {
    // Already active today — no change
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
  } else if (lastStr === yesterdayStr) {
    // Active yesterday — increment streak
    newStreak = user.currentStreak + 1;
  } else {
    // Gap — reset streak
    newStreak = 1;
  }

  const newLongest = Math.max(user.longestStreak, newStreak);

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: new Date(),
    },
  });

  return { currentStreak: newStreak, longestStreak: newLongest };
}
