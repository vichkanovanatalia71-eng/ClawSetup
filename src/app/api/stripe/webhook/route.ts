import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { subscriptionActivatedEmail, paymentFailedEmail, subscriptionCanceledEmail } from "@/lib/email-templates";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        // Validate user exists
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const isTrial = subscription.status === "trialing";
        const subStatus = isTrial ? "TRIALING" : "ACTIVE";

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            status: subStatus,
            plan: subscription.items.data[0]?.price.recurring?.interval === "year" ? "annual" : "monthly",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            status: subStatus,
            plan: subscription.items.data[0]?.price.recurring?.interval === "year" ? "annual" : "monthly",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        if (!isTrial && session.payment_intent) {
          const dbSub = await prisma.subscription.findUnique({ where: { userId } });
          if (dbSub) {
            await prisma.payment.create({
              data: {
                subscriptionId: dbSub.id,
                stripePaymentId: session.payment_intent as string,
                amount: session.amount_total || 0,
                currency: session.currency || "usd",
                status: "succeeded",
                invoiceUrl: null,
              },
            });
          }
        }

        // Send activation email
        if (existingUser.email) {
          const tmpl = subscriptionActivatedEmail();
          try {
            await sendEmail({ to: existingUser.email, ...tmpl });
          } catch (err) {
            logger.error("Failed to send activation email", { userId, error: String(err) });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const newStatus = sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "CANCELED";
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: newStatus,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            // Reset dunning counter when subscription becomes active again
            ...(newStatus === "ACTIVE" && { dunningEmailsSent: 0 }),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const canceledDbSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
          include: { user: { select: { email: true } } },
        });
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED" },
        });
        if (canceledDbSub?.user?.email) {
          const tmpl = subscriptionCanceledEmail();
          try {
            await sendEmail({ to: canceledDbSub.user.email, ...tmpl });
          } catch (err) {
            logger.error("Failed to send cancellation email", { error: String(err) });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const failedSub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
            include: { user: { select: { email: true } } },
          });
          if (failedSub) {
            await prisma.subscription.update({
              where: { id: failedSub.id },
              data: { status: "PAST_DUE" },
            });
            if (failedSub.user?.email) {
              const tmpl = paymentFailedEmail();
              try {
                await sendEmail({ to: failedSub.user.email, ...tmpl });
              } catch (err) {
                logger.error("Failed to send payment failed email", { error: String(err) });
              }
            }
          }
        }
        logger.warn("Invoice payment failed", { invoiceId: invoice.id });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const dbSub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
          });
          if (dbSub) {
            await prisma.payment.create({
              data: {
                subscriptionId: dbSub.id,
                stripePaymentId: invoice.payment_intent as string,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: "succeeded",
                invoiceUrl: invoice.hosted_invoice_url,
              },
            });
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
