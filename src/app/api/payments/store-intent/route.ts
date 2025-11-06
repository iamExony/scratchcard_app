import { NextRequest, NextResponse } from "next/server";import { NextRequest, NextResponse } from "next/server";import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest) {import { storePaymentIntent, getPaymentIntent } from "@/lib/redis";import { storePaymentIntent, getPaymentIntent, deletePaymentIntent } from "@/lib/redis";

  return NextResponse.json({ success: true });

}

async function handlePost(request: NextRequest) {/* export async function POST(request: NextRequest) {

  try {  try {

    // Parse request body    const body = await request.json();

    let body;    const { reference, userId, productType, quantity, unitPrice, totalAmount, email } = body;

    try {

      body = await request.json();    console.log("📥 Received store intent request:", body);

    } catch (error) {

      console.error('Failed to parse request body:', error);    if (!reference || !userId) {

      return NextResponse.json(      return NextResponse.json(

        { error: "Invalid request body" },        { error: "Reference and userId are required" },

        { status: 400 }        { status: 400 }

      );      );

    }    }



    // Log the request for debugging    // Store payment intent in Redis

    console.log("📥 Received store intent request:", body);    await storePaymentIntent(reference, {

      userId,

    const { reference, userId, productType, quantity, totalAmount, email, userName } = body;      productType,

      quantity,

    // Validate required fields      unitPrice,

    if (!reference) {      totalAmount,

      return NextResponse.json(      email,

        { error: "Reference is required" },      createdAt: new Date().toISOString()

        { status: 400 }    });

      );

    }    console.log("💾 Stored payment intent in Redis:", { reference, userId });



    if (!email) {    return NextResponse.json({ 

      return NextResponse.json(      success: true,

        { error: "Email is required" },      message: "Payment intent stored successfully"

        { status: 400 }    });

      );  } catch (error: any) {

    }    console.error("Store intent error:", error);

    return NextResponse.json(

    // Store payment intent in Redis      { error: "Failed to store payment intent: " + error.message },

    try {      { status: 500 }

      await storePaymentIntent(reference, {    );

        userId: userId || 'guest',  }

        productType,} */

        quantity,

        totalAmount,  // In app/api/payments/store-intent/route.ts

        email,export async function POST(request: NextRequest) {

        userName: userName || 'Customer',  try {

        createdAt: new Date().toISOString()    // Parse request body

      });    let body;

    try {

      console.log("💾 Stored payment intent in Redis:", { reference, userId: userId || 'guest' });      body = await request.json();

    } catch (error) {

      return NextResponse.json({      console.error('Failed to parse request body:', error);

        success: true,      return NextResponse.json(

        message: "Payment intent stored successfully"        { error: "Invalid request body" },

      });        { status: 400 }

    } catch (error) {      );

      console.error("Redis storage error:", error);    }

      return NextResponse.json(

        { error: "Failed to store payment details. Please try again." },    const { reference, userId, productType, quantity, totalAmount, email, userName } = body;

        { status: 500 }

      );    // Validate required fields

    }    if (!reference) {

  } catch (error) {      return NextResponse.json(

    console.error("Store intent error:", error);        { error: "Reference is required" },

    return NextResponse.json(        { status: 400 }

      { error: "Internal server error" },      );

      { status: 500 }    }

    );

  }    if (!email) {

}      return NextResponse.json(

        { error: "Email is required" },

async function handleGet(request: NextRequest) {        { status: 400 }

  try {      );

    const { searchParams } = new URL(request.url);    }

    const reference = searchParams.get('reference');

        // Store payment intent in Redis

    if (!reference) {    try {

      return NextResponse.json(      await storePaymentIntent(reference, {

        { error: "Reference is required" },        userId: userId || 'guest',

        { status: 400 }        productType,

      );        quantity,

    }        totalAmount,

        email,

    try {        userName: userName || 'Customer',

      const intent = await getPaymentIntent(reference);        createdAt: new Date().toISOString()

            });

      if (!intent) {

        return NextResponse.json(    console.log("💾 Stored payment intent in Redis:", { reference, userId });

          { error: "Payment intent not found" },

          { status: 404 }    return NextResponse.json({ 

        );      success: true,

      }      message: "Payment intent stored successfully"

    });

      return NextResponse.json({ success: true, data: intent });  } catch (error) {

    } catch (error) {    console.error("Store intent error:", error);

      console.error("Redis retrieval error:", error);    return NextResponse.json(

      return NextResponse.json(      { error: "Failed to store payment intent" },

        { error: "Failed to retrieve payment details" },      { status: 500 }

        { status: 500 }    );

      );  }

    }}

  } catch (error) {

    console.error("Get intent error:", error);export async function GET(request: NextRequest) {

    return NextResponse.json(  try {

      { error: "Internal server error" },    const { searchParams } = new URL(request.url);

      { status: 500 }    const reference = searchParams.get('reference');

    );    

  }    if (!reference) {

}      return NextResponse.json({ error: "Reference required" }, { status: 400 });

    }

export { handleGet as GET, handlePost as POST };
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