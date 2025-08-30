import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
export const runtime = "nodejs";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, staff: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const staffId = session?.user?.id;
    const body = await req.json();
    const { customerId, items, paymentMethod, saleType, totalAmount, status } = body;

    if (!staffId) {
      return NextResponse.json({ error: "Missing staff session" }, { status: 401 });
    }
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        staffId,
        customerId,
        paymentMethod,
        saleType,
        totalAmount: Number(totalAmount ?? 0),
        status: status ?? "PAID",
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            price: Number(i.price ?? i.unitPrice ?? 0),
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true, staff: true },
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("ORDER_CREATE_ERROR", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
