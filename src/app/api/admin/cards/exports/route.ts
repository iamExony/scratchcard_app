// app/api/admin/cards/export/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cards = await prisma.scratchCard.findMany({
      include: {
        order: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV format
    const csvHeaders = "Card ID,Type,PIN,Price,Format,Status,Order Reference,Customer Email,Upload Date\n";
    
    const csvRows = cards.map(card => 
      `"${card.id}","${card.type}","${card.pin}","${card.price}","${card.isImage ? 'Image' : 'Text'}","${card.isUsed ? 'Used' : 'Available'}","${card.order?.reference || 'N/A'}","${card.order?.user?.email || 'N/A'}","${card.createdAt.toISOString()}"`
    ).join('\n');

    const csvContent = csvHeaders + csvRows;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scratch-cards-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting cards:", error);
    return NextResponse.json(
      { error: "Failed to export cards" },
      { status: 500 }
    );
  }
}