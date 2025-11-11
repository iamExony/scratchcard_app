import { formatDate } from "./utils";

interface BaseEmailParams {
  userName: string;
  orderReference: string;
  cardType: string;
  quantity: number;
  totalAmount: number;
}

interface CardDetails {
  pin: string;
  serialNumber: string;
  isImage?: boolean;
  value?: string;
}

export function generateScratchCardEmail(params: BaseEmailParams & {
  scratchCards: CardDetails[] | null;
}): string {
  const { userName, orderReference, cardType, quantity, totalAmount, scratchCards } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Confirmation - ResultPins</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      margin: 0; 
      padding: 0; 
      background-color: #f4f4f4; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
      padding: 20px;
    }
    .header { 
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      margin-bottom: 30px;
    }
    .content {
      padding: 20px;
    }
    .order-details {
      margin-bottom: 30px;
      border: 1px solid #dee2e6;
      padding: 15px;
      border-radius: 5px;
    }
    .card-details {
      margin-top: 30px;
    }
    .card-item {
      background: #f8f9fa;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    .card-image {
      max-width: 100%;
      height: auto;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      margin: 10px 0;
      display: block;
    }
    .image-badge {
      display: inline-block;
      background: #0056b3;
      color: white;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 0.8em;
      margin-bottom: 10px;
    }
    .warning {
      background: #fff3cd;
      color: #856404;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      text-align: center;
      font-size: 0.9em;
      color: #6c757d;
    }
    .highlight {
      font-weight: bold;
      color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>
    
    <div class="content">
      <p>Dear ${userName},</p>
      
      <p>Thank you for your order. Here are your order details:</p>
      
      <div class="order-details">
        <p><strong>Order Reference:</strong> ${orderReference}</p>
        <p><strong>Card Type:</strong> ${cardType}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
        <p><strong>Order Date:</strong> ${formatDate(new Date())}</p>
      </div>

      ${scratchCards ? `
        <div class="card-details">
          <h3>Your Card Details:</h3>
          ${scratchCards.map((card, index) => {
            const isValidUrl = (val?: string) => {
              if (!val) return false;
              return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/');
            };
            
            return `
            <div class="card-item">
              <p><strong>Card ${index + 1}:</strong></p>
              ${card.isImage ? '<span class="image-badge">Image Card</span>' : ''}
              <p><strong>Serial Number:</strong> ${card.serialNumber}</p>
              <p><strong>PIN:</strong> ${card.pin}</p>
              ${card.isImage && card.value && isValidUrl(card.value) ? `
                <p><strong>Card Image:</strong></p>
                <img src="${card.value}" alt="Scratch Card ${index + 1}" class="card-image" />
                <p style="font-size: 0.9em; color: #6c757d;">
                  <a href="${card.value}" target="_blank" style="color: #0056b3;">Click here to view full size image</a>
                </p>
              ` : ''}
            </div>
          `}).join('')}
          
          <div class="warning">
            <p><strong>Important:</strong></p>
            <p>Please keep your card details safe and do not share them with anyone.</p>
          </div>
        </div>
      ` : `
        <div class="warning">
          <p><strong>Note:</strong></p>
          <p>Your order is being processed. Once your payment is confirmed, your card details will be sent to you.</p>
          <p>This usually takes a few minutes, but may take up to 24 hours in some cases.</p>
        </div>
      `}
      
      <div class="footer">
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>ResultPins Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}