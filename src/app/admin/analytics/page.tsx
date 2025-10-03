// app/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Package,
  Download,
  Calendar,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalUsers: number;
    totalOrders: number;
    totalCards: number;
    revenueGrowth: number;
    userGrowth: number;
    orderGrowth: number;
  };
  revenueByCardType: Array<{
    cardType: string;
    revenue: number;
    orders: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
    users: number;
  }>;
  userActivity: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    orders: number;
  }>;
  topProducts: Array<{
    cardType: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setData(result.data);
    } catch (error) {
      toast.error("Failed to fetch analytics data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const exportAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Analytics exported successfully");
    } catch (error) {
      toast.error("Failed to export analytics");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for your business
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₦{data.overview.totalRevenue.toLocaleString()}</p>
                    <div className={`flex items-center text-sm ${data.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {data.overview.revenueGrowth >= 0 ? '+' : ''}{data.overview.revenueGrowth}%
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{data.overview.totalUsers}</p>
                    <div className={`flex items-center text-sm ${data.overview.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {data.overview.userGrowth >= 0 ? '+' : ''}{data.overview.userGrowth}%
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{data.overview.totalOrders}</p>
                    <div className={`flex items-center text-sm ${data.overview.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {data.overview.orderGrowth >= 0 ? '+' : ''}{data.overview.orderGrowth}%
                    </div>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cards Sold</p>
                    <p className="text-2xl font-bold">{data.overview.totalCards}</p>
                    <div className="text-sm text-muted-foreground">
                      Active inventory
                    </div>
                  </div>
                  <Package className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Card Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Card Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenueByCardType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cardType" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ cardType, revenue }) => `${cardType}: ₦${revenue.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {data.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Revenue Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue & Orders Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`₦${Number(value).toLocaleString()}`, 'Revenue'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0088FE" 
                      name="Revenue"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#00C49F" 
                      name="Orders"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newUsers" fill="#8884d8" name="New Users" />
                    <Bar dataKey="activeUsers" fill="#82ca9d" name="Active Users" />
                    <Bar dataKey="orders" fill="#ffc658" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.topProducts.map((product, index) => (
                  <div key={product.cardType} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.cardType}</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₦{product.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.sales} sales
                      </p>
                    </div>
                    <Badge variant={product.growth >= 0 ? "default" : "destructive"}>
                      {product.growth >= 0 ? '+' : ''}{product.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}