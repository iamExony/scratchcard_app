"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Card {
  pin?: string;
  serialNumber: string;
  status: string;
}

interface Order {
  id: string;
  cardType: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  reference: string;
  cards: Card[];
}

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/orders/guest?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders);
      setSearched(true);

      if (data.orders.length === 0) {
        toast.info("No orders found for this email address");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Track Your Orders</h1>
        
        <div className="flex gap-4 mb-8">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {searched && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-medium">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reference</p>
                        <p className="font-medium">{order.reference}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Product</p>
                        <p className="font-medium">{order.cardType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">₦{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{order.status}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {order.status === 'completed' && order.cards && order.cards.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Card Details</h4>
                        <div className="space-y-2">
                          {order.cards.map((card, index) => (
                            <div key={card.serialNumber} className="p-3 bg-muted rounded-md">
                              <p className="text-sm mb-1">Card {index + 1}</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Serial Number: </span>
                                  <span className="font-medium">{card.serialNumber}</span>
                                </div>
                                {card.pin && (
                                  <div>
                                    <span className="text-muted-foreground">PIN: </span>
                                    <span className="font-medium">{card.pin}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No orders found for this email address.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}