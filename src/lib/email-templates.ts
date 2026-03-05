const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #2d3436;
`;

const buttonStyle = `
  display: inline-block;
  background: #2563eb;
  color: #ffffff;
  text-decoration: none;
  padding: 12px 32px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 14px;
`;

const footerStyle = `
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e5ec;
  font-size: 12px;
  color: #636e72;
`;

function layout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="background: #f5f5f5; margin: 0; padding: 20px;">
      <div style="${baseStyle}">
        <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          ${content}
        </div>
        <div style="${footerStyle}">
          <p>&copy; ${new Date().getFullYear()} ClawSetup. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function welcomeEmail(name?: string): { subject: string; html: string } {
  return {
    subject: "Welcome to ClawSetup!",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to ClawSetup${name ? `, ${name}` : ""}!</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        Thank you for creating an account. You're just a few steps away from setting up your OpenClaw AI agent.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        Subscribe to get full access to the interactive guide with AI assistance on every step.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
      </div>
    `),
  };
}

export function emailVerificationEmail(token: string): { subject: string; html: string } {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
  return {
    subject: "Verify your email — ClawSetup",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px;">Verify Your Email</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        Please click the button below to verify your email address. This link expires in 24 hours.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="${buttonStyle}">Verify Email</a>
      </div>
      <p style="font-size: 12px; color: #636e72;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    `),
  };
}

export function passwordResetEmail(token: string): { subject: string; html: string } {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  return {
    subject: "Reset your password — ClawSetup",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px;">Reset Your Password</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        We received a request to reset your password. Click the button below to set a new one.
        This link expires in 1 hour.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="${buttonStyle}">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #636e72;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    `),
  };
}

export function subscriptionActivatedEmail(): { subject: string; html: string } {
  return {
    subject: "Subscription activated — ClawSetup",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px;">Subscription Activated!</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        Your subscription is now active. You have full access to the interactive OpenClaw setup guide
        with AI assistance on every step.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${buttonStyle}">Start Setup Guide</a>
      </div>
    `),
  };
}

export function paymentFailedEmail(): { subject: string; html: string } {
  return {
    subject: "Payment failed — ClawSetup",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px;">Payment Failed</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        We were unable to process your latest payment. Please update your payment method to
        continue accessing the guide.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="${buttonStyle}">Update Payment</a>
      </div>
      <p style="font-size: 12px; color: #636e72;">
        You have a 3-day grace period before your access is suspended.
      </p>
    `),
  };
}

export function subscriptionCanceledEmail(): { subject: string; html: string } {
  return {
    subject: "Subscription canceled — ClawSetup",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px;">Subscription Canceled</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        Your subscription has been canceled. You'll continue to have access until the end
        of your current billing period.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        We'd love to have you back! You can resubscribe anytime from your dashboard.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
      </div>
    `),
  };
}

export function dunningReminderEmail(dayNumber: number): { subject: string; html: string } {
  const isDay1 = dayNumber === 1;
  return {
    subject: isDay1
      ? "Action required: Update your payment method — ClawSetup"
      : "Reminder: Your payment is still overdue — ClawSetup",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px;">${
        isDay1 ? "Payment Update Needed" : "Payment Still Overdue"
      }</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        ${
          isDay1
            ? "We were unable to process your latest payment. Please update your payment method to keep your access to the setup guide."
            : "This is a reminder that your payment is still overdue. Please update your payment method as soon as possible to avoid losing access to the setup guide."
        }
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="${buttonStyle}">Update Payment</a>
      </div>
      <p style="font-size: 12px; color: #636e72;">
        If you've already updated your payment method, please disregard this email.
      </p>
    `),
  };
}

export function dunningFinalWarningEmail(): { subject: string; html: string } {
  return {
    subject: "Final warning: Your account will be suspended — ClawSetup",
    html: layout(`
      <h1 style="font-size: 24px; margin-bottom: 16px; color: #d63031;">Final Warning: Account Suspension</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72;">
        Your payment has been overdue for 7 days. If you do not update your payment method immediately,
        your account access will be suspended.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #636e72; font-weight: 600;">
        This is your final notice. Please take action now to avoid interruption of service.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="${buttonStyle}">Update Payment Now</a>
      </div>
    `),
  };
}
