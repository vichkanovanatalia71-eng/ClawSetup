import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIResponse, getAIResponseStream } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

const conversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const aiRequestSchema = z.object({
  stepId: z.string().min(1),
  message: z.string().max(4000).optional().default(""),
  quickAction: z.string().max(50).optional(),
  imageBase64: z.string().optional(),
  imageMimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).optional(),
  conversationHistory: z.array(conversationMessageSchema).max(20).optional(),
  stream: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-minute rate limit: 5 requests per minute
    const minuteRL = rateLimit(`ai:min:${session.user.id}`, 5, 60_000);
    if (!minuteRL.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment.", remaining: 0 },
        { status: 429 }
      );
    }

    // Check subscription (allow both ACTIVE and TRIALING)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription || !["ACTIVE", "TRIALING"].includes(subscription.status)) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    // Daily rate limit: max 50 AI requests per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ticketCount = await prisma.aITicket.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: today },
      },
    });

    const dailyRemaining = 50 - ticketCount;
    if (dailyRemaining <= 0) {
      return NextResponse.json(
        { error: "Daily AI request limit reached (50/day). Try again tomorrow.", remaining: 0 },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request: " + parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { stepId, message, quickAction, imageBase64, imageMimeType, conversationHistory, stream } = parsed.data;

    if (!message && !quickAction) {
      return NextResponse.json(
        { error: "message or quickAction is required" },
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

    const aiParams = {
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
      conversationHistory,
    };

    if (stream) {
      const readableStream = await getAIResponseStream(aiParams);

      // Save ticket for streaming
      await prisma.aITicket.create({
        data: {
          userId: session.user.id,
          stepId,
          inputText: message || quickAction || null,
          imageRef: imageBase64 ? "uploaded" : null,
          aiAnswer: "[streamed]",
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Daily-Remaining": String(dailyRemaining - 1),
        },
      });
    }

    const aiAnswer = await getAIResponse(aiParams);

    await prisma.aITicket.create({
      data: {
        userId: session.user.id,
        stepId,
        inputText: message || quickAction || null,
        imageRef: imageBase64 ? "uploaded" : null,
        aiAnswer,
      },
    });

    return NextResponse.json({
      answer: aiAnswer,
      remaining: dailyRemaining - 1,
    });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
