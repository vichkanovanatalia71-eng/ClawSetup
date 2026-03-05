import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streaks";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    select: { stepId: true, completed: true, completedAt: true },
  });

  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId, completed } = await req.json();
  if (!stepId) {
    return NextResponse.json({ error: "stepId required" }, { status: 400 });
  }

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_stepId: { userId: session.user.id, stepId },
    },
    update: {
      completed: completed ?? true,
      completedAt: completed ? new Date() : null,
    },
    create: {
      userId: session.user.id,
      stepId,
      completed: completed ?? true,
      completedAt: completed ? new Date() : null,
    },
  });

  // Update streak on completion
  if (completed) {
    updateStreak(session.user.id).catch(() => {});
  }

  return NextResponse.json({ progress });
}
