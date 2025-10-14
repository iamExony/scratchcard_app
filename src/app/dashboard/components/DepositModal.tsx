"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepositSuccess: () => void;
}

export function DepositModal({
  open,
  onOpenChange,
  onDepositSuccess,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const { data: session } = useSession();

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 100) {
      toast.error("Minimum deposit amount is ₦100");
      return;
    }

    if (!session?.user?.id || !session?.user?.email) {
      toast.error("Please login to continue");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          amount: parseFloat(amount),
          email: session.user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Deposit failed");
      }

      if (result.authorization_url) {
        window.location.href = result.authorization_url;
        onDepositSuccess();
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error(error instanceof Error ? error.message : "Deposit failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit to Wallet</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Add funds to your wallet</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="text-sm font-medium mb-2 block">
              Amount (₦)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              step="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum deposit: ₦100
            </p>
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
              onClick={handleDeposit}
              disabled={!amount || processing || parseFloat(amount) < 100}
            >
              {processing ? "Processing..." : `Deposit ₦${parseFloat(amount || "0").toLocaleString()}`}
            </Button>
          </div>

          {/* Note */}
          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to Paystack to complete your deposit
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}