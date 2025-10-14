import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productType: string;
  onProceed: (quantity: number) => void;
}

export function ProductPurchaseModal({
  open,
  onOpenChange,
  productName,
  productType,
  onProceed,
}: ProductPurchaseModalProps) {
  const [quantity, setQuantity] = useState<string>("1");

  const handleProceed = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    onProceed(parseInt(quantity));
    onOpenChange(false);
    setQuantity("1");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setQuantity("1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {productName}</DialogTitle>
          <DialogDescription>
            Enter the number of {productType.toUpperCase()} you want to purchase. The total cost will be calculated based on the current price.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of {productType}</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleProceed}>
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
