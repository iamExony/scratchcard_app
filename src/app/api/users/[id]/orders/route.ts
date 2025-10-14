import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Make params a Promise
) {
  try {
    // Await the params first
    const { id: userId } = await params;

    console.log("🔍 Fetching orders for user:", userId);

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's orders with scratch cards
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        cards: {
          orderBy: { createdAt: 'asc' }
        },
        transactions: {
          where: { status: 'SUCCESS' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${orders.length} orders for user ${userId}`);

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        reference: order.reference,
        cardType: order.cardType,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        cards: order.cards.map(card => ({
          id: card.id,
          pin: card.pin,
          value: card.value,
          isUsed: card.isUsed,
          createdAt: card.createdAt
        }))
      }))
    });

  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}