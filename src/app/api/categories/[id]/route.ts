import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to delete category" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name } = await req.json();
    const category = await prisma.category.update({ where: { id: params.id }, data: { name } });
    return NextResponse.json({ ok: true, category });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to update category" }, { status: 500 });
  }
}
