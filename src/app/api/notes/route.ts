import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const noteSchema = z.object({
  stepId: z.string().min(1),
  content: z.string().max(10000),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stepId = req.nextUrl.searchParams.get("stepId");
  if (!stepId) {
    return NextResponse.json({ error: "stepId required" }, { status: 400 });
  }

  const note = await prisma.userNote.findUnique({
    where: { userId_stepId: { userId: session.user.id, stepId } },
  });

  return NextResponse.json({ content: note?.content || "" });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { stepId, content } = parsed.data;

  await prisma.userNote.upsert({
    where: { userId_stepId: { userId: session.user.id, stepId } },
    update: { content },
    create: { userId: session.user.id, stepId, content },
  });

  return NextResponse.json({ success: true });
}
