import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIResponse } from "@/lib/ai";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    // Rate limit: max 50 AI requests per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ticketCount = await prisma.aITicket.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: today },
      },
    });

    if (ticketCount >= 50) {
      return NextResponse.json(
        { error: "Daily AI request limit reached (50/day). Try again tomorrow." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { stepId, message, imageBase64, imageMimeType, quickAction } = body;

    if (!stepId || (!message && !quickAction)) {
      return NextResponse.json(
        { error: "stepId and message (or quickAction) are required" },
        { status: 400 }
      );
    }

    if (imageBase64 && imageBase64.length > MAX_IMAGE_SIZE * 1.37) {
      return NextResponse.json(
        { error: "Image too large. Max 4MB." },
        { status: 400 }
      );
    }

    // Fetch step with module and scenario
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: {
        module: {
          include: { scenario: true },
        },
      },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    const aiAnswer = await getAIResponse({
      stepTitle: step.title,
      stepContent: step.contentMd,
      stepGoal: step.goal,
      stepPrerequisites: step.prerequisites,
      stepExpectedResult: step.expectedResult,
      stepCommonErrors: step.commonErrors,
      scenarioName: step.module.scenario.name,
      userMessage: message || "",
      imageBase64,
      imageMimeType,
      quickAction,
    });

    // Save ticket
    await prisma.aITicket.create({
      data: {
        userId: session.user.id,
        stepId,
        inputText: message || quickAction,
        imageRef: imageBase64 ? "uploaded" : null,
        aiAnswer,
      },
    });

    return NextResponse.json({ answer: aiAnswer });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
