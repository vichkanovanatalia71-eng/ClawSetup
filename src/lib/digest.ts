import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function generateWeeklyDigests(): Promise<number> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      subscription: { status: "ACTIVE" },
    },
    select: {
      id: true,
      email: true,
      name: true,
      currentStreak: true,
      emailPreferences: true,
      progress: {
        where: { completed: true, completedAt: { gte: oneWeekAgo } },
        select: { stepId: true },
      },
    },
  });

  let sent = 0;

  for (const user of users) {
    // Check email preferences
    const prefs = user.emailPreferences as { weeklyDigest?: boolean } | null;
    if (prefs && prefs.weeklyDigest === false) continue;

    const stepsThisWeek = user.progress.length;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clawsetup.com";

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="background: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h1 style="font-size: 24px; margin-bottom: 16px;">Your Weekly Progress</h1>
            <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
              Hi ${user.name || "there"},
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
              This week you completed <strong>${stepsThisWeek}</strong> step${stepsThisWeek !== 1 ? "s" : ""}.
              ${user.currentStreak > 1 ? `You're on a ${user.currentStreak}-day streak!` : ""}
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}/dashboard" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-weight: 600; font-size: 14px;">
                Continue Your Guide
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const success = await sendEmail({
      to: user.email,
      subject: `Your weekly progress: ${stepsThisWeek} step${stepsThisWeek !== 1 ? "s" : ""} completed`,
      html,
    });

    if (success) sent++;
  }

  return sent;
}
