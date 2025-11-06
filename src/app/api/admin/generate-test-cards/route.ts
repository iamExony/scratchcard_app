import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';

const prisma = new PrismaClient();

// Function to generate a random PIN
function generatePin() {
  // Generate a 6-byte random number for the PIN
  const nums = crypto.randomBytes(6).readUIntBE(0, 6) % 100000000;
  // Convert to string and pad with zeros to ensure 8 digits
  return nums.toString().padStart(8, '0');
}

export async function GET(request: NextRequest) {
  try {
    const count = 20; // Fixed number for testing
    const type = 'WAEC'; // Fixed type for testing

    console.log(`🎲 Generating ${count} test cards of type: ${type}`);

    // Generate test cards
    const cardsData = Array(count).fill(null).map(() => ({
      type: type as any, // Cast to any to handle enum type
      pin: generatePin(),
      value: "1000",
      isImage: false,
      price: 1000.00,
      isUsed: false,
    }));

    // Create cards in database
    const result = await prisma.scratchCard.createMany({
      data: cardsData
    });

    // Get total available cards
    const availableCount = await prisma.scratchCard.count({
      where: {
        type,
        isUsed: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Created ${result.count} test cards`,
      totalAvailable: availableCount,
      sampleCard: {
        ...cardsData[0],
        pin: '****' + cardsData[0].pin.slice(-4) // Hide full PIN in response
      }
    });

  } catch (error) {
    console.error("Failed to generate test cards:", error);
    return NextResponse.json(
      { error: "Failed to generate test cards", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}