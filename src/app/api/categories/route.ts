import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";


export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, categories });
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
    const category = await prisma.category.create({ data: { name } });
    return NextResponse.json({ ok: true, category });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to add category" }, { status: 500 });
  }
}
