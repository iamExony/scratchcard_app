// app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Users,
  Mail,
  Eye,
  Filter,
  Download,
  RefreshCw,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { UserDetailsModal } from "../components/UserDetailsModal";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
  balance: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    transactions: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "USER") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  // NEW: Bulk role update
  const bulkUpdateRoles = async (newRole: "ADMIN" | "USER") => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    const updateToast = toast.loading(`Updating ${selectedUsers.length} users...`);

    try {
      const response = await fetch("/api/admin/users/bulk-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUsers, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Refresh users and clear selection
      await fetchUsers(pagination.currentPage);
      setSelectedUsers([]);

      toast.success(`Updated ${selectedUsers.length} users to ${newRole}`, {
        id: updateToast,
      });
    } catch (error) {
      toast.error("Failed to update users", { id: updateToast });
    }
  };

  // NEW: Select/deselect all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // NEW: Toggle individual user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // NEW: Open user details
  const openUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setUserDetailsOpen(true);
  };

  const exportUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to export users");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setSelectedUsers([]);
    fetchUsers(1);
  };

  // NEW: Calculate active users (updated today)
  const activeUsersCount = users.filter(u => 
    new Date(u.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all registered users
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => fetchUsers(pagination.currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* NEW: Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{pagination.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === "ADMIN").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === "USER").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        {/* NEW: Active Users Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{activeUsersCount}</p>
              </div>
              <UserCog className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-blue-800 font-medium">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => bulkUpdateRoles("ADMIN")}
                    variant="outline"
                  >
                    Make Admin
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => bulkUpdateRoles("USER")}
                    variant="outline"
                  >
                    Make User
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUsers([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </form>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {(searchTerm || roleFilter) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
              <p className="text-sm mt-1">
                {searchTerm || roleFilter ? "Try adjusting your filters" : "No users registered yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* NEW: Selection checkbox */}
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all users"
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        {/* NEW: User selection checkbox */}
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            aria-label={`Select ${user.name || user.email}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.name || "No Name"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: "ADMIN" | "USER") =>
                              handleRoleChange(user.id, value)
                            }
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">User</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ₦{user.balance.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user._count.orders} orders
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user._count.transactions} txs
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* NEW: Updated view button to open details modal */}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openUserDetails(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
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
                    {Math.min(pagination.currentPage * 10, pagination.totalUsers)} of{" "}
                    {pagination.totalUsers} users
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => fetchUsers(pagination.currentPage - 1)}
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
                            onClick={() => fetchUsers(page)}
                            isActive={pagination.currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => fetchUsers(pagination.currentPage + 1)}
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

      {/* NEW: User Details Modal */}
      <UserDetailsModal
        open={userDetailsOpen}
        onOpenChange={setUserDetailsOpen}
        userId={selectedUserId}
      />
    </div>
  );
}