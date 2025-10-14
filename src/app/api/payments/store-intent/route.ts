import { NextRequest, NextResponse } from "next/server";
import { storePaymentIntent, getPaymentIntent, deletePaymentIntent } from "@/lib/redis";

/* export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, userId, productType, quantity, unitPrice, totalAmount, email } = body;

    console.log("📥 Received store intent request:", body);

    if (!reference || !userId) {
      return NextResponse.json(
        { error: "Reference and userId are required" },
        { status: 400 }
      );
    }

    // Store payment intent in Redis
    await storePaymentIntent(reference, {
      userId,
      productType,
      quantity,
      unitPrice,
      totalAmount,
      email,
      createdAt: new Date().toISOString()
    });

    console.log("💾 Stored payment intent in Redis:", { reference, userId });

    return NextResponse.json({ 
      success: true,
      message: "Payment intent stored successfully"
    });
  } catch (error: any) {
    console.error("Store intent error:", error);
    return NextResponse.json(
      { error: "Failed to store payment intent: " + error.message },
      { status: 500 }
    );
  }
} */

  // In app/api/payments/store-intent/route.ts
export async function POST(request: NextRequest) {
  try {
    const { reference, userId, productType, quantity, unitPrice, totalAmount, email, userName } = await request.json();

    if (!reference || !userId) {
      return NextResponse.json(
        { error: "Reference and userId are required" },
        { status: 400 }
      );
    }

    // Store payment intent in Redis
    await storePaymentIntent(reference, {
      userId,
      productType,
      quantity,
      unitPrice,
      totalAmount,
      email,
      userName: userName || 'Customer', // Include user name for email
      createdAt: new Date().toISOString()
    });

    console.log("💾 Stored payment intent in Redis:", { reference, userId });

    return NextResponse.json({ 
      success: true,
      message: "Payment intent stored successfully"
    });
  } catch (error) {
    console.error("Store intent error:", error);
    return NextResponse.json(
      { error: "Failed to store payment intent" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    const intent = await getPaymentIntent(reference);
    
    if (!intent) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 });
    }

    return NextResponse.json({ intent });
  } catch (error: any) {
    console.error("Get intent error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment intent: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    await deletePaymentIntent(reference);
    
    return NextResponse.json({ 
      success: true,
      message: "Payment intent deleted successfully"
    });
  } catch (error: any) {
    console.error("Delete intent error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment intent: " + error.message },
      { status: 500 }
    );
  }
}