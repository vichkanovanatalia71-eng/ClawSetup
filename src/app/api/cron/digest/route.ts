import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyDigests } from "@/lib/digest";

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sent = await generateWeeklyDigests();
    return NextResponse.json({ sent });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
