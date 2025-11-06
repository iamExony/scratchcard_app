import { formatDate } from "./utils";

export function generateCardOrderEmail({
  customerName,
  orderDetails,
  cards,
  totalAmount,
  reference
}: {
  customerName: string;
  orderDetails: {
    cardType: string;
    quantity: number;
  };
  cards: Array<{
    pin: string;
    serialNumber: string;
  }> | null;
  totalAmount: number;
  reference: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 30px; }
          .card-details { margin-top: 20px; }
          .card-item { 
            background: #f9f9f9;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
          }
          .note {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Confirmation</h2>
          </div>
          
          <p>Dear ${customerName},</p>
          
          <p>Thank you for your purchase. Here are your order details:</p>
          
          <div class="order-info">
            <p><strong>Order Reference:</strong> ${reference}</p>
            <p><strong>Card Type:</strong> ${orderDetails.cardType}</p>
            <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
            <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
            <p><strong>Date:</strong> ${formatDate(new Date())}</p>
          </div>

          ${
            cards 
              ? `
                <div class="card-details">
                  <h3>Your Card Details:</h3>
                  ${cards.map(card => `
                    <div class="card-item">
                      <p><strong>Serial Number:</strong> ${card.serialNumber}</p>
                      <p><strong>PIN:</strong> ${card.pin}</p>
                    </div>
                  `).join('')}
                </div>
                <div class="note">
                  <p><strong>Important:</strong></p>
                  <p>Please keep these details safe and do not share them with anyone.</p>
                </div>
              `
              : `
                <div class="note">
                  <p><strong>Note:</strong></p>
                  <p>Your order is being processed. The card details will be sent to you as soon as they are available.</p>
                </div>
              `
          }
          
          <p>For any questions or support, please contact our customer service.</p>
          
          <p>Best regards,<br>ScratchCard Team</p>
        </div>
      </body>
    </html>
  `;
}