import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let plan = "monthly";
    try {
      const body = await req.json();
      if (body.plan === "annual") plan = "annual";
    } catch {
      // No body or invalid JSON — default to monthly
    }

    const priceId =
      plan === "annual"
        ? process.env.STRIPE_PRICE_ID_ANNUAL
        : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured" },
        { status: 500 }
      );
    }

    const checkoutSession = await createCheckoutSession(
      session.user.id,
      session.user.email,
      priceId
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
