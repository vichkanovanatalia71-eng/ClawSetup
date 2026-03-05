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

  const body = await req.json();
  const { moduleId, title, slug, goal, prerequisites, contentMd, expectedResult, commonErrors, tags, order } = body;

  const step = await prisma.step.create({
    data: {
      moduleId,
      title,
      slug,
      goal,
      prerequisites,
      contentMd: contentMd || "",
      expectedResult,
      commonErrors,
      tags: tags || [],
      order: order || 0,
    },
  });

  return NextResponse.json({ step }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, title, titleUk, slug, goal, goalUk, prerequisites, prerequisitesUk, contentMd, contentMdUk, expectedResult, expectedResultUk, commonErrors, commonErrorsUk, status, tags, videoUrl } = body;

  const step = await prisma.step.update({
    where: { id },
    data: {
      title,
      titleUk: titleUk || null,
      slug,
      goal: goal || null,
      goalUk: goalUk || null,
      prerequisites: prerequisites || null,
      prerequisitesUk: prerequisitesUk || null,
      contentMd,
      contentMdUk: contentMdUk || null,
      expectedResult: expectedResult || null,
      expectedResultUk: expectedResultUk || null,
      commonErrors: commonErrors || null,
      commonErrorsUk: commonErrorsUk || null,
      status: status || undefined,
      tags: tags || [],
      version: { increment: 1 },
    },
  });

  // Handle video URL
  if (videoUrl !== undefined) {
    await prisma.media.deleteMany({ where: { stepId: id, type: "video" } });
    if (videoUrl) {
      await prisma.media.create({ data: { stepId: id, type: "video", url: videoUrl } });
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPDATE",
      entity: "Step",
      entityId: id,
      after: body,
    },
  });

  return NextResponse.json({ step });
}
