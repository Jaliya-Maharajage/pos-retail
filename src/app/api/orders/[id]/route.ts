import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, customer: true, staff: true },
  });
  return NextResponse.json({ order });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { items, paymentMethod, saleType, totalAmount, status, customerId } = body;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: params.id } });
      await tx.order.update({
        where: { id: params.id },
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
      return tx.order.findUnique({ where: { id: params.id } });
    });
    return NextResponse.json({ order: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// API handler for deleting an order in /api/orders/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;

    // Log the orderId for debugging
    console.log("Attempting to delete order with id:", orderId);

    // Begin transaction to delete related orderItems and then the order
    await prisma.$transaction(async (tx) => {
      // Delete the related order items first
      await tx.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      // Now delete the order
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    return new Response(null, { status: 204 }); // No content, successful deletion
  } catch (error) {
    console.error("Error deleting order:", error);
    return new Response("Failed to delete order", { status: 500 });
  }
}



