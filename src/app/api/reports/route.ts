// src/app/api/reports/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";  // Your prisma instance

// Fetch daily sales report
export async function GET(request: Request) {
  try {
    // Get today's date (midnight today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);  // Midnight of today

    // Get start of the week (first day of the week)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());  // Adjust to start of the week
    startOfWeek.setHours(0, 0, 0, 0);  // Midnight of first day of the week

    // Get start of the month (first day of the month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);  // First day of the month
    startOfMonth.setHours(0, 0, 0, 0);  // Midnight of first day of the month

    // Daily Sales (today)
    const dailySales = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay, // Greater than or equal to today (midnight)
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Weekly Sales (this week)
    const weeklySales = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfWeek, // Greater than or equal to start of the week
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Monthly Sales (this month)
    const monthlySales = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth, // Greater than or equal to start of the month
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Return aggregated sales data for today, this week, and this month
    return NextResponse.json({
      dailySales: dailySales._sum.totalAmount || 0,
      weeklySales: weeklySales._sum.totalAmount || 0,
      monthlySales: monthlySales._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
