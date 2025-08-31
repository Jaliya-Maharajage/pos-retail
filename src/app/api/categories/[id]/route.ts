// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: any) {
  const { id } = await ctx.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest, ctx: any) {
  const { id } = await ctx.params;
  const data = await req.json();
  const updated = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: any) {
  const { id } = await ctx.params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
