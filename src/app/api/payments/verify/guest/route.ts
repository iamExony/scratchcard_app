import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPayment } from "@/lib/paystack";
import { getPaymentIntent, deletePaymentIntent } from "@/lib/redis";
import { generateScratchCards } from "@/lib/card-availability";
import { sendScratchCardsEmail } from "@/lib/scratch-card-email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { reference } = await request.json();
        if (!reference) {
            return NextResponse.json(
                { error: "Reference is required" },
                { status: 400 }
            );
        }

        // Verify payment with Paystack
        const verification = await verifyPayment(reference);
        if (verification.data.status !== "success") {
            return NextResponse.json(
                { error: "Payment verification failed", details: verification.data.gateway_response },
                { status: 400 }
            );
        }

        // Get payment intent from Redis
        const intent = await getPaymentIntent(reference);
        if (!intent) {
            return NextResponse.json(
                { error: "Payment intent not found" },
                { status: 400 }
            );
        }

        // Create guest order
        const order = await prisma.order.create({
            data: {
                userId: intent.userId, // This will be "guest"
                cardType: intent.productType,
                quantity: parseInt(intent.quantity),
                totalAmount: parseFloat(intent.totalAmount),
                status: "COMPLETED",
                reference: reference
            },
        });

        // Generate cards
        const cards = await generateScratchCards(
            intent.productType,
            parseInt(intent.quantity),
            order.id
        );

        // Send email with cards
        await sendScratchCardsEmail({
            email: intent.email,
            userName: intent.userName || "Customer",
            cards: cards,
            orderDetails: {
                orderNumber: order.id,
                cardType: intent.productType,
                quantity: parseInt(intent.quantity),
                totalAmount: parseFloat(intent.totalAmount)
            }
        });

        // Clean up the payment intent from Redis
        await deletePaymentIntent(reference);

        return NextResponse.json({
            success: true,
            message: "Payment verified and cards sent successfully",
        });
    } catch (error) {
        console.error("Guest payment verification error:", error);
        return NextResponse.json(
            { error: "Payment verification failed" },
            { status: 500 }
        );
    }
}