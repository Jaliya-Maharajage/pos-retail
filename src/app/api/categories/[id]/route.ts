import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// Example DELETE handler — follow this exact signature: (request, { params })
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}

// If you also have GET or PUT here, ensure the same two-arg pattern:
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await prisma.category.findUnique({ where: { id: params.id } });
  return NextResponse.json(item);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const updated = await prisma.category.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(updated);
}
