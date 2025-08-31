// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: any) {
  const { id } = await ctx.params; // handles both Promise|object
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, customer: true, staff: true },
  });
  return NextResponse.json({ order });
}

export async function PUT(req: NextRequest, ctx: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const { items, paymentMethod, saleType, totalAmount, status, customerId } = body;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.update({
        where: { id },
        data: {
          paymentMethod,
          saleType,
          totalAmount: Number(totalAmount ?? 0),
          status: status ?? "PAID",
          customerId: customerId ?? undefined,
          items: {
            create: (items ?? []).map((i: any) => ({
              productId: i.productId,
              quantity: Number(i.quantity),
              price: Number(i.price ?? i.unitPrice ?? 0),
            })),
          },
        },
      });
      return tx.order.findUnique({ where: { id } });
    });

    return NextResponse.json({ order: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: any) {
  try {
    const { id } = await ctx.params;

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting order:", error);
    return new Response("Failed to delete order", { status: 500 });
  }
}
