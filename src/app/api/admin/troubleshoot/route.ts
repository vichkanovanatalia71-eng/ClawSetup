import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role)) {
    return null;
  }
  return session;
}

// GET all trees (optionally filtered by stepId)
export async function GET(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stepId = req.nextUrl.searchParams.get("stepId");
  const trees = await prisma.troubleshootTree.findMany({
    where: stepId ? { stepId } : undefined,
    include: {
      nodes: { orderBy: { order: "asc" } },
      step: { select: { title: true } },
    },
    orderBy: { title: "asc" },
  });
  return NextResponse.json({ trees });
}

// POST create tree with nodes
export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { stepId, title, nodes } = await req.json();

  const tree = await prisma.troubleshootTree.create({
    data: {
      stepId,
      title,
      nodes: {
        create: (nodes || []).map((n: { question: string; answer?: string; parentId?: string; isLeaf: boolean; order: number }) => ({
          question: n.question,
          answer: n.answer || null,
          parentId: n.parentId || null,
          isLeaf: n.isLeaf || false,
          order: n.order || 0,
        })),
      },
    },
    include: { nodes: true },
  });

  return NextResponse.json({ tree }, { status: 201 });
}

// PUT update tree + nodes (replace all nodes)
export async function PUT(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, title, nodes } = await req.json();

  // Delete old nodes and recreate
  await prisma.troubleshootNode.deleteMany({ where: { treeId: id } });

  const tree = await prisma.troubleshootTree.update({
    where: { id },
    data: {
      title,
      nodes: {
        create: (nodes || []).map((n: { id?: string; question: string; answer?: string; parentId?: string; isLeaf: boolean; order: number }) => ({
          id: n.id || undefined,
          question: n.question,
          answer: n.answer || null,
          parentId: n.parentId || null,
          isLeaf: n.isLeaf || false,
          order: n.order || 0,
        })),
      },
    },
    include: { nodes: true },
  });

  return NextResponse.json({ tree });
}

// DELETE tree
export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.troubleshootTree.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
