import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Stripe key check
  checks.stripe = process.env.STRIPE_SECRET_KEY ? "configured" : "missing";

  // Anthropic key check
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? "configured" : "missing";

  const healthy = checks.database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
