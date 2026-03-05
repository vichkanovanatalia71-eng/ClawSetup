import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET troubleshoot trees for a step (public API for logged-in users)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stepId = req.nextUrl.searchParams.get("stepId");
  if (!stepId) return NextResponse.json({ error: "Missing stepId" }, { status: 400 });

  const trees = await prisma.troubleshootTree.findMany({
    where: { stepId },
    include: {
      nodes: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json({ trees });
}
