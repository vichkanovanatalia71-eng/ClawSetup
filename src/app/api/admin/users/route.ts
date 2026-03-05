import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "EDITOR", "ADMIN", "SUPERADMIN"]).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { userId, role } = parsed.data;

  // Prevent changing own role
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot change own role" }, { status: 400 });
  }

  // Verify target user exists and check their current role
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only SUPERADMIN can modify SUPERADMIN users or assign SUPERADMIN role
  if (
    (targetUser.role === "SUPERADMIN" || role === "SUPERADMIN") &&
    session.user.role !== "SUPERADMIN"
  ) {
    return NextResponse.json({ error: "Only SUPERADMIN can modify SUPERADMIN users" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { ...(role && { role }) },
    select: { id: true, email: true, role: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPDATE_USER_ROLE",
      entity: "User",
      entityId: userId,
      after: { role },
    },
  });

  return NextResponse.json(updated);
}
