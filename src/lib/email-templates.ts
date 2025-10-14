export function generateScratchCardEmail(params: {
  userName: string;
  orderReference: string;
  cardType: string;
  quantity: number;
  totalAmount: number;
  scratchCards: Array<{
    pin: string;
    value: string;
  }>;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Scratch Cards - ResultPins</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .greeting { margin-bottom: 25px; }
    .greeting h2 { color: #1f2937; margin: 0 0 10px 0; font-size: 20px; }
    .order-summary { background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
    .order-summary h3 { color: #1f2937; margin: 0 0 15px 0; font-size: 18px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .summary-label { color: #6b7280; font-weight: bold; }
    .summary-value { color: #1f2937; }
    .cards-section { margin-bottom: 25px; }
    .cards-section h3 { color: #1f2937; margin: 0 0 15px 0; font-size: 18px; }
    .warning-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 20px; margin-bottom: 15px; }
    .warning-text { color: #92400e; margin: 0 0 15px 0; font-weight: bold; }
    .card-list { display: grid; gap: 10px; }
    .card-item { background: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #d1d5db; display: flex; justify-content: space-between; align-items: center; }
    .card-pin { font-family: monospace; font-size: 18px; font-weight: bold; color: #1f2937; letter-spacing: 2px; }
    .card-badge { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .instructions { background: #f0f9ff; padding: 20px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #bae6fd; }
    .instructions h4 { color: #0369a1; margin: 0 0 10px 0; font-size: 16px; }
    .footer { text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
    .amount { font-size: 24px; font-weight: bold; color: #059669; }
    @media (max-width: 600px) {
      .summary-grid { grid-template-columns: 1fr; }
      .card-item { flex-direction: column; align-items: flex-start; gap: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ResultPins</h1>
      <p>Your Scratch Cards Are Ready!</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        <h2>Hello ${params.userName},</h2>
        <p>Thank you for your purchase! Your ${params.cardType} scratch cards have been generated successfully.</p>
      </div>

      <div class="order-summary">
        <h3>Order Summary</h3>
        <div class="summary-grid">
          <div class="summary-label">Order Reference:</div>
          <div class="summary-value">${params.orderReference}</div>
          
          <div class="summary-label">Card Type:</div>
          <div class="summary-value">${params.cardType}</div>
          
          <div class="summary-label">Quantity:</div>
          <div class="summary-value">${params.quantity}</div>
          
          <div class="summary-label">Total Amount:</div>
          <div class="summary-value amount">₦${params.totalAmount.toLocaleString()}</div>
        </div>
      </div>

      <div class="cards-section">
        <h3>Your Scratch Cards</h3>
        <div class="warning-box">
          <p class="warning-text">⚠️ Keep these pins secure and do not share them!</p>
          <div class="card-list">
            ${params.scratchCards.map((card, index) => `
              <div class="card-item">
                <div>
                  <span style="color: #6b7280; font-size: 14px;">Card ${index + 1}:</span>
                  <div class="card-pin">${card.pin}</div>
                </div>
                <span class="card-badge">${card.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="instructions">
        <h4>How to Use Your Scratch Cards:</h4>
        <ol>
          <li>Visit the official ${params.cardType} examination portal</li>
          <li>Select "Check Result" or similar option</li>
          <li>Enter the PIN when prompted</li>
          <li>Complete your result checking process</li>
        </ol>
      </div>
    </div>

    <div class="footer">
      <p>Need help? Contact our support team at support@scratchcard.com</p>
      <p style="font-size: 12px; color: #9ca3af;">&copy; 2024 ResultPins. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}