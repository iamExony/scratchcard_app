import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/nodemailer';
import { verifyTransporter } from '@/lib/nodemailer';

export async function GET(request: NextRequest) {
  try {
    // First verify the email configuration
    console.log('🔍 Verifying email configuration...');
    const isConnected = await verifyTransporter();
    
    if (!isConnected) {
      console.error('❌ Email configuration verification failed');
      return NextResponse.json({
        success: false,
        error: 'Email configuration verification failed'
      }, { status: 500 });
    }

    console.log('✅ Email configuration verified');

    // Log the email configuration (without sensitive data)
    console.log('📧 Email Configuration:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: process.env.EMAIL_SERVER_SECURE,
      user: process.env.EMAIL_SERVER_USER,
      fromName: process.env.EMAIL_FROM_NAME,
      fromEmail: process.env.EMAIL_FROM,
    });

    // Send a test email
    const result = await sendEmail(
      process.env.EMAIL_SERVER_USER!, // Send to the same email
      'ResultPins Email Test',
      `
        <h1>Test Email</h1>
        <p>This is a test email sent at: ${new Date().toLocaleString()}</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <hr>
        <h2>Configuration Details:</h2>
        <ul>
          <li>SMTP Host: ${process.env.EMAIL_SERVER_HOST}</li>
          <li>SMTP Port: ${process.env.EMAIL_SERVER_PORT}</li>
          <li>Secure: ${process.env.EMAIL_SERVER_SECURE}</li>
          <li>From Name: ${process.env.EMAIL_FROM_NAME}</li>
          <li>From Email: ${process.env.EMAIL_FROM}</li>
        </ul>
      `
    );

    if (result.success) {
      console.log('✅ Test email sent successfully:', result.messageId);
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        sentTo: process.env.EMAIL_SERVER_USER
      });
    } else {
      console.error('❌ Failed to send test email:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('💥 Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}