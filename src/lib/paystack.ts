// lib/paystack.ts
export interface InitializePaymentArgs {
  email: string;
  amount: number; // in kobo
  reference: string;
  callback_url?: string;
  metadata?: any;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      email: string;
    };
  };
}

export async function initializePayment(
  args: InitializePaymentArgs
): Promise<PaystackResponse> {
  try {
    console.log("🔐 Paystack Secret Key present:", !!process.env.PAYSTACK_SECRET_KEY);

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    console.log("📡 Paystack response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Paystack API error response:", errorText);
      throw new Error(`Paystack API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("✅ Paystack success response:", responseData);
    
    return responseData;
  } catch (error) {
    console.error("💥 Paystack initialization error:", error);
    throw error;
  }
}

// Add this verifyPayment function
export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  try {
    console.log("🔍 Verifying payment with reference:", reference);

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    console.log("📡 Paystack verification response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Paystack verification error:", errorText);
      throw new Error(`Paystack verification error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    //console.log("✅ Paystack verification success:", responseData);
    
    return responseData;
  } catch (error) {
    console.error("💥 Paystack verification error:", error);
    throw error;
  }
}