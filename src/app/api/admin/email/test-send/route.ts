// app/api/admin/email/test-send/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Test endpoint received:", body);
    
    return NextResponse.json({
      success: true,
      message: "Test endpoint working",
      receivedData: body
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}