// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET settings
export async function GET() {
  try {
    // In a real app, you'd store settings in database
    // For now, return default settings
    const defaultSettings = {
      general: {
        siteName: "ResultPins",
        siteDescription: "Your trusted scratch card provider",
        adminEmail: "admin@scratchcard.com",
        supportEmail: "support@scratchcard.com",
        currency: "NGN",
        timezone: "Africa/Lagos",
      },
      pricing: {
        waecPrice: 1000,
        necoPrice: 1000,
        nabtebPrice: 1000,
        nbaisPrice: 1000,
        serviceCharge: 50,
        stampDuty: 50,
      },
      email: {
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpUser: "noreply@scratchcard.com",
        smtpFrom: "noreply@scratchcard.com",
        autoSendEmails: true,
        emailNotifications: true,
      },
      security: {
        requireEmailVerification: false,
        allowRegistrations: true,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
      },
      notifications: {
        newOrderNotification: true,
        lowStockAlert: true,
        systemAlerts: true,
        emailOnError: true,
      },
    };

    return NextResponse.json({ settings: defaultSettings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// UPDATE settings
export async function PUT(request: NextRequest) {
  try {
    const { settings } = await request.json();

    // In a real app, you'd save to database
    // For now, just validate and return success

    // Validate required fields
    if (!settings.general.siteName || !settings.general.adminEmail) {
      return NextResponse.json(
        { error: "Site name and admin email are required" },
        { status: 400 }
      );
    }

    // Validate pricing
    if (Object.values(settings.pricing).some(price => price < 0)) {
      return NextResponse.json(
        { error: "Prices cannot be negative" },
        { status: 400 }
      );
    }

    console.log("Settings updated:", settings);

    return NextResponse.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}