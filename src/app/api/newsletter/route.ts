import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to our newsletter!",
        data: { email }
      });
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        status: "ACTIVE",
      },
    });

    console.log("New newsletter subscriber:", email);

    // Here you would typically:
    // 1. Send welcome email
    // 2. Add to email marketing platform
    // 3. Trigger onboarding sequence

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to our newsletter!",
      data: {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.createdAt
      }
    });

  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "ACTIVE";

    const skip = (page - 1) * limit;

    const [subscribers, totalSubscribers, stats] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where: { status },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where: { status } }),
      getNewsletterStats(),
    ]);

    const totalPages = Math.ceil(totalSubscribers / limit);

    return NextResponse.json({
      success: true,
      data: {
        subscribers,
        stats,
        pagination: {
          currentPage: page,
          totalPages,
          totalSubscribers,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });

  } catch (error) {
    console.error("Get newsletter subscribers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers" },
      { status: 500 }
    );
  }
}

async function getNewsletterStats() {
  const [
    totalSubscribers,
    activeSubscribers,
    todaySubscribers,
    thisWeekSubscribers,
  ] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    prisma.newsletterSubscriber.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.newsletterSubscriber.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    }),
  ]);

  return {
    totalSubscribers,
    activeSubscribers,
    todaySubscribers,
    thisWeekSubscribers,
    inactiveSubscribers: totalSubscribers - activeSubscribers,
  };
}