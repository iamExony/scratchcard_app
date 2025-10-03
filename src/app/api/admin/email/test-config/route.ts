// app/api/admin/email/test-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyTransporter, sendEmail } from "@/lib/nodemailer";

export async function GET() {
  try {
    // Test connection
    const connectionTest = await verifyTransporter();
    
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        message: "Email server connection failed",
        config: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          user: process.env.EMAIL_SERVER_USER ? "Set" : "Not set",
          from: process.env.EMAIL_FROM,
        }
      });
    }

    // Try to send a test email
    const testResult = await sendEmail(
      process.env.EMAIL_SERVER_USER!, // Send to yourself
      "ResultPins - Email Configuration Test",
      `
        <h1>Email Configuration Test</h1>
        <p>If you received this email, your ResultPins email configuration is working correctly!</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    );

    return NextResponse.json({
      success: true,
      message: "Email configuration test completed",
      connection: "✅ Connected",
      testEmail: testResult.success ? "✅ Sent" : "❌ Failed",
      testError: testResult.error,
      config: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        user: process.env.EMAIL_SERVER_USER ? "Set" : "Not set",
        from: process.env.EMAIL_FROM,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Email configuration test failed",
      error: error.message,
      config: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        user: process.env.EMAIL_SERVER_USER ? "Set" : "Not set",
        from: process.env.EMAIL_FROM,
      }
    }, { status: 500 });
  }
}
