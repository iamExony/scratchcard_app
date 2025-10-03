import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPayment } from "@/lib/paystack";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { reference, userId } = await request.json();

    if (!reference || !userId) {
      return NextResponse.json(
        { error: "Reference and user ID are required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
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
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Transaction already processed" },
        { status: 400 }
      );
    }

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

      // Here you would create the order and generate scratch cards
      // For now, we'll just update the transaction
      
      return { transaction };
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: result,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}