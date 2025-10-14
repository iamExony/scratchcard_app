import { sendEmail } from './nodemailer';
import { generateScratchCardEmail } from './email-templates';

interface SendScratchCardsEmailParams {
  to: string;
  userName: string;
  orderReference: string;
  cardType: string;
  quantity: number;
  totalAmount: number;
  scratchCards: Array<{
    pin: string;
    value: string;
  }>;
}

export async function sendScratchCardsEmail(params: SendScratchCardsEmailParams) {
  try {
    console.log('📧 Preparing to send scratch card email to:', params.to);

    const subject = `Your ${params.cardType} Scratch Cards - Order ${params.orderReference}`;
    
    const html = generateScratchCardEmail({
      userName: params.userName,
      orderReference: params.orderReference,
      cardType: params.cardType,
      quantity: params.quantity,
      totalAmount: params.totalAmount,
      scratchCards: params.scratchCards,
    });

    const result = await sendEmail(params.to, subject, html);

    if (result.success) {
      console.log('✅ Scratch card email sent successfully to:', params.to);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to send scratch card email:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('💥 Scratch card email service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}