// components/admin/OrderDetailsModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Copy, CheckCircle, Clock, Package, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  user: {
    name: string;
    email: string;
  };
  cardType: string;
  quantity: number;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  cards: Array<{
    id: string;
    pin: string;
    value: string;
    isImage: boolean;
  }>;
  reference: string;
  createdAt: string;
}

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onSendEmail: (orderId: string, userEmail: string) => void;
}

export function OrderDetailsModal({
  open,
  onOpenChange,
  order,
  onStatusChange,
  onSendEmail,
}: OrderDetailsModalProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  if (!order) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await onSendEmail(order.id, order.user.email);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const statusConfig = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
    COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
    FAILED: { label: "Failed", color: "bg-red-100 text-red-800", icon: Clock },
  };

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {order.reference}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Customer Name</Label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {order.user.name}
                  </p>
                </div>
                <div>
                  <Label>Customer Email</Label>
                  <p className="font-medium">{order.user.email}</p>
                </div>
                <div>
                  <Label>Card Type</Label>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {order.cardType}
                  </p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <p className="font-medium">{order.quantity}</p>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="font-medium text-green-600">
                    ₦{order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <Badge className={statusConfig[order.status].color}>
                      {statusConfig[order.status].label}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label>Order Date</Label>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Actions */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Order Actions</h3>
              
              <div className="space-y-3">
                <div>
                  <Label>Update Status</Label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => onStatusChange(order.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleSendEmail}
                  disabled={order.status !== "PROCESSING" || isSendingEmail}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isSendingEmail ? "Sending..." : "Send Cards via Email"}
                </Button>

                {order.status === "COMPLETED" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Order completed and delivered
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Cards */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Assigned Cards</h3>
              
              {order.cards.length > 0 ? (
                <div className="space-y-3">
                  {order.cards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="font-mono text-lg font-bold bg-muted px-3 py-2 rounded">
                            {card.pin}
                          </div>
                          {card.isImage && (
                            <Badge variant="outline" className="mt-2">Image Card</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(card.pin)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No cards assigned to this order yet</p>
                  <p className="text-sm mt-1">
                    Assign cards from the inventory to fulfill this order
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}