// app/api/admin/transactions/route.ts
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
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [transactions, totalTransactions, revenueStats] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          order: {
            select: {
              cardType: true,
              quantity: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
      // Revenue statistics
      prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      transactions,
      stats: {
        totalRevenue: revenueStats._sum.amount || 0,
        totalTransactions: revenueStats._count.id || 0,
        successfulTransactions: await prisma.transaction.count({ 
          where: { ...where, status: "SUCCESS" } 
        }),
        pendingTransactions: await prisma.transaction.count({ 
          where: { ...where, status: "PENDING" } 
        }),
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}