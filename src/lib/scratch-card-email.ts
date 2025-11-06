import { sendEmail } from './nodemailer';
import { generateScratchCardEmail } from './email-templates/order-confirmation';

interface SendScratchCardsEmailParams {
  to: string;
  userName: string;
  orderReference: string;
  cardType: string;
  quantity: number;
  totalAmount: number;
  scratchCards: Array<{
    pin: string;
    serialNumber: string;
  }> | null;
}

export async function sendScratchCardsEmail(params: SendScratchCardsEmailParams) {
  try {
    console.log('📧 Preparing to send scratch card email to:', params.to);

    const subject = `Your ${params.cardType} Scratch Cards - Order ${params.orderReference}`;
    
    // Log email preparation details
    console.log('📧 Email details:', {
      to: params.to,
      orderRef: params.orderReference,
      cardType: params.cardType,
      quantity: params.quantity,
      hasCards: params.scratchCards !== null,
      cardsCount: params.scratchCards?.length || 0
    });
    
    const html = generateScratchCardEmail({
      userName: params.userName,
      orderReference: params.orderReference,
      cardType: params.cardType,
      quantity: params.quantity,
      totalAmount: params.totalAmount,
      scratchCards: params.scratchCards,
    });

    // Log HTML content length for debugging
    console.log('📧 Email HTML content length:', html.length);

    const result = await sendEmail(params.to, subject, html);

    if (result.success) {
      console.log('✅ Scratch card email sent successfully to:', params.to, 'MessageID:', result.messageId);
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