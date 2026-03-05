import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scenarioId } = await req.json();
    if (!scenarioId) {
      return NextResponse.json({ error: "scenarioId required" }, { status: 400 });
    }

    // Check if all steps are completed
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
      include: {
        modules: {
          include: {
            steps: {
              where: { status: "PUBLISHED" },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    const allStepIds = scenario.modules.flatMap((m) => m.steps.map((s) => s.id));
    if (allStepIds.length === 0) {
      return NextResponse.json({ error: "No steps in scenario" }, { status: 400 });
    }

    const completedCount = await prisma.userProgress.count({
      where: {
        userId: session.user.id,
        stepId: { in: allStepIds },
        completed: true,
      },
    });

    if (completedCount < allStepIds.length) {
      return NextResponse.json({
        error: `Complete all steps first (${completedCount}/${allStepIds.length})`,
      }, { status: 400 });
    }

    // Check for existing certificate
    const existing = await prisma.certificate.findUnique({
      where: { userId_scenarioId: { userId: session.user.id, scenarioId } },
    });

    if (existing) {
      return NextResponse.json({ certificate: existing });
    }

    const hash = crypto
      .createHash("sha256")
      .update(`${session.user.id}-${scenarioId}-${Date.now()}`)
      .digest("hex")
      .slice(0, 16);

    const certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        scenarioId,
        certificateHash: hash,
      },
    });

    return NextResponse.json({ certificate }, { status: 201 });
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

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: "desc" },
    });

    // Get scenario names
    const scenarioIds = certificates.map((c) => c.scenarioId);
    const scenarios = await prisma.scenario.findMany({
      where: { id: { in: scenarioIds } },
      select: { id: true, name: true },
    });
    const scenarioMap = Object.fromEntries(scenarios.map((s) => [s.id, s.name]));

    return NextResponse.json({
      certificates: certificates.map((c) => ({
        ...c,
        scenarioName: scenarioMap[c.scenarioId] || "Unknown",
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
