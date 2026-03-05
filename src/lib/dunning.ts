import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  dunningReminderEmail,
  dunningFinalWarningEmail,
} from "@/lib/email-templates";

export async function checkDunningEmails(): Promise<number> {
  const pastDueSubscriptions = await prisma.subscription.findMany({
    where: { status: "PAST_DUE" },
    include: { user: true },
  });

  let emailsSent = 0;

  for (const subscription of pastDueSubscriptions) {
    const daysSinceUpdate =
      (Date.now() - new Date(subscription.updatedAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSinceUpdate >= 7 && subscription.dunningEmailsSent < 3) {
      const { subject, html } = dunningFinalWarningEmail();
      await sendEmail({ to: subscription.user.email, subject, html });
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { dunningEmailsSent: 3 },
      });
      emailsSent++;
    } else if (daysSinceUpdate >= 3 && subscription.dunningEmailsSent < 2) {
      const { subject, html } = dunningReminderEmail(3);
      await sendEmail({ to: subscription.user.email, subject, html });
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { dunningEmailsSent: 2 },
      });
      emailsSent++;
    } else if (daysSinceUpdate >= 1 && subscription.dunningEmailsSent < 1) {
      const { subject, html } = dunningReminderEmail(1);
      await sendEmail({ to: subscription.user.email, subject, html });
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { dunningEmailsSent: 1 },
      });
      emailsSent++;
    }
  }

  return emailsSent;
}
