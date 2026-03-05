import { logger } from "./logger";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "ClawSetup <noreply@clawsetup.com>";

  if (!apiKey) {
    logger.warn("RESEND_API_KEY not set, skipping email", { to, subject });
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const error = await res.text();
      logger.error("Failed to send email", { to, subject, error });
      return false;
    }

    logger.info("Email sent", { to, subject });
    return true;
  } catch (error) {
    logger.error("Email send error", { to, subject, error: String(error) });
    return false;
  }
}
