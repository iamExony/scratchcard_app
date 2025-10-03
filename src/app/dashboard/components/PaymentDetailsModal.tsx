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
import { initializePayment } from "@/lib/paystack";
import { generateReference } from "@/lib/utils";

interface PaymentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
}

export function PaymentDetailsModal({
  open,
  onOpenChange,
  productName,
  productType,
  quantity,
  unitPrice,
}: PaymentDetailsModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { data: session } = useSession();

  const itemTotal = quantity * unitPrice;
  const serviceCharge = 50;
  const stampDuty = 50;
  const total = itemTotal + serviceCharge + stampDuty;

  const handleMakePayment = async () => {
    if (!agreed) {
      toast.error("Please verify and agree to the terms");
      return;
    }

    if (!session?.user?.email) {
      toast.error("Please login to continue");
      return;
    }

    setProcessing(true);

    try {
      // Generate unique reference
      const reference = generateReference();
      
      // Initialize Paystack payment
      const paymentData = await initializePayment({
        email: session.user.email,
        amount: total * 100, // Convert to kobo
        reference,
        callback_url: `${window.location.origin}/dashboard/payment/verify`,
        metadata: {
          userId: session.user.id,
          productType,
          quantity,
          unitPrice,
          totalAmount: total,
        },
      });

      if (paymentData.status) {
        // Redirect to Paystack payment page
        window.location.href = paymentData.data.authorization_url;
      } else {
        toast.error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setAgreed(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buy {productType}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Payment Details</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total Section */}
          <div className="bg-success/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">TOTAL:</p>
            <p className="text-3xl font-bold">₦{total.toLocaleString()}</p>
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
              disabled={!agreed || processing}
            >
              {processing ? "Processing..." : "Make Payment"}
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