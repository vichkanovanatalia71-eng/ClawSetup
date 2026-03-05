import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stepId, event, durationMs } = await req.json();
    if (!stepId || !event) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const validEvents = ["VIEWED", "TIME_SPENT", "AI_ASKED"];
    if (!validEvents.includes(event)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    await prisma.stepEvent.create({
      data: {
        userId: session.user.id,
        stepId,
        event,
        durationMs: durationMs || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
