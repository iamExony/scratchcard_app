// app/api/admin/email/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/nodemailer";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json(); // Only need orderId

    console.log("Received orderId:", orderId); // Debug log

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order details with user information
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cards: {
          where: {
            isUsed: false // Only get unused cards
          },
          select: {
            id: true,
            pin: true,
            value: true,
            isImage: true,
          },
        },
      },
    });

    console.log("Found order:", order); // Debug log

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.user) {
      return NextResponse.json(
        { error: "User not found for this order" },
        { status: 404 }
      );
    }

    if (order.cards.length === 0) {
      return NextResponse.json(
        { error: "No cards available for this order" },
        { status: 400 }
      );
    }

    // Generate email content
    const emailContent = generateEmailContent(order, order.cards);

    console.log("Sending email to:", order.user.email); // Debug log

    // Send email using Nodemailer
    const emailResult = await sendEmail(
      order.user.email,
      emailContent.subject,
      emailContent.html
    );

    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    // Update order status to completed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    // Mark cards as used
    await prisma.scratchCard.updateMany({
      where: { 
        id: { in: order.cards.map(card => card.id) }
      },
      data: { isUsed: true },
    });

    // Create email log
    await prisma.emailLog.create({
      data: {
        userId: order.user.id,
        orderId: order.id,
        recipient: order.user.email,
        subject: emailContent.subject,
        status: "SENT",
        cardType: order.cardType,
      },
    });

    return NextResponse.json({
      message: "Email sent successfully",
      recipient: order.user.email,
      cardsSent: order.cards.length,
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);

    // Log failed email attempt
    try {
      const { orderId } = await request.json();
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (order && order.user) {
        await prisma.emailLog.create({
          data: {
            userId: order.user.id,
            orderId,
            recipient: order.user.email,
            subject: "Failed to send cards",
            status: "FAILED",
            error: error.message,
          },
        });
      }
    } catch (logError) {
      console.error("Error logging failed email:", logError);
    }

    return NextResponse.json(
      { error: "Failed to send email: " + error.message },
      { status: 500 }
    );
  }
}

function generateEmailContent(order: any, cards: any[]) {
  const cardTypeNames = {
    WAEC: "WAEC Scratch Card",
    NECO: "NECO Token", 
    NABTEB: "NABTEB Pin",
    NBAIS: "NBAIS Result Checker",
  };

  const subject = `Your ${cardTypeNames[order.cardType]} Purchase - ResultPins`;

  let cardsSection = "";
  
  if (cards[0]?.isImage) {
    cardsSection = `
      <p>Your ${order.cardType} scratch cards are attached as images. Please download and use them carefully.</p>
      <p>You purchased ${order.quantity} card(s) for ₦${order.totalAmount.toLocaleString()}.</p>
      <p><strong>Note:</strong> Our team will send the card images to you shortly.</p>
    `;
  } else {
    cardsSection = `
      <p>Here are your ${order.cardType} details:</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        ${cards.map(card => `
          <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 3px; border-left: 4px solid #007bff;">
            <strong>Card PIN/Token:</strong><br>
            <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #007bff;">
              ${card.pin}
            </span>
          </div>
        `).join('')}
      </div>
      <p>You purchased ${order.quantity} card(s) for ₦${order.totalAmount.toLocaleString()}.</p>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
        }
        .header { 
          background: linear-gradient(135deg, #007bff, #0056b3); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { 
          background: white; 
          padding: 30px; 
          border: 1px solid #e0e0e0; 
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          color: #666; 
          font-size: 12px; 
          padding: 20px;
        }
        .instructions { 
          background: #e7f3ff; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 25px 0; 
          border-left: 4px solid #007bff;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🎓 ResultPins</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Educational Scratch Cards Delivery</p>
      </div>
      
      <div class="content">
        <h2 style="color: #007bff; margin-top: 0;">Thank you for your purchase! ✅</h2>
        
        ${cardsSection}
        
        <div class="instructions">
          <h3 style="color: #0056b3; margin-top: 0;">📋 Important Instructions:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Keep your card details secure and confidential</li>
            <li>Use the cards only on official examination portals</li>
            <li>Cards are valid for one-time use only</li>
            <li>Contact support immediately if you encounter any issues</li>
            <li>Do not share your card details with anyone</li>
          </ul>
        </div>
        
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
          <strong>Order Reference:</strong> ${order.reference}<br>
          <strong>Purchase Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
          <strong>Delivery Time:</strong> ${new Date().toLocaleString()}
        </div>
        
        <p style="margin-top: 25px;">
          Best regards,<br>
          <strong>The ResultPins Team</strong>
        </p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>If you have any questions, contact our support team at support@resultpins.com</p>
        <p>&copy; ${new Date().getFullYear()} ResultPins. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}