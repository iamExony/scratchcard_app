// app/api/admin/cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { pin: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status === "available") {
      where.isUsed = false;
    } else if (status === "used") {
      where.isUsed = true;
    }

    const [cards, totalCards, stats] = await Promise.all([
      // Fetch cards with pagination and ordering
      prisma.scratchCard.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      // Total count for pagination
      prisma.scratchCard.count({ where }),
      // Statistics
      getCardStats(),
    ]);

    const totalPages = Math.ceil(totalCards / limit);

    return NextResponse.json({
      cards,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalCards,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching scratch cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch scratch cards" },
      { status: 500 }
    );
  }
}

async function getCardStats() {
  const [
    totalCards,
    usedCards,
    availableCards,
    cardsByType,
  ] = await Promise.all([
    // Total cards
    prisma.scratchCard.count(),
    // Used cards
    prisma.scratchCard.count({ where: { isUsed: true } }),
    // Available cards
    prisma.scratchCard.count({ where: { isUsed: false } }),
    // Cards by type
    prisma.scratchCard.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    }),
  ]);

  // Convert cardsByType to object format
  const cardsByTypeObj = cardsByType.reduce((acc, item) => {
    acc[item.type] = item._count.id;
    return acc;
  }, {} as any);

  return {
    totalCards,
    usedCards,
    availableCards,
    cardsByType: cardsByTypeObj,
  };
}