import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stepId = req.nextUrl.searchParams.get("stepId");
  if (!stepId) {
    return NextResponse.json({ error: "stepId required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { userId_stepId: { userId: session.user.id, stepId } },
  });

  return NextResponse.json({ messages: conversation?.messages || [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId, messages } = await req.json();
  if (!stepId || !Array.isArray(messages)) {
    return NextResponse.json({ error: "stepId and messages required" }, { status: 400 });
  }

  // Cap at 50 messages
  const trimmed = messages.slice(-50);

  await prisma.conversation.upsert({
    where: { userId_stepId: { userId: session.user.id, stepId } },
    update: { messages: trimmed },
    create: { userId: session.user.id, stepId, messages: trimmed },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stepId = req.nextUrl.searchParams.get("stepId");
  if (!stepId) {
    return NextResponse.json({ error: "stepId required" }, { status: 400 });
  }

  await prisma.conversation.deleteMany({
    where: { userId: session.user.id, stepId },
  });

  return NextResponse.json({ ok: true });
}
