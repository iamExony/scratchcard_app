// lib/nodemailer.ts
import nodemailer from 'nodemailer';

// FIX: createTransport instead of createTransporter
/* const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
}); */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  connectionTimeout: 20000, // Increased timeout
  greetingTimeout: 20000,
  socketTimeout: 20000,
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: true, // Validate SSL certificates
    ciphers: 'SSLv3', // Use modern cipher suite
  },
  pool: true, // Use pooled connections
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, // Limit to 1 second between messages
  rateLimit: 5, // Maximum 5 messages per rateDelta
});

// Test the connection
export async function verifyTransporter() {
  try {
    console.log('🔍 Verifying email configuration...');
    console.log('📧 Using configuration:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: process.env.EMAIL_SERVER_SECURE,
      user: process.env.EMAIL_SERVER_USER,
      fromName: process.env.EMAIL_FROM_NAME,
      fromEmail: process.env.EMAIL_FROM,
    });

    await transporter.verify();
    console.log('✅ Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      command: (error as any)?.command,
      response: (error as any)?.response,
    });
    return false;
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Log email attempt
    console.log('📧 Attempting to send email:', {
      to,
      subject,
      from: process.env.EMAIL_FROM || 'noreply@scratchcard.com',
      fromName: process.env.EMAIL_FROM_NAME || 'ScratchCard Admin'
    });

    // Verify connection first
    const isConnected = await verifyTransporter();
    if (!isConnected) {
      console.error('❌ Email server connection failed');
      return { success: false, error: 'Email server connection failed' };
    }

    // Log email server configuration
    console.log('📧 Email server config:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: process.env.EMAIL_SERVER_SECURE,
      user: process.env.EMAIL_SERVER_USER,
      // Don't log password
    });

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'ResultPins'}" <${process.env.EMAIL_FROM || 'noreply@scratchcard.com'}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      command: (error as any)?.command
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
}

export default transporter;