// app/admin/orders/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Mail,
  Package,
  Loader2,
  Download,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { OrderDetailsModal } from "../components/OrderDetailsModal";

interface Order {
  id: string;
  user: {
    name: string | null;
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cardTypeFilter, setCardTypeFilter] = useState<string>("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [creatingTestOrders, setCreatingTestOrders] = useState(false);

  const createTestOrders = async () => {
    setCreatingTestOrders(true);
    try {
      const response = await fetch("/api/admin/test-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast.success(`Created ${data.orders.length} test orders`);
      // Refresh the orders list
      await fetchOrders(pagination.currentPage);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreatingTestOrders(false);
    }
  };

  const fetchOrders = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(cardTypeFilter !== "all" && { cardType: cardTypeFilter }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);

    const updateToast = toast.loading("Updating order status...");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update status");
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );

      toast.success("Order status updated successfully", {
        id: updateToast,
        description: `Order is now ${newStatus.toLowerCase()}`,
      });

    } catch (error) {
      toast.error("Failed to update order status", {
        id: updateToast,
        description: error.message,
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // FIXED: Pass userId instead of userEmail
const sendOrderEmail = async (orderId: string) => {
  const emailToast = toast.loading("Sending email...");

  try {
    console.log("Sending email for order:", orderId); // Debug log

    const response = await fetch("/api/admin/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        orderId: orderId // Make sure we're sending orderId
      }),
    });

    const result = await response.json();

    console.log("Email API response:", result); // Debug log

    if (!response.ok) throw new Error(result.error);

    // Update order status to completed
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: "COMPLETED" } : order
      )
    );

    toast.success("Email sent successfully", {
      id: emailToast,
      description: `Cards delivered successfully`,
    });
  } catch (error) {
    console.error("Email error:", error); // Debug log
    toast.error("Failed to send email", {
      id: emailToast,
      description: error.message,
    });
  }
};

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCardTypeFilter("all");
    fetchOrders(1);
  };

  const statusVariants = {
    PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    PROCESSING: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
    FAILED: "bg-red-100 text-red-800 hover:bg-red-200",
  };

  const cardTypes = ["WAEC", "NECO", "NABTEB", "NBAIS"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex gap-3">
        <Button
          onClick={createTestOrders}
          disabled={creatingTestOrders}
          variant="outline"
        >
          {creatingTestOrders ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {creatingTestOrders ? "Creating..." : "Test Orders"}
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" onClick={() => fetchOrders(pagination.currentPage)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">
            Manage and process all customer orders
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => fetchOrders(pagination.currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{pagination.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === "PENDING").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === "PROCESSING").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === "COMPLETED").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order reference, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </form>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Card Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {cardTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {(searchTerm || statusFilter !== "all" || cardTypeFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders found</p>
              <p className="text-sm mt-1">
                {searchTerm || statusFilter !== "all" || cardTypeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No orders placed yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Ref</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Card Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.reference}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.user.name || "No Name"}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.cardType}</Badge>
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>₦{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(newStatus) =>
                              updateOrderStatus(order.id, newStatus)
                            }
                            disabled={updatingOrderId === order.id}
                          >
                            <SelectTrigger className="w-32 h-8">
                              {updatingOrderId === order.id ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="PROCESSING">Processing</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openOrderDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendOrderEmail(order.id)}
                              disabled={order.status !== "PROCESSING"}
                              title={
                                order.status !== "PROCESSING"
                                  ? "Process order first to send email"
                                  : "Send cards via email"
                              }
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(pagination.currentPage * 10, pagination.totalOrders)} of{" "}
                    {pagination.totalOrders} orders
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => fetchOrders(pagination.currentPage - 1)}
                          className={
                            !pagination.hasPrev
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => fetchOrders(page)}
                            isActive={pagination.currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => fetchOrders(pagination.currentPage + 1)}
                          className={
                            !pagination.hasNext
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
        order={selectedOrder}
        onStatusChange={updateOrderStatus}
        onSendEmail={sendOrderEmail}
      />
    </div>
  );
}