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
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      goal: true,
      module: {
        select: {
          title: true,
          scenario: { select: { slug: true, name: true } },
        },
      },
    },
    take: 10,
  });

  const results = steps.map((step) => ({
    id: step.id,
    title: step.title,
    goal: step.goal,
    moduleName: step.module.title,
    scenarioName: step.module.scenario.name,
    url: `/instruction/${step.module.scenario.slug}/${step.slug}`,
  }));

  return NextResponse.json({ results });
}
