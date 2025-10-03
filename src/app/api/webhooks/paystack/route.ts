import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulCharge(event.data);
        break;

      case "transfer.success":
        await handleSuccessfulTransfer(event.data);
        break;

      case "transfer.failed":
        await handleFailedTransfer(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulCharge(data: any) {
  const { reference, metadata } = data;

  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findUnique({
    where: { reference },
  });

  if (existingTransaction) {
    return; // Already processed
  }

  await prisma.$transaction(async (tx) => {
    // Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        userId: metadata.userId,
        amount: data.amount / 100,
        type: "PURCHASE",
        reference,
        status: "SUCCESS",
      },
    });

    // If it's a purchase, create order
    if (metadata.productType) {
      const orderReference = generateReference();
      
      const order = await tx.order.create({
        data: {
          userId: metadata.userId,
          cardType: metadata.productType,
          quantity: metadata.quantity,
          totalAmount: metadata.totalAmount,
          reference: orderReference,
          status: "COMPLETED",
        },
      });

      // Link transaction to order
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { orderId: order.id },
      });

      // Generate scratch cards
      for (let i = 0; i < metadata.quantity; i++) {
        await tx.scratchCard.create({
          data: {
            type: metadata.productType,
            pin: `PIN_${orderReference}_${i}`.toUpperCase(),
            value: metadata.productType,
            price: metadata.unitPrice,
            orderId: order.id,
          },
        });
      }

      // Update user balance if needed (for deposits)
    } else if (metadata.transactionType === "DEPOSIT") {
      await tx.user.update({
        where: { id: metadata.userId },
        data: {
          balance: {
            increment: data.amount / 100,
          },
        },
      });
    }
  });
}

async function handleSuccessfulTransfer(data: any) {
  // Handle successful withdrawals/transfers
  await prisma.transaction.updateMany({
    where: { reference: data.reference },
    data: { status: "SUCCESS" },
  });
}

async function handleFailedTransfer(data: any) {
  // Handle failed transfers and refund user
  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { reference: data.reference },
    });

    if (transaction) {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });

      // Refund user balance for failed withdrawals
      if (transaction.type === "WITHDRAWAL") {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });
      }
    }
  });
}

// Helper function to generate references
function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD_${timestamp}_${random}`.toUpperCase();
}