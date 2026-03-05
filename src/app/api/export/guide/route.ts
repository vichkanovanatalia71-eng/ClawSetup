import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scenarioSlug = req.nextUrl.searchParams.get("scenario");
  if (!scenarioSlug) {
    return NextResponse.json({ error: "Missing scenario parameter" }, { status: 400 });
  }

  const scenario = await prisma.scenario.findUnique({
    where: { slug: scenarioSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          steps: {
            where: { status: "PUBLISHED" },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              goal: true,
              contentMd: true,
              expectedResult: true,
            },
          },
        },
      },
    },
  });

  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  // Get user's completed steps
  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { stepId: true },
  });
  const completedIds = new Set(progress.map((p) => p.stepId));

  // Get user's notes
  const notes = await prisma.userNote.findMany({
    where: { userId: session.user.id },
    select: { stepId: true, content: true },
  });
  const notesMap = Object.fromEntries(notes.map((n) => [n.stepId, n.content]));

  // Build HTML export
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${scenario.name} - My Setup Guide</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
    h1 { color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 16px; }
    h2 { color: #16213e; margin-top: 40px; }
    h3 { color: #0f3460; }
    .step { margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; }
    .step.completed { border-left: 4px solid #22c55e; }
    .step.skipped { opacity: 0.6; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge.done { background: #dcfce7; color: #166534; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    .goal { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 12px; margin: 10px 0; border-radius: 4px; }
    .note { background: #fefce8; border-left: 3px solid #eab308; padding: 12px; margin: 10px 0; border-radius: 4px; }
    .content { line-height: 1.6; }
    pre { background: #1a1a2e; color: #e0e0e0; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'Fira Code', monospace; font-size: 14px; }
    @media print { .step { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${scenario.name}</h1>
  <p>Exported by ${session.user.name || session.user.email} on ${new Date().toLocaleDateString()}</p>
`;

  for (const mod of scenario.modules) {
    html += `<h2>${mod.title}</h2>`;
    for (const step of mod.steps) {
      const done = completedIds.has(step.id);
      const note = notesMap[step.id];
      html += `<div class="step ${done ? "completed" : "skipped"}">`;
      html += `<h3>${step.title} <span class="badge ${done ? "done" : "pending"}">${done ? "Done" : "Pending"}</span></h3>`;
      if (step.goal) html += `<div class="goal"><strong>Goal:</strong> ${step.goal}</div>`;
      html += `<div class="content">${step.contentMd}</div>`;
      if (step.expectedResult) html += `<p><strong>Expected Result:</strong> ${step.expectedResult}</p>`;
      if (note) html += `<div class="note"><strong>My Notes:</strong> ${note}</div>`;
      html += `</div>`;
    }
  }

  html += `</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${scenario.slug}-guide.html"`,
    },
  });
}
