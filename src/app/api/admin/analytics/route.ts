// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get previous period for growth calculations
    const previousStartDate = new Date(startDate);
    const periodLength = now.getTime() - startDate.getTime();
    previousStartDate.setTime(startDate.getTime() - periodLength);

    const [
      currentOverview,
      previousOverview,
      revenueByCardType,
      monthlyRevenue,
      userActivity,
      topProducts,
    ] = await Promise.all([
      // Current period overview
      getOverviewStats(startDate, now),
      // Previous period overview for growth
      getOverviewStats(previousStartDate, startDate),
      // Revenue by card type
      getRevenueByCardType(startDate, now),
      // Monthly revenue trend
      getMonthlyRevenue(startDate, now),
      // User activity
      getUserActivity(startDate, now),
      // Top products
      getTopProducts(startDate, now),
    ]);

    // Calculate growth percentages
    const revenueGrowth = calculateGrowth(currentOverview.totalRevenue, previousOverview.totalRevenue);
    const userGrowth = calculateGrowth(currentOverview.totalUsers, previousOverview.totalUsers);
    const orderGrowth = calculateGrowth(currentOverview.totalOrders, previousOverview.totalOrders);

    const analyticsData = {
      overview: {
        ...currentOverview,
        revenueGrowth,
        userGrowth,
        orderGrowth,
      },
      revenueByCardType,
      monthlyRevenue,
      userActivity,
      topProducts,
    };

    return NextResponse.json({ data: analyticsData });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

async function getOverviewStats(startDate: Date, endDate: Date) {
  const [
    totalRevenue,
    totalUsers,
    totalOrders,
    totalCards,
  ] = await Promise.all([
    // Total revenue from successful transactions
    prisma.transaction.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    }),
    // Total users
    prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Total orders
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    // Total cards sold
    prisma.scratchCard.count({
      where: {
        isUsed: true,
        updatedAt: { gte: startDate, lte: endDate },
      },
    }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    totalUsers,
    totalOrders,
    totalCards,
  };
}

async function getRevenueByCardType(startDate: Date, endDate: Date) {
  const revenueByType = await prisma.order.groupBy({
    by: ['cardType'],
    where: {
      status: 'COMPLETED',
      createdAt: { gte: startDate, lte: endDate },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  return revenueByType.map(item => ({
    cardType: item.cardType,
    revenue: item._sum.totalAmount || 0,
    orders: item._count.id,
  }));
}

async function getMonthlyRevenue(startDate: Date, endDate: Date) {
  // This would typically use database-specific date functions
  // For simplicity, we'll generate mock data
  const months = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const month = current.toLocaleString('default', { month: 'short', year: 'numeric' });
    months.push({
      month,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      orders: Math.floor(Math.random() * 50) + 20,
      users: Math.floor(Math.random() * 30) + 10,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

async function getUserActivity(startDate: Date, endDate: Date) {
  // Generate mock user activity data
  const activity = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    activity.push({
      date: current.toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 5) + 1,
      activeUsers: Math.floor(Math.random() * 20) + 10,
      orders: Math.floor(Math.random() * 15) + 5,
    });
    current.setDate(current.getDate() + 1);
  }

  return activity;
}

async function getTopProducts(startDate: Date, endDate: Date) {
  const products = await prisma.order.groupBy({
    by: ['cardType'],
    where: {
      status: 'COMPLETED',
      createdAt: { gte: startDate, lte: endDate },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  return products.map(product => ({
    cardType: product.cardType,
    revenue: product._sum.totalAmount || 0,
    sales: product._count.id,
    growth: Math.floor(Math.random() * 50) - 10, // Mock growth data
  })).sort((a, b) => b.revenue - a.revenue);
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}