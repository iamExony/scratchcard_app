// app/api/test-paystack/route.ts
import { NextResponse } from "next/server";
import { initializePayment } from "@/lib/paystack";

export async function GET() {
  try {
    const testPayment = await initializePayment({
      email: "test@example.com",
      amount: 10000, // 100 Naira
      reference: `test_${Date.now()}`,
      metadata: { userId: "test-user" }
    });

    return NextResponse.json({
      success: true,
      message: "Paystack keys are working",
      data: testPayment
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Paystack keys are invalid",
      details: error
    }, { status: 400 });
  }
}