import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
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

const scenarioSchema = z.object({
  name: z.string().min(1).max(200),
  nameUk: z.string().max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().max(1000).optional(),
  descriptionUk: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = scenarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const scenario = await prisma.scenario.create({
    data: parsed.data,
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATE",
      entity: "Scenario",
      entityId: scenario.id,
      details: `Created scenario: ${scenario.name}`,
    },
  });

  return NextResponse.json({ scenario }, { status: 201 });
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  nameUk: z.string().max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  descriptionUk: z.string().max(1000).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { id, ...data } = parsed.data;
  const scenario = await prisma.scenario.update({
    where: { id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPDATE",
      entity: "Scenario",
      entityId: id,
      details: `Updated scenario: ${scenario.name}`,
    },
  });

  return NextResponse.json({ scenario });
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Only SUPERADMIN can delete scenarios" }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const scenario = await prisma.scenario.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "DELETE",
      entity: "Scenario",
      entityId: id,
      details: `Deleted scenario: ${scenario.name}`,
    },
  });

  return NextResponse.json({ success: true });
}
