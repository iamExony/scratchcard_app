import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/email-notifications';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing order confirmation email...');

    // Send a test order confirmation email with sample card details
    const emailResult = await sendEmailNotification({
      to: process.env.EMAIL_SERVER_USER!,
      userName: 'Test User',
      subject: 'Test Order Confirmation',
      template: 'purchaseSuccess',
      data: {
        orderReference: 'TEST-' + Date.now(),
        cardType: 'WAEC Result Checker',
        quantity: 2,
        totalAmount: 2000,
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
      }
    });

    if (emailResult.success) {
      console.log('✅ Test order confirmation email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Test order confirmation email sent successfully'
      });
    } else {
      console.error('❌ Failed to send test order confirmation email:', emailResult.error);
      return NextResponse.json({
        success: false,
        error: emailResult.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('💥 Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}