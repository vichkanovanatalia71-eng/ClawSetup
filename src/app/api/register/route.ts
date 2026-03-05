import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { welcomeEmail, emailVerificationEmail } from "@/lib/email-templates";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 registrations per hour per IP
    const ip = getClientIp(req);
    const rl = rateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Send welcome email
    const welcome = welcomeEmail(user.name || undefined);
    try {
      await sendEmail({ to: user.email, ...welcome });
    } catch {
      // Non-critical: log but don't fail registration
    }

    // Send email verification
    const verifyToken = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: `verify:${user.email}`,
        token: verifyToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
    const verifyEmail = emailVerificationEmail(verifyToken);
    try {
      await sendEmail({ to: user.email, ...verifyEmail });
    } catch {
      // Non-critical: log but don't fail registration
    }

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
