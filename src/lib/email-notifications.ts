import { sendScratchCardsEmail } from './scratch-card-email';

export interface EmailTemplates {
  depositSuccess: string;
  purchaseSuccess: string;
  insufficientCards: string;
  generalNotification: string;
}

export interface EmailData {
  to: string;
  userName: string;
  subject: string;
  template: keyof EmailTemplates;
  data: any;
}

export async function sendEmailNotification(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, userName, subject, template, data } = emailData;

    // Log the email request
    console.log('📧 Sending email notification:', {
      template,
      to,
      subject,
      hasData: !!data
    });

    let emailResult;

    switch (template) {
      case 'depositSuccess':
        emailResult = await sendDepositSuccessEmail(to, userName, data);
        break;
      
      case 'purchaseSuccess':
        console.log('💳 Processing purchase success email:', {
          orderRef: data.orderReference,
          cardType: data.cardType,
          quantity: data.quantity,
          hasCards: Array.isArray(data.scratchCards)
        });

        emailResult = await sendScratchCardsEmail({
          to,
          userName,
          orderReference: data.orderReference,
          cardType: data.cardType,
          quantity: data.quantity,
          totalAmount: data.totalAmount,
          scratchCards: data.scratchCards
        });
        break;
      
      case 'insufficientCards':
        emailResult = await sendInsufficientCardsEmail(to, userName, data);
        break;
      
      case 'generalNotification':
        emailResult = await sendGeneralNotificationEmail(to, userName, subject, data);
        break;
      
      default:
        console.error('❌ Unknown email template:', template);
        return { success: false, error: 'Unknown email template' };
    }

    return emailResult;
  } catch (error) {
    console.error('Email notification error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    };
  }
}

async function sendDepositSuccessEmail(to: string, userName: string, data: any) {
  // You can use your email service here (Nodemailer, Resend, etc.)
  const { amount, reference, balance } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 24px; color: #10B981; font-weight: bold; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Deposit Successful! 🎉</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your deposit of <span class="amount">₦${amount.toLocaleString()}</span> was successful.</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>New Balance:</strong> ₦${balance.toLocaleString()}</p>
          <p>You can now use your wallet balance to purchase scratch cards instantly.</p>
        </div>
        <div class="footer">
          <p>Thank you for using our service!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Implement your email sending logic here
  console.log('📧 Deposit success email prepared:', { to, userName, amount, reference });
  
  return { success: true };
}

async function sendInsufficientCardsEmail(to: string, userName: string, data: any) {
  const { cardType, quantity, available } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .alert { background: #FEE2E2; border: 1px solid #FECACA; padding: 15px; border-radius: 5px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Delayed ⚠️</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <div class="alert">
            <p><strong>Important:</strong> We're currently experiencing limited stock for ${cardType} cards.</p>
            <p><strong>Required:</strong> ${quantity} cards</p>
            <p><strong>Available:</strong> ${available} cards</p>
          </div>
          <p>Our team is working to restock immediately. You will receive your cards as soon as they become available.</p>
          <p>We apologize for any inconvenience.</p>
        </div>
        <div class="footer">
          <p>Thank you for your patience!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('📧 Insufficient cards email prepared:', { to, userName, cardType, quantity, available });
  
  return { success: true };
}

async function sendGeneralNotificationEmail(to: string, userName: string, subject: string, data: any) {
  const { message } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subject}</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>Thank you for using our service!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log('📧 General notification email prepared:', { to, userName, subject });
  
  return { success: true };
}