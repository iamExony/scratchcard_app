// app/api/wallet/deposit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { initializePayment } from "@/lib/paystack";
import { generateReference } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, email } = await request.json();

    console.log("🔍 Deposit request received:", { userId, amount, email });

    if (!userId || !amount || !email) {
      return NextResponse.json(
        { error: "User ID, amount, and email are required" },
        { status: 400 }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum deposit amount is ₦100" },
        { status: 400 }
      );
    }

    const reference = generateReference();
    const amountInKobo = Math.round(amount * 100);

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: amount,
        type: "DEPOSIT",
        reference,
        status: "PENDING",
      },
    });

    console.log("✅ Transaction created:", transaction.id);

    // Initialize Paystack payment
    console.log("🔐 Initializing Paystack payment...");
    
    const paymentData = await initializePayment({
      email: email,
      amount: amountInKobo,
      reference: reference,
      callback_url: `${process.env.NEXTAUTH_URL}/dashboard/wallet?deposit=success`,
      metadata: {
        userId,
        transactionId: transaction.id,
        type: "DEPOSIT"
      }
    });

    console.log("📄 Full Paystack response:", paymentData);

    // Check if Paystack returned success
    if (!paymentData.status) {
      console.error("❌ Paystack returned false status:", paymentData);
      
      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: paymentData.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    // Check if authorization URL exists
    if (!paymentData.data?.authorization_url) {
      console.error("❌ No authorization URL in response:", paymentData);
      
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: "Payment gateway error - no authorization URL received" },
        { status: 500 }
      );
    }

    console.log("✅ Authorization URL received:", paymentData.data.authorization_url);

    return NextResponse.json({
      success: true,
      authorization_url: paymentData.data.authorization_url,
      reference,
      transaction,
    });

  } catch (error) {
    console.error("💥 Deposit initialization error:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Deposit initialization failed" 
      },
      { status: 500 }
    );
  }
}