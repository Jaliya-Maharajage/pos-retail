import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const body = await req.json();
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        price: body.price,
        description: body.description || null,
        barcode: body.barcode || null,
        imageUrl: body.imageUrl || null,
        categoryId: body.categoryId,
      },
    });
    return NextResponse.json({ ok: true, product: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: any }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to delete product" }, { status: 500 });
  }
}
