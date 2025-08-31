import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // use your default export
export const runtime = "nodejs";

export async function PUT(req: NextRequest, ctx: any) {
  try {
    const { id } = await ctx.params; // handles Promise|object
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: Number(body.price),
        description: body.description ?? null,
        barcode: body.barcode ?? null,
        imageUrl: body.imageUrl ?? null,
        categoryId: body.categoryId ?? null,
      },
    });

    return NextResponse.json({ ok: true, product: updated });
  } catch (e) {
    console.error("PUT /api/products/[id] error:", e);
    return NextResponse.json({ ok: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: any) {
  try {
    const { id } = await ctx.params;

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/products/[id] error:", e);
    return NextResponse.json({ ok: false, error: "Failed to delete product" }, { status: 500 });
  }
}
