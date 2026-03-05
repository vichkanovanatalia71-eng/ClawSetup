import { prisma } from "@/lib/prisma";

export async function updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  if (!user) return { currentStreak: 0, longestStreak: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  let newStreak = user.currentStreak;

  if (!lastActive) {
    // First activity ever
    newStreak = 1;
  } else if (lastActive.getTime() === today.getTime()) {
    // Already active today — no change
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
  } else if (today.getTime() - lastActive.getTime() === 24 * 60 * 60 * 1000) {
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
      lastActiveDate: today,
    },
  });

  return { currentStreak: newStreak, longestStreak: newLongest };
}
