import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role)) {
    return null;
  }
  return session;
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { scenarioId, title, order } = await req.json();

  const newModule = await prisma.module.create({
    data: { scenarioId, title, order: order || 0 },
  });

  return NextResponse.json({ module: newModule }, { status: 201 });
}
