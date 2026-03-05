import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing-token", req.url));
    }

    const record = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: { startsWith: "verify:" },
        expires: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
    }

    const email = record.identifier.replace("verify:", "");

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    });

    return NextResponse.redirect(new URL("/dashboard?verified=true", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=verification-failed", req.url));
  }
}
