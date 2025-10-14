import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const { email, amount, reference, callback_url, metadata } = await request.json();

    console.log("🔐 Server-side Paystack key present:", !!process.env.PAYSTACK_SECRET_KEY);

    const paymentData = await initializePayment({
      email,
      amount,
      reference,
      callback_url,
      metadata
    });

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}