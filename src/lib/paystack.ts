export interface InitializePaymentArgs {
  email: string;
  amount: number; // in kobo
  reference: string;
  callback_url?: string;
  metadata?: {
    userId: string;
    orderId?: string;
    productType?: string;
    quantity?: number;
  };
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

export async function initializePayment(
  args: InitializePaymentArgs
): Promise<PaystackResponse> {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

export async function verifyPayment(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Paystack verification error: ${response.statusText}`);
  }

  return response.json();
}