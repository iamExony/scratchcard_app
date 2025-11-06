import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const quantity = searchParams.get('quantity');

    if (!type || !quantity) {
      return NextResponse.json(
        { error: "Card type and quantity are required" },
        { status: 400 }
      );
    }

    // Count available cards of the requested type
    const availableCount = await prisma.scratchCard.count({
      where: {
        type: type as any,
        isUsed: false,
      },
    });

    const isAvailable = availableCount >= parseInt(quantity);

    console.log('🔍 Checking card availability:', {
      type,
      requested: parseInt(quantity),
      available: availableCount,
      isAvailable
    });

    return NextResponse.json({
      available: isAvailable,
      availableCount,
      requestedCount: parseInt(quantity),
      message: isAvailable 
        ? `${availableCount} cards available for purchase`
        : `Only ${availableCount} cards available. Requested: ${quantity}`
    });
  } catch (error) {
    console.error("Failed to check card availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}