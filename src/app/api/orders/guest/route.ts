import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type OrderWithCards = {
  id: string;
  cardType: string;
  quantity: number;
  totalAmount: number;
  status: string;
  reference: string;
  createdAt: Date;
  cards: {
    pin: string;
    serialNumber: string;
    status: string;
  }[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Get guest orders from the database
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            // Orders associated with a guest user
            guestEmail: email
          },
          {
            // Orders associated with a registered user
            user: {
              email: email
            }
          }
        ]
      },
      select: {
        id: true,
        cardType: true,
        quantity: true,
        totalAmount: true,
        status: true,
        reference: true,
        createdAt: true,
        cards: {
          select: {
            pin: true,
            serialNumber: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the orders to include card details if available
    const formattedOrders = orders.map((order: OrderWithCards) => ({
      ...order,
      cards: order.cards.map((card: { pin: string; serialNumber: string; status: string }) => ({
        ...card,
        // Only include pin if the order status is completed/successful
        pin: order.status === 'completed' ? card.pin : undefined
      }))
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Failed to fetch guest orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}