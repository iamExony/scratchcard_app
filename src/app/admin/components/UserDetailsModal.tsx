// components/admin/UserDetailsModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Calendar, Package, History, Wallet, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface UserDetails {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
  balance: number;
  createdAt: string;
  updatedAt: string;
  orders: Array<{
    id: string;
    cardType: string;
    quantity: number;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailsModal({
  open,
  onOpenChange,
  userId,
}: UserDetailsModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setUser(data.user);
    } catch (error) {
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: "ADMIN" | "USER") => {
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      setUser(prev => prev ? { ...prev, role: newRole } : null);
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const sendEmail = () => {
    if (!user) return;
    toast.info(`Preparing to email ${user.email}`);
    // Implement email sending logic
  };

  if (!user && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : user && (
          <div className="space-y-6">
            {/* User Info Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {user.name || "No Name"}
                      </h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                        <Badge variant="outline">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ₦{user.balance.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{user.orders.length}</div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{user.transactions.length}</div>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="text-2xl font-bold">
                        {Math.ceil((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <p className="text-sm text-muted-foreground">Days Active</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-4">Recent Orders</h4>
                    {user.orders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No orders found</p>
                    ) : (
                      <div className="space-y-3">
                        {user.orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{order.cardType}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.quantity} items • ₦{order.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-4">Recent Transactions</h4>
                    {user.transactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No transactions found</p>
                    ) : (
                      <div className="space-y-3">
                        {user.transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{transaction.type}</p>
                              <p className="text-sm text-muted-foreground">
                                ₦{Math.abs(transaction.amount).toLocaleString()} • {transaction.status}
                              </p>
                            </div>
                            <div className={`font-medium ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}₦{transaction.amount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">User Role</h4>
                      <Select value={user.role} onValueChange={handleRoleChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Communication</h4>
                      <Button onClick={sendEmail} className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email to User
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2 text-destructive">Danger Zone</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full text-destructive border-destructive">
                          Reset User Password
                        </Button>
                        <Button variant="outline" className="w-full text-destructive border-destructive">
                          Deactivate Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}