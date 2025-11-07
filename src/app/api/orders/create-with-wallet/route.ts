import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateReference } from "@/lib/utils";
import { sendScratchCardsEmail } from "@/lib/scratch-card-email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, cardType, quantity, totalAmount, reference } = await request.json();

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
      const scratchCards = await tx.scratchCard.findMany({
        where: { status: "AVAILABLE" },
        take: quantity,
        select: { id: true, pin: true, serialNumber: true }
      })
      console.log("here are my scratch card details: ", scratchCards)

      await tx.scratchCard.updateMany({
        where: { id: { in: scratchCards.map(card => card.id) } },
        data: {
          status: "SOLD",
          purchasedBy: userId,
          purchasedAt: new Date(),
          orderId: order.id
        }
      })

      
      // Update order status to completed
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
        include: { cards: true },
      });

      // Send email with cards
      await sendScratchCardsEmail({
        to: userEmail, // confirm this value exists
        userName: userEmail || "Customer",
        orderReference: reference,
        cardType: cardType,
        quantity: parseInt(quantity),
        totalAmount: parseFloat(totalAmount),
        scratchCards: scratchCards.map(c => ({
          pin: c.pin,
          serialNumber: c.serialNumber,
        }))
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