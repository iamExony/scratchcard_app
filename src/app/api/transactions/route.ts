import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter or header
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    // Alternatively, you can use headers (more secure)
    const authHeader = request.headers.get("authorization");
    const tokenUserId = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // In a real app, you'd verify the JWT token here
      // For now, we'll use the query parameter approach
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Get transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: userId
      },
      include: {
        order: {
          select: {
            cardType: true,
            quantity: true,
            status: true,
          }
        }
      },
      orderBy: { 
        createdAt: "desc" 
      },
      skip,
      take: limit,
    });

    const total = await prisma.transaction.count({
      where: { userId: userId },
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error("Transactions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}