import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPayment } from "@/lib/paystack";

const prisma = new PrismaClient();

// Handle GET requests (for wallet page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    console.log("🔍 GET Verify payment request:", { reference });

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const verification = await verifyPayment(reference);

    console.log("📄 Paystack verification result:", {
      status: verification.data.status,
      gateway_response: verification.data.gateway_response
    });

    if (!verification.status) {
      return NextResponse.json(
        { error: verification.message || "Verification failed" },
        { status: 400 }
      );
    }

    // Check if this is a deposit transaction
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference },
    });

    // If transaction exists and is a deposit, ensure balance is updated
    if (existingTransaction && existingTransaction.type === "DEPOSIT" && verification.data.status === "success") {
      await handleDepositSuccess(existingTransaction, verification.data);
    }

    return NextResponse.json({
      status: verification.status,
      message: verification.message,
      data: verification.data,
    });

  } catch (error) {
    console.error("GET Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}

// Handle POST requests (for your existing purchase flow)
export async function POST(request: NextRequest) {
  try {
    const { reference, userId } = await request.json();

    console.log("🔍 POST Verify payment request:", { reference, userId });

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack first
    const verification = await verifyPayment(reference);

    if (verification.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    const paymentData = verification.data;

    // Check if transaction already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference },
      include: { order: true }
    });

    if (existingTransaction) {
      console.log("ℹ️ Transaction already exists, returning success");
      return NextResponse.json({
        success: true,
        message: "Payment already processed successfully",
        data: {
          existing: true,
          transaction: existingTransaction,
          order: existingTransaction.order
        }
      });
    }

    // If transaction doesn't exist and we have userId, create it
    if (userId) {
      // Start database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId,
            amount: paymentData.amount / 100, // Convert from kobo to naira
            type: "PURCHASE",
            reference,
            status: "SUCCESS",
          },
        });

        // Create order record
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
        message: "Payment verified and transaction created successfully",
        data: result,
      });
    } else {
      // If no userId but payment is successful, return success
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: { verification: paymentData },
      });
    }

  } catch (error) {
    console.error("POST Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to handle deposit success
async function handleDepositSuccess(transaction: any, paymentData: any) {
  // If transaction is already successful, no need to update
  if (transaction.status === "SUCCESS") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Update transaction status
    await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "SUCCESS",
        amount: paymentData.amount / 100
      },
    });

    // Update user balance for deposit
    await tx.user.update({
      where: { id: transaction.userId },
      data: {
        balance: {
          increment: paymentData.amount / 100
        }
      }
    });

    console.log(`✅ Updated balance for user ${transaction.userId}`);
  });
}