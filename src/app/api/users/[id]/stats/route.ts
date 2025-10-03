import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const [user, orders, transactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      }),
      prisma.order.findMany({
        where: { userId },
        select: { totalAmount: true },
      }),
      prisma.transaction.findMany({
        where: { userId, type: "PURCHASE", status: "SUCCESS" },
        select: { amount: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const totalOrders = orders.length;
    const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    return NextResponse.json({
      balance: user.balance,
      totalOrders,
      totalSpent,
    });

  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}