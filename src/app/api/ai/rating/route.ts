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

    const { ticketId, rating } = await req.json();
    if (!ticketId || (rating !== 1 && rating !== -1)) {
      return NextResponse.json({ error: "ticketId and rating (1 or -1) required" }, { status: 400 });
    }

    await prisma.aITicket.updateMany({
      where: { id: ticketId, userId: session.user.id },
      data: { rating },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
