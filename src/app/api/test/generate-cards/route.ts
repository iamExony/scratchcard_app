import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';

const prisma = new PrismaClient();

// Function to generate a random PIN
function generatePin() {
  const nums = crypto.randomBytes(8).readUIntBE(0, 8) % 100000000;
  return nums.toString().padStart(8, '0');
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '20');
    const cardType = searchParams.get('type') || 'WAEC';

    console.log(`🎲 Generating ${count} test cards of type: ${cardType}`);

    // Generate test cards matching the schema
    // Generate test cards matching the schema
    const cardsToCreate = Array(count).fill(null).map(() => ({
      type: cardType as any, // Using type from schema
      pin: generatePin(),
      value: "1000",
      isImage: false,
      price: 1000.00,
      isUsed: false,
    }));

    console.log('📝 Creating cards:', cardsToCreate[0]);

    const result = await prisma.scratchCard.createMany({
      data: cardsToCreate
    });

    // Count total available cards after generation
    const availableCount = await prisma.scratchCard.count({
      where: {
        cardType: type,
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${count} test cards`,
      availableCount,
    });

  } catch (error) {
    console.error("Failed to generate test cards:", error);
    return NextResponse.json(
      { error: "Failed to generate test cards" },
      { status: 500 }
    );
  }
}