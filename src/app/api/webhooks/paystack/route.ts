import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { getPaymentIntent, deletePaymentIntent, redis } from "@/lib/redis";
import { sendEmailNotification } from '@/lib/email-notifications';

const prisma = new PrismaClient();

// Logging utility
class WebhookLogger {
  static async logEvent(event: string, data: any, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      event,
      data: typeof data === 'object' ? JSON.stringify(data) : data,
    };

    console.log(`[${timestamp}] ${level}: ${event}`, data);

    // Store in database for persistence
    try {
      await prisma.webhookLog.create({
        data: {
          event,
          level,
          data: logEntry.data,
          timestamp: new Date(timestamp),
        },
      });
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  static async logError(event: string, error: any, context: any = {}) {
    await this.logEvent(event, { error: error.message, stack: error.stack, ...context }, 'ERROR');
  }

  static async logSuccess(event: string, data: any = {}) {
    await this.logEvent(event, data, 'INFO');
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let eventType = 'unknown';

  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    await WebhookLogger.logEvent('WEBHOOK_RECEIVED', {
      headers: Object.fromEntries(request.headers),
      bodyLength: body.length,
    });

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      await WebhookLogger.logError('INVALID_SIGNATURE', new Error('Signature mismatch'), {
        receivedSignature: signature,
        computedHash: hash.substring(0, 10) + '...',
      });
      
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    eventType = event.event;

    await WebhookLogger.logEvent('WEBHOOK_PROCESSING', {
      event: eventType,
      reference: event.data?.reference,
    });

    // Handle different webhook events
    switch (eventType) {
      case "charge.success":
        await handleSuccessfulCharge(event.data);
        break;

      case "transfer.success":
        await handleSuccessfulTransfer(event.data);
        break;

      case "transfer.failed":
        await handleFailedTransfer(event.data);
        break;

      default:
        await WebhookLogger.logEvent('UNHANDLED_EVENT', { event: eventType });
        console.log(`Unhandled event type: ${eventType}`);
    }

    const processingTime = Date.now() - startTime;
    await WebhookLogger.logSuccess('WEBHOOK_PROCESSED', {
      event: eventType,
      processingTime: `${processingTime}ms`,
    });

    return NextResponse.json({ received: true, processed: true });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    await WebhookLogger.logError('WEBHOOK_PROCESSING_FAILED', error, {
      eventType,
      processingTime: `${processingTime}ms`,
    });

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulCharge(data: any) {
  const { reference, amount, metadata } = data;

  await WebhookLogger.logEvent('CHARGE_SUCCESS', {
    reference,
    amount,
    metadata,
  });

  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findUnique({
    where: { reference },
  });

  if (existingTransaction) {
    await WebhookLogger.logEvent('TRANSACTION_ALREADY_EXISTS', { reference });
    console.log("📝 Transaction already exists:", reference);
    return;
  }

  // Determine if this is a DEPOSIT or PURCHASE
  const isDeposit = metadata?.type === "DEPOSIT";
  const amountInNaira = amount / 100;

  try {
    if (isDeposit) {
      await handleDepositPayment(reference, amountInNaira, metadata);
    } else {
      await handlePurchasePayment(reference, amountInNaira, metadata);
    }
  } catch (error) {
    await WebhookLogger.logError('CHARGE_PROCESSING_FAILED', error, {
      reference,
      isDeposit,
      amountInNaira,
    });
    throw error;
  }
}

async function handleDepositPayment(reference: string, amount: number, metadata: any) {
  try {
    await WebhookLogger.logEvent('DEPOSIT_PROCESSING_START', {
      reference,
      amount,
      userId: metadata.userId,
    });

    let user: any;

    await prisma.$transaction(async (tx) => {
      // Create DEPOSIT transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: metadata.userId,
          amount: amount,
          type: "DEPOSIT",
          reference,
          status: "SUCCESS",
        },
      });

      // Update user balance
      user = await tx.user.update({
        where: { id: metadata.userId },
        data: {
          balance: {
            increment: amount
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          balance: true,
        }
      });

      await WebhookLogger.logSuccess('DEPOSIT_PROCESSED', {
        transactionId: transaction.id,
        userId: metadata.userId,
        amount,
        newBalance: user.balance,
      });
    });

    // Send deposit success email
    try {
      await sendEmailNotification({
        to: user.email,
        userName: user.name || 'Customer',
        subject: 'Deposit Successful - ScratchCard App',
        template: 'depositSuccess',
        data: {
          amount,
          reference,
          balance: user.balance,
        },
      });
      
      await WebhookLogger.logSuccess('DEPOSIT_EMAIL_SENT', {
        userId: user.id,
        email: user.email,
      });
    } catch (emailError) {
      await WebhookLogger.logError('DEPOSIT_EMAIL_FAILED', emailError, {
        userId: user.id,
        email: user.email,
      });
    }

  } catch (error) {
    await WebhookLogger.logError('DEPOSIT_PROCESSING_FAILED', error, {
      reference,
      amount,
      userId: metadata.userId,
    });
    throw error;
  }
}

async function handlePurchasePayment(reference: string, amount: number, metadata: any) {
  try {
    await WebhookLogger.logEvent('PURCHASE_PROCESSING_START', {
      reference,
      amount,
    });

    // Get the stored payment intent from Redis
    const intent = await getPaymentIntent(reference);

    if (!intent) {
      await WebhookLogger.logError('NO_PAYMENT_INTENT', new Error('Payment intent not found'), {
        reference,
      });
      return;
    }

    await WebhookLogger.logSuccess('PAYMENT_INTENT_RETRIEVED', {
      reference,
      userId: intent.userId,
      productType: intent.productType,
      quantity: intent.quantity,
    });

    let orderResult: any;
    let userEmail: string;
    let userName: string;

    await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: intent.userId,
          amount: amount,
          type: "PURCHASE",
          reference,
          status: "SUCCESS",
        },
      });

      // Create order
      const orderReference = generateReference();
      
      const order = await tx.order.create({
        data: {
          userId: intent.userId,
          cardType: intent.productType as any,
          quantity: parseInt(intent.quantity) || 1,
          totalAmount: parseFloat(intent.totalAmount) || amount,
          reference: orderReference,
          status: "COMPLETED",
        },
      });

      // Link transaction to order
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { orderId: order.id },
      });

      // Fetch available cards from admin pool
      const quantity = parseInt(intent.quantity) || 1;
      const availableCards = await tx.scratchCard.findMany({
        where: {
          type: intent.productType,
          isUsed: false,
          orderId: null,
        },
        take: quantity,
        orderBy: { createdAt: 'asc' },
      });

      await WebhookLogger.logEvent('CARD_AVAILABILITY_CHECK', {
        required: quantity,
        available: availableCards.length,
        productType: intent.productType,
      });

      if (availableCards.length < quantity) {
        const error = new Error(`Insufficient ${intent.productType} cards available. Required: ${quantity}, Available: ${availableCards.length}`);
        
        // Send insufficient cards email
        try {
          await sendEmailNotification({
            to: intent.email,
            userName: intent.userName || 'Customer',
            subject: 'Order Delayed - Insufficient Cards',
            template: 'insufficientCards',
            data: {
              cardType: intent.productType,
              quantity,
              available: availableCards.length,
            },
          });
        } catch (emailError) {
          await WebhookLogger.logError('INSUFFICIENT_CARDS_EMAIL_FAILED', emailError);
        }

        throw error;
      }

      // Mark cards as used and assign to order
      const scratchCards = [];
      for (const card of availableCards) {
        const updatedCard = await tx.scratchCard.update({
          where: { id: card.id },
          data: {
            isUsed: true,
            orderId: order.id,
          },
        });
        scratchCards.push(updatedCard);
      }

      // Store order result for email sending
      orderResult = {
        order,
        scratchCards,
      };
      userEmail = intent.email;
      userName = intent.userName || 'Customer';

      // Clean up the payment intent from Redis
      await deletePaymentIntent(reference);

      await WebhookLogger.logSuccess('PURCHASE_PROCESSED', {
        orderId: order.id,
        transactionId: transaction.id,
        cardsAssigned: scratchCards.length,
        userId: intent.userId,
      });
    });

    // Send purchase success email
    if (orderResult && userEmail) {
      try {
        await sendEmailNotification({
          to: userEmail,
          userName: userName,
          subject: `Your ${intent.productType} Scratch Cards Are Ready!`,
          template: 'purchaseSuccess',
          data: {
            orderReference: orderResult.order.reference,
            cardType: intent.productType,
            quantity: parseInt(intent.quantity),
            totalAmount: parseFloat(intent.totalAmount),
            scratchCards: orderResult.scratchCards.map((card: any) => ({
              pin: card.pin,
              value: card.value,
            })),
          },
        });

        // Log email sent in database
        await prisma.emailLog.create({
          data: {
            userId: intent.userId,
            orderId: orderResult.order.id,
            recipient: userEmail,
            subject: `${intent.productType} Scratch Cards - Order ${orderResult.order.reference}`,
            status: 'SENT',
            cardType: intent.productType as any,
          },
        });

        await WebhookLogger.logSuccess('PURCHASE_EMAIL_SENT', {
          orderId: orderResult.order.id,
          email: userEmail,
        });

      } catch (emailError) {
        await WebhookLogger.logError('PURCHASE_EMAIL_FAILED', emailError, {
          orderId: orderResult.order.id,
          email: userEmail,
        });

        // Log email failure
        await prisma.emailLog.create({
          data: {
            userId: intent.userId,
            orderId: orderResult.order.id,
            recipient: userEmail,
            subject: `${intent.productType} Scratch Cards - Order ${orderResult.order.reference}`,
            status: 'FAILED',
            error: emailError instanceof Error ? emailError.message : 'Unknown error',
            cardType: intent.productType as any,
          },
        });
      }
    }

  } catch (error) {
    await WebhookLogger.logError('PURCHASE_PROCESSING_FAILED', error, {
      reference,
      amount,
      intent: intent ? {
        userId: intent.userId,
        productType: intent.productType,
        quantity: intent.quantity,
      } : null,
    });

    if (error instanceof Error && error.message.includes('Insufficient')) {
      // Notify admin about insufficient cards
      await notifyAdminInsufficientCards(intent, error.message);
    }
    
    throw error;
  }
}

