// src/app/api/reports/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // If a date range is provided, return a range report
    if (from && to) {
      // Normalize to local-day boundaries
      const fromDate = new Date(`${from}T00:00:00.000`);
      const toDate = new Date(`${to}T23:59:59.999`);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()))
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });

      // Optional: only paid orders. If you want all, remove `status: "PAID"`
      const where = {
        createdAt: { gte: fromDate, lte: toDate },
        // status: "PAID",
      } as const;

      const [orders, sum] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: "asc" },
          include: {
            customer: { select: { fullName: true, phone: true } },
          },
        }),
        prisma.order.aggregate({ where, _sum: { totalAmount: true } }),
      ]);

      return NextResponse.json({
        totalSales: Number(sum._sum.totalAmount ?? 0),
        orderCount: orders.length,
        orders: orders.map((o) => ({
          id: o.id,
          createdAt: o.createdAt,
          totalAmount: Number(o.totalAmount),
          paymentMethod: o.paymentMethod,
          saleType: o.saleType,
          customer: o.customer,
        })),
      });
    }

    // Else: return overview (today / this week / this month)
    const now = new Date();

    // Today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // This week (Sunday start; switch to Monday by adjusting getDay())
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // This month
    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [daily, weekly, monthly] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfWeek } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
    ]);

    return NextResponse.json({
      dailySales: Number(daily._sum.totalAmount ?? 0),
      weeklySales: Number(weekly._sum.totalAmount ?? 0),
      monthlySales: Number(monthly._sum.totalAmount ?? 0),
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
