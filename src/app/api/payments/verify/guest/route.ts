import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPayment } from "@/lib/paystack";
import { getPaymentIntent, deletePaymentIntent } from "@/lib/redis";
//import { generateScratchCards } from "@/lib/card-availability";
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
        await prisma.guestTransaction.upsert({
            where: { reference },
            update: {
                status: "SUCCESS",
            },
            create: {
                id: reference,  // or uuid()
                reference,
                firstname: "Guest",
                lastname: "",
                email: intent.email,
                phone: "",
                product: intent.productType,
                quantity: intent.quantity,
                total: intent.totalAmount,
                purpose: "Payment",
                status: "SUCCESS",
            }
        });

        // Send email with cards
        await sendScratchCardsEmail({
            to: intent.email, // confirm this value exists
            userName: intent.userName || "Customer",
            orderReference: intent.reference,
            cardType: intent.productType,
            quantity: parseInt(intent.quantity),
            totalAmount: parseFloat(intent.totalAmount),
            scratchCards: [
                {
                    pin: '1234-5678-9012',
                    serialNumber: 'SN123456789'
                },
                {
                    pin: '9876-5432-1098',
                    serialNumber: 'SN987654321'
                }
            ]
            //scratchCards: cards.map(c => ({
            //     pin: c.pin,
            //   serialNumber: c.serialNumber,
            // })), 
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