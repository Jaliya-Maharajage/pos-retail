// src/app/api/categories/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(req: Request, { params }: Ctx) {
  const data = await req.json();
  const updated = await prisma.category.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
