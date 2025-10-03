// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      totalUsers,
      totalCards,
      totalOrders,
      totalRevenue,
      pendingOrders,
      usedCards
    ] = await Promise.all([
      prisma.user.count(),
      prisma.scratchCard.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.scratchCard.count({ where: { isUsed: true } })
    ]);

    return NextResponse.json({
      totalUsers,
      totalCards,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      usedCards,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}