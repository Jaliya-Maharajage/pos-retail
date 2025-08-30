import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const q = searchParams.get("q");

  if (phone) {
    const customer = await prisma.customer.findFirst({ where: { phone } });
    return NextResponse.json({ customer });
  }
  if (q) {
    const customers = await prisma.customer.findMany({
      where: { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] },
      take: 50,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ customers });
  }

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { fullName, phone, email } = body;
  if (!fullName || !phone) {
    return NextResponse.json({ error: "fullName and phone required" }, { status: 400 });
  }
  const existing = await prisma.customer.findFirst({ where: { phone } });
  let customer;
  if (existing) {
    customer = await prisma.customer.update({ where: { id: existing.id }, data: { fullName, email } });
  } else {
    customer = await prisma.customer.create({ data: { fullName, phone, email } });
  }
  return NextResponse.json({ customer });
}
