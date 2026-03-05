import { NextResponse } from "next/server";
import { checkDunningEmails } from "@/lib/dunning";

export async function GET(request: Request) {
  try {
    const cronSecret = request.headers.get("x-cron-secret");

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emailsSent = await checkDunningEmails();

    return NextResponse.json({ success: true, emailsSent });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
