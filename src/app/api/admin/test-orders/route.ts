// app/api/admin/test-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { count = 5 } = await request.json();

    // Get a user to associate with orders
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json(
        { error: "No users found in database. Please create a user first." },
        { status: 400 }
      );
    }

    // Get some scratch cards to assign to orders
    const availableCards = await prisma.scratchCard.findMany({
      where: { isUsed: false },
      take: count * 3, // Get enough cards for all orders
    });

    if (availableCards.length < count) {
      return NextResponse.json(
        { error: "Not enough scratch cards available. Please upload some cards first." },
        { status: 400 }
      );
    }

    const cardTypes = ["WAEC", "NECO", "NABTEB", "NBAIS"];
    const statuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];

    const testOrders = [];

    for (let i = 0; i < count; i++) {
      const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 cards
      const totalAmount = quantity * 1000; // ₦1000 per card
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          cardType,
          quantity,
          totalAmount,
          status,
          reference: `TEST-${Date.now()}-${i}`,
        },
      });

      // Assign cards to order
      const cardsToAssign = availableCards.splice(0, quantity);
      for (const card of cardsToAssign) {
        await prisma.scratchCard.update({
          where: { id: card.id },
          data: {
            orderId: order.id,
            isUsed: status === "COMPLETED",
          },
        });
      }

      // Get the order with cards and user info
      const orderWithDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          cards: {
            select: {
              id: true,
              pin: true,
              value: true,
              isImage: true,
            },
          },
        },
      });

      testOrders.push(orderWithDetails);
    }

    return NextResponse.json({
      message: `Successfully created ${testOrders.length} test orders`,
      orders: testOrders,
    });
  } catch (error) {
    console.error("Error creating test orders:", error);
    return NextResponse.json(
      { error: "Failed to create test orders: " + error.message },
      { status: 500 }
    );
  }
}