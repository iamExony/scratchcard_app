// app/api/admin/email/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add EmailLog model to your Prisma schema first:
/*
model EmailLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  orderId   String?
  order     Order?   @relation(fields: [orderId], references: [id])
  recipient String
  subject   String
  status    EmailStatus @default(SENT)
  error     String?
  cardType  CardType?
  createdAt DateTime @default(now())
}

enum EmailStatus {
  SENT
  FAILED
  PENDING
}
*/

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [emailLogs, totalLogs] = await Promise.all([
      prisma.emailLog.findMany({
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
              quantity: true,
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalLogs / limit);

    return NextResponse.json({
      emailLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}