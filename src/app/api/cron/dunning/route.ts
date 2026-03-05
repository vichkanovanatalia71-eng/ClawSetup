import { NextResponse } from "next/server";
import { checkDunningEmails } from "@/lib/dunning";

export async function GET(request: Request) {
  const cronSecret = request.headers.get("CRON_SECRET");

  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emailsSent = await checkDunningEmails();

  return NextResponse.json({ success: true, emailsSent });
}
