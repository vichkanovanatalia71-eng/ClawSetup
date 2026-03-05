import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const steps = await prisma.step.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { contentMd: { contains: q, mode: "insensitive" } },
        { goal: { contains: q, mode: "insensitive" } },
        { commonErrors: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      goal: true,
      contentMd: true,
      module: {
        select: {
          title: true,
          scenario: { select: { slug: true, name: true } },
        },
      },
    },
    take: 10,
  });

  const results = steps.map((step) => {
    // Extract a snippet around the matching query
    let snippet = step.goal || "";
    const lowerContent = step.contentMd.toLowerCase();
    const lowerQuery = q.toLowerCase();
    const idx = lowerContent.indexOf(lowerQuery);
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(step.contentMd.length, idx + q.length + 60);
      snippet = (start > 0 ? "..." : "") + step.contentMd.slice(start, end).replace(/\n/g, " ") + (end < step.contentMd.length ? "..." : "");
    }

    return {
      id: step.id,
      title: step.title,
      goal: step.goal,
      snippet,
      query: q,
      moduleName: step.module.title,
      scenarioName: step.module.scenario.name,
      url: `/instruction/${step.module.scenario.slug}/${step.slug}`,
    };
  });

  return NextResponse.json({ results });
}
