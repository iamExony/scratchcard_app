import { NextRequest, NextResponse } from "next/server";
import { checkCardAvailability } from "@/lib/card-availability";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";
    const quantity = parseInt(searchParams.get("quantity") || "1");

    if (!type) {
      return NextResponse.json(
        { error: "Card type is required" },
        { status: 400 }
      );
    }

    const availability = await checkCardAvailability(type, quantity);

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}