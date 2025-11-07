import { NextRequest, NextResponse } from "next/server";
import { storePaymentIntent, getPaymentIntent, deletePaymentIntent } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
      console.log("📥 Received store intent request:", body);
    } catch (error) {
      console.error("❌ Invalid request body:", error);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { reference, userId, productType, quantity, totalAmount, email, userName } = body;

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await storePaymentIntent(reference, {
      userId: userId || "guest",
      productType,
      quantity,
      totalAmount,
      email,
      userName: userName || "Customer",
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Stored payment intent in Redis:", { reference, userId });

    return NextResponse.json({
      success: true,
      message: "Payment intent stored successfully",
    });

  } catch (error: any) {
    console.error("❌ Failed to store payment intent:", error);
    return NextResponse.json(
      { error: "Failed to store payment intent: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const intent = await getPaymentIntent(reference);

    if (!intent) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, intent });

  } catch (error: any) {
    console.error("❌ Failed to retrieve payment intent:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment intent: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    await deletePaymentIntent(reference);

    return NextResponse.json({
      success: true,
      message: "Payment intent deleted successfully",
    });

  } catch (error: any) {
    console.error("❌ Failed to delete payment intent:", error);
    return NextResponse.json(
      { error: "Failed to delete payment intent: " + error.message },
      { status: 500 }
    );
  }
}
