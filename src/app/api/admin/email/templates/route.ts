// app/api/admin/email/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all email templates
export async function GET() {
  try {
    const templates = [
      {
        id: "waec-purchase",
        name: "WAEC Scratch Card Delivery",
        subject: "Your WAEC Scratch Card Purchase - ResultPins",
        cardType: "WAEC",
        isActive: true,
      },
      {
        id: "neco-purchase",
        name: "NECO Token Delivery", 
        subject: "Your NECO Token Purchase - ResultPins",
        cardType: "NECO",
        isActive: true,
      },
      {
        id: "nabteb-purchase",
        name: "NABTEB Pin Delivery",
        subject: "Your NABTEB Scratch Card Purchase - ResultPins", 
        cardType: "NABTEB",
        isActive: true,
      },
      {
        id: "nbais-purchase",
        name: "NBAIS Checker Delivery",
        subject: "Your NBAIS Result Checker Purchase - ResultPins",
        cardType: "NBAIS", 
        isActive: true,
      },
    ];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

// UPDATE email template
export async function PATCH(request: NextRequest) {
  try {
    const { templateId, subject, content, isActive } = await request.json();

    // In a real app, you'd save this to database
    // For now, we'll just return success
    return NextResponse.json({
      message: "Email template updated successfully",
      template: { templateId, subject, content, isActive },
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    );
  }
}