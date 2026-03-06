import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const grantSchema = z.object({
  email: z.string().email(),
  plan: z.enum(["monthly", "annual"]).default("annual"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = grantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, plan } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const farFuture = new Date("2099-12-31T23:59:59Z");

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: "ACTIVE",
      plan,
      currentPeriodStart: new Date(),
      currentPeriodEnd: farFuture,
    },
    update: {
      status: "ACTIVE",
      plan,
      currentPeriodEnd: farFuture,
      cancelAtPeriodEnd: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "GRANT_SUBSCRIPTION",
      entity: "Subscription",
      entityId: subscription.id,
      after: { email, plan, grantedBy: session.user.email },
    },
  });

  return NextResponse.json({
    ok: true,
    subscription: {
      id: subscription.id,
      userId: user.id,
      email,
      status: subscription.status,
      plan: subscription.plan,
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
  });
}
