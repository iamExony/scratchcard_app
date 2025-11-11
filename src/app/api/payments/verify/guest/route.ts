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

        console.log("🔍 Guest payment intent:", intent);
        const result = await prisma.$transaction(async (tx) => {

            // Create guest order
            const transaction = await tx.guestTransaction.upsert({
                where: { reference },
                update: {
                    status: "SUCCESS",
                },
                create: {
                    id: reference,  // or uuid()
                    reference,
                    firstname: intent.firstname,
                    lastname: intent.lastname,
                    email: intent.email,
                    phone: intent.phone,
                    product: intent.productType,
                    quantity: intent.quantity,
                    total: intent.totalAmount,
                    purpose: "Payment",
                    status: "SUCCESS",
                }
            });

            // Create order record
            
        const order = await tx.order.create({
                data: {
                    userId: intent.userId === "guest" ? null : intent.userId,
                    cardType: intent.productType,
                    quantity: intent.quantity,
                    totalAmount: parseFloat(intent.totalAmount),
                    reference: reference,
                    status: "PROCESSING",
                },
            });

            // Link transaction to order
            await tx.guestTransaction.update({
                where: { id: transaction.id },
                data: { orderId: order.id },
            });

            // Generate scratch cards
            const scratchCards = await tx.scratchCard.findMany({
                where: { status: "AVAILABLE" },
                take: intent.quantity,
                select: { id: true, pin: true, serialNumber: true }
            })

            await tx.scratchCard.updateMany({
                where: { id: { in: scratchCards.map(card => card.id) } },
                data: {
                    status: "SOLD",
                    purchasedBy: intent.userName,
                    purchasedAt: new Date(),
                    orderId: order.id
                }
            })


            // Update order status to completed
            const updatedOrder = await tx.order.update({
                where: { id: order.id },
                data: { status: "COMPLETED" },
                include: { cards: true },
            });

            return { order: updatedOrder, cards: scratchCards, transaction };
        })


        // Send email with cards
        await sendScratchCardsEmail({
            to: intent.email, // confirm this value exists
            userName: intent.userName || "Customer",
            orderReference: reference,
            cardType: intent.productType,
            quantity: parseInt(intent.quantity),
            totalAmount: parseFloat(intent.totalAmount),
            scratchCards: result.cards.map(c => ({
                pin: c.pin,
                serialNumber: c.serialNumber,
            })),
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