import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const supportSchema = z.object({
  stepId: z.string().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  aiSnapshot: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = supportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        stepId: parsed.data.stepId || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        aiSnapshot: parsed.data.aiSnapshot || null,
      },
    });

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Support Ticket: ${parsed.data.subject}`,
        html: `<p>New support ticket from ${session.user.email}</p><p>${parsed.data.message}</p><p>Ticket ID: ${ticket.id}</p>`,
      });
    }

    return NextResponse.json({ ticket: { id: ticket.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
