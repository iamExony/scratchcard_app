"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { generateReference } from "@/lib/utils";

interface PaymentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  userBalance: number;
  onPurchaseSuccess: () => void;
}

export function PaymentDetailsModal({
  open,
  onOpenChange,
  productName,
  productType,
  quantity,
  unitPrice,
  userBalance,
  onPurchaseSuccess,
}: PaymentDetailsModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "paystack">("wallet");
  const { data: session } = useSession();

  const itemTotal = quantity * unitPrice;
  const serviceCharge = 50;
  const stampDuty = 50;
  const total = itemTotal + serviceCharge + stampDuty;

  const checkAvailability = async () => {
    try {
      const response = await fetch(`/api/cards/availability?type=${productType}&quantity=${quantity}`);
      const data = await response.json();
      
      if (!data.available) {
        toast.error(`Only ${data.availableCount} ${productType} cards available. Required: ${quantity}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking availability:", error);
      return true;
    }
  };

  const handleWalletPayment = async () => {
    if (!agreed) {
      toast.error("Please verify and agree to the terms");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please login to continue");
      return;
    }

    if (userBalance < total) {
      toast.error("Insufficient wallet balance. Please deposit funds or use Paystack.");
      return;
    }

    setProcessing(true);

    try {
      // Check card availability first
      const isAvailable = await checkAvailability();
      if (!isAvailable) {
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/orders/create-with-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          cardType: productType,
          quantity,
          totalAmount: total,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Purchase failed");
      }

      toast.success("Purchase completed successfully!");
      onPurchaseSuccess();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Wallet purchase error:", error);
      toast.error(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaystackPayment = async () => {
    if (!agreed) {
      toast.error("Please verify and agree to the terms");
      return;
    }

    if (!session?.user?.email || !session?.user?.id) {
      toast.error("Please login to continue");
      return;
    }

    setProcessing(true);

    try {
      const isAvailable = await checkAvailability();
      if (!isAvailable) {
        setProcessing(false);
        return;
      }
      
      const reference = generateReference();
      
      // Store payment intent
      const storeResponse = await fetch('/api/payments/store-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          userId: session.user.id,
          productType,
          quantity,
          unitPrice,
          totalAmount: total,
          email: session.user.email,
          userName: session.user.name || 'Customer',
        }),
      });

      const storeResult = await storeResponse.json();

      if (!storeResponse.ok) {
        throw new Error("Failed to store payment intent: " + storeResult.error);
      }

      // Initialize Paystack payment
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          amount: total * 100,
          reference,
          callback_url: `${window.location.origin}/dashboard/payment/verify`,
          metadata: {
            productType,
            quantity,
            reference,
          }
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Payment initialization failed");
      }

      if (paymentData.status && paymentData.data.authorization_url) {
        window.location.href = paymentData.data.authorization_url;
      } else {
        toast.error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Paystack payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleMakePayment = () => {
    if (paymentMethod === "wallet") {
      handleWalletPayment();
    } else {
      handlePaystackPayment();
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setAgreed(false);
    setPaymentMethod("wallet");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl md:h-4/5 md:overflow-y-auto scroll-smooth custom-scroll">
        <DialogHeader>
          <DialogTitle>Buy {productType}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Payment Details</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet Balance */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">Wallet Balance:</span>
              <span className={`text-lg font-bold ${userBalance >= total ? 'text-green-600' : 'text-red-600'}`}>
                ₦{userBalance.toLocaleString()}
              </span>
            </div>
            {userBalance < total && (
              <p className="text-xs text-red-600 mt-1">
                Insufficient balance for this purchase
              </p>
            )}
          </div>

          {/* Total Section */}
          <div className="bg-success/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">TOTAL:</p>
            <p className="text-3xl font-bold">₦{total.toLocaleString()}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Payment Method:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={paymentMethod === "wallet" ? "default" : "outline"}
                className={`flex-1 ${paymentMethod === "wallet" ? 'bg-success hover:bg-success/90' : ''}`}
                onClick={() => setPaymentMethod("wallet")}
                disabled={userBalance < total}
              >
                💳 Wallet
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "paystack" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setPaymentMethod("paystack")}
              >
                🏦 Paystack
              </Button>
            </div>
            {paymentMethod === "wallet" && userBalance < total && (
              <p className="text-xs text-red-600">
                Switch to Paystack or deposit funds to use wallet
              </p>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 grid grid-cols-4 gap-2 p-3 text-xs font-medium text-muted-foreground">
              <div className="col-span-1">ITEMS</div>
              <div className="text-center">QUANTITY</div>
              <div className="text-right">UNIT PRICE</div>
              <div className="text-right">TOTAL PRICE</div>
            </div>

            <div className="divide-y">
              {/* Product Line */}
              <div className="grid grid-cols-4 gap-2 p-3 text-sm">
                <div className="col-span-1 font-medium">{productName}</div>
                <div className="text-center">{quantity}</div>
                <div className="text-right">₦{unitPrice.toLocaleString()}</div>
                <div className="text-right font-medium">₦{itemTotal.toLocaleString()}</div>
              </div>

              {/* Service Charge */}
              <div className="grid grid-cols-4 gap-2 p-3 text-sm">
                <div className="col-span-1 font-medium">SERVICE CHARGE</div>
                <div className="text-center">1</div>
                <div className="text-right">₦{serviceCharge}</div>
                <div className="text-right font-medium">₦{serviceCharge}</div>
              </div>

              {/* Stamp Duty */}
              <div className="grid grid-cols-4 gap-2 p-3 text-sm">
                <div className="col-span-1 font-medium">STAMP DUTY</div>
                <div className="text-center">1</div>
                <div className="text-right">₦{stampDuty}</div>
                <div className="text-right font-medium">₦{stampDuty}</div>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="agreement"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have verified the above information to be accurate and i agree that the payment i am about to make is non-refundable
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-success hover:bg-success/90 text-white"
              onClick={handleMakePayment}
              disabled={!agreed || processing || (paymentMethod === "wallet" && userBalance < total)}
            >
              {processing ? "Processing..." : `Pay ₦${total.toLocaleString()}`}
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-center text-destructive">
            <span className="font-semibold">Note:</span> This payment excludes remita charges
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}