import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const feedbackSchema = z.object({
  stepId: z.string().min(1),
  helpful: z.boolean(),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { stepId, helpful, comment } = parsed.data;

  await prisma.stepFeedback.upsert({
    where: { userId_stepId: { userId: session.user.id, stepId } },
    update: { helpful, comment },
    create: { userId: session.user.id, stepId, helpful, comment },
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stepId = req.nextUrl.searchParams.get("stepId");
  if (!stepId) {
    return NextResponse.json({ error: "stepId required" }, { status: 400 });
  }

  const feedback = await prisma.stepFeedback.findUnique({
    where: { userId_stepId: { userId: session.user.id, stepId } },
  });

  return NextResponse.json({ helpful: feedback?.helpful ?? null });
}
