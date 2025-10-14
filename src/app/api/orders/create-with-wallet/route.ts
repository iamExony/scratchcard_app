import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateReference } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, cardType, quantity, totalAmount } = await request.json();

    if (!userId || !cardType || !quantity || !totalAmount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.balance < totalAmount) {
      return NextResponse.json(
        { error: "Insufficient balance. Please deposit funds to your wallet." },
        { status: 400 }
      );
    }

    const orderReference = generateReference();
    const transactionReference = generateReference();

    const result = await prisma.$transaction(async (tx) => {
      // Create PURCHASE transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: totalAmount,
          type: "PURCHASE",
          reference: transactionReference,
          status: "SUCCESS",
        },
      });

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
        where: { id: transaction.id },
        data: { orderId: order.id },
      });

      // Deduct from user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: totalAmount
          }
        }
      });

      // Generate scratch cards
      const scratchCards = [];
      for (let i = 0; i < quantity; i++) {
        const card = await tx.scratchCard.create({
          data: {
            type: cardType,
            pin: `PIN_${orderReference}_${i}`.toUpperCase(),
            value: cardType,
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

      return { order: updatedOrder, cards: scratchCards, transaction };
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully using wallet balance",
      data: result,
    });

  } catch (error) {
    console.error("Wallet purchase error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}