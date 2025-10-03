// app/api/admin/users/bulk-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    const { userIds, role } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    if (!role || !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json(
        { error: "Valid role is required" },
        { status: 400 }
      );
    }

    // Update multiple users
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: { role },
    });

    return NextResponse.json({
      message: `Updated ${result.count} users to ${role}`,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Error bulk updating users:", error);
    return NextResponse.json(
      { error: "Failed to update users" },
      { status: 500 }
    );
  }
}