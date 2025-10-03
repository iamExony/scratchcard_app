import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateReference } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, cardType, quantity, totalAmount, paymentReference } = await request.json();

    if (!userId || !cardType || !quantity || !totalAmount || !paymentReference) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check user balance (if paying from wallet)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate order reference
    const orderReference = generateReference();

    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          cardType,
          quantity,
          totalAmount,
          reference: orderReference,
          status: "PROCESSING",
        },
      });

      // Link transaction to order
      await tx.transaction.update({
        where: { reference: paymentReference },
        data: { orderId: order.id },
      });

      // Here you would generate scratch cards based on quantity and cardType
      // For now, we'll create placeholder cards
      const scratchCards = [];
      for (let i = 0; i < quantity; i++) {
        const card = await tx.scratchCard.create({
          data: {
            type: cardType,
            pin: `PIN_${orderReference}_${i}`.toUpperCase(),
            value: cardType, // You might want to set actual values
            price: totalAmount / quantity,
            orderId: order.id,
          },
        });
        scratchCards.push(card);
      }

      // Update order status to completed
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
        include: { cards: true },
      });

      return { order: updatedOrder, cards: scratchCards };
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      data: result,
    });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}