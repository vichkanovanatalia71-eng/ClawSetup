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

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const scenarios = await prisma.scenario.findMany({
    orderBy: { order: "asc" },
    include: { modules: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ scenarios });
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, slug, description } = await req.json();

  const scenario = await prisma.scenario.create({
    data: { name, slug, description },
  });

  return NextResponse.json({ scenario }, { status: 201 });
}
