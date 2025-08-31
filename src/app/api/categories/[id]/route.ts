import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export const GET = async (
  _req: Request,
  { params }: { params: { id: string } }
) => {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
};

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const data = await req.json();
  const updated = await prisma.category.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(updated);
};

export const DELETE = async (
  _req: Request,
  { params }: { params: { id: string } }
) => {
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
};
