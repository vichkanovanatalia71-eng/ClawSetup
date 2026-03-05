import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const npsSchema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = npsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    await prisma.nPSResponse.create({
      data: {
        userId: session.user.id,
        score: parsed.data.score,
        comment: parsed.data.comment || null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has responded in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = await prisma.nPSResponse.findFirst({
      where: {
        userId: session.user.id,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    return NextResponse.json({ shouldShow: !recent });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