async function notifyAdminInsufficientCards(intent: any, errorMessage: string) {
  try {
    await sendEmailNotification({
      to: 'admin@yourapp.com', // Replace with admin email
      userName: 'Admin',
      subject: '🚨 INSUFFICIENT CARDS ALERT',
      template: 'generalNotification',
      data: {
        message: `Insufficient ${intent.productType} cards!\n\nRequired: ${intent.quantity}\nUser: ${intent.userName} (${intent.email})\n\n${errorMessage}`,
      },
    });
    
    await WebhookLogger.logEvent('ADMIN_NOTIFIED_INSUFFICIENT_CARDS', {
      productType: intent.productType,
      quantity: intent.quantity,
      userId: intent.userId,
    });
  } catch (error) {
    await WebhookLogger.logError('ADMIN_NOTIFICATION_FAILED', error);
  }
}

async function handleSuccessfulTransfer(data: any) {
  try {
    await prisma.transaction.updateMany({
      where: { reference: data.reference },
      data: { status: "SUCCESS" },
    });

    await WebhookLogger.logSuccess('TRANSFER_SUCCESS', {
      reference: data.reference,
    });
  } catch (error) {
    await WebhookLogger.logError('TRANSFER_SUCCESS_HANDLING_FAILED', error, {
      reference: data.reference,
    });
  }
}

async function handleFailedTransfer(data: any) {
  try {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { reference: data.reference },
      });

      if (transaction) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "FAILED" },
        });

        // Refund user balance for failed withdrawals
        if (transaction.type === "WITHDRAWAL") {
          await tx.user.update({
            where: { id: transaction.userId },
            data: {
              balance: {
                increment: transaction.amount,
              },
            },
          });

          await WebhookLogger.logSuccess('WITHDRAWAL_REFUNDED', {
            transactionId: transaction.id,
            userId: transaction.userId,
            amount: transaction.amount,
          });
        }
      }
    });

    await WebhookLogger.logSuccess('TRANSFER_FAILED_HANDLED', {
      reference: data.reference,
    });
  } catch (error) {
    await WebhookLogger.logError('TRANSFER_FAILED_HANDLING_FAILED', error, {
      reference: data.reference,
    });
  }
}

// Helper function to generate references
function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD_${timestamp}_${random}`.toUpperCase();
}