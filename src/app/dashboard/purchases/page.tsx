"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Eye, Copy, Calendar, CreditCard, Hash, RefreshCw } from "lucide-react";

interface Order {
  id: string;
  reference: string;
  cardType: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  cards: ScratchCard[];
}

interface ScratchCard {
  id: string;
  pin: string;
  serialNumber: string;
  value: string;
  isUsed: boolean;
  isImage?: boolean;
  status: string;
  createdAt: string;
}

export default function PurchasesPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (session?.user?.id) fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/users/${session?.user?.id}/orders`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const downloadPins = (order: Order) => {
    const pins = order.cards.map((c, i) => `PIN ${i + 1}: ${c.pin}`).join("\n");
    const serials = order.cards.map((c, i) => `SERIAL ${i + 1}: ${c.serialNumber}`).join("\n");
    const imageUrls = order.cards
      .map((c, i) => (c.isImage && isValidUrl(c.value) ? `IMAGE URL ${i + 1}: ${c.value}` : null))
      .filter(Boolean)
      .join("\n");

    const sections = [pins, serials];
    if (imageUrls) sections.push("", imageUrls as string);

    const blob = new Blob([sections.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SCRATCH_${order.reference}.txt`;
    a.click();
    toast.success("File downloaded!");
  };

  const isValidUrl = (val?: string) => {
    if (!val) return false;
    try {
      // Treat absolute http(s) and root-relative paths as valid
      if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/")) return true;
      // Basic URL constructor check
      new URL(val);
      return true;
    } catch {
      return false;
    }
  };

  const statusVariant = (s: string) =>
    s === "COMPLETED" ? "success" : s === "PROCESSING" ? "warning" : s === "FAILED" ? "destructive" : "secondary";

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading purchases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2">

      {/* HEADER */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Purchases</h1>
          <p className="text-muted-foreground text-sm">Access your scratch cards & pins</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* EMPTY STATE */}
      {orders.length === 0 && (
        <Card className="py-10 border-dashed">
          <CardContent className="flex flex-col items-center">
            <CreditCard className="h-14 w-14 text-muted-foreground/60 mb-4" />
            <h3 className="text-lg font-semibold">No Purchases Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm my-2">
              You haven’t bought any scratch cards yet. Start by making a purchase.
            </p>
            <Button onClick={() => (window.location.href = "/dashboard")} className="mt-2">
              Buy Scratch Cards
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ORDERS */}
      {orders.map(order => (
        <div
          key={order.id}>
          <Card className="group shadow-sm hover:shadow-md transition-all">
            <CardHeader className="bg-muted/40 rounded-t-xl">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="h-4 w-4" /> {order.reference}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(order.createdAt)}
                    </span>
                    <Badge variant={statusVariant(order.status) as any}>{order.status}</Badge>
                  </CardDescription>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">₦{order.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.quantity} {order.cardType} card{order.quantity > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <p className="text-sm font-medium">Scratch Cards ({order.cards.length})</p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {selectedOrder?.id === order.id ? "Hide" : "View"} Pins
                  </Button>

                  <Button size="sm" onClick={() => downloadPins(order)}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>

              {/* PIN LIST WITH ANIMATION */}
             
                {selectedOrder?.id === order.id && (
                  <div
                    className="mt-4 overflow-hidden"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">

                      {order.cards.map((card, i) => (
                        <div
                          key={card.id}
                          className="bg-muted/10 border rounded-xl p-3 flex flex-col gap-2"
                        >
                          {/* HEADER */}
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                              #{i + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              {card.isImage ? (
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  Image Card
                                </span>
                              ) : null}
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  card.isUsed ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                }`}
                              >
                                {card.isUsed ? "Used" : "Unused"}
                              </span>
                            </div>
                          </div>

                          {/* PIN */}
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase">PIN Code</p>
                            <div className="font-mono text-sm bg-background p-2 rounded border tracking-wider">
                              {card.pin}
                            </div>
                          </div>

                          {/* SERIAL */}
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase">Serial Number</p>
                            <div className="font-mono text-sm bg-background p-2 rounded border tracking-wider">
                              {card.serialNumber}
                            </div>
                          </div>

                          {/* IMAGE PREVIEW (if available) */}
                          {card.isImage && isValidUrl(card.value) && (
                            <div>
                              <p className="text-[11px] font-medium text-muted-foreground uppercase">Image</p>
                              <div className="border rounded overflow-hidden bg-background">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={card.value}
                                  alt={`Card ${i + 1} image`}
                                  className="w-full h-56 object-contain bg-white"
                                  loading="lazy"
                                />
                              </div>
                              <div className="mt-2 flex justify-end">
                                <Button size="sm" variant="outline" asChild>
                                  <a href={card.value} target="_blank" rel="noreferrer">
                                    Open Image
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Image info fallback when no URL available */}
                          {card.isImage && !isValidUrl(card.value) && (
                            <div className="text-xs text-muted-foreground">
                              This is an image card, but no preview URL is available.
                            </div>
                          )}

                          {/* COPY BUTTONS */}
                          <div className="flex justify-between">
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(card.pin)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(card.serialNumber)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                        </div>
                      ))}

                    </div>
                  </div>
                )}
              

            </CardContent>
          </Card>
        </div>
      ))}

    </div>
  );
}
