// app/api/admin/transactions/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ["PENDING", "SUCCESS", "FAILED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { status },
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
    });

    return NextResponse.json({
      message: "Transaction status updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}