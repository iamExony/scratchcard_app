// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Upload
} from "lucide-react";
import { RecentOrders } from "./components/RecentOrders";
import { StatsGrid } from "./components/StatsGrid";
import { QuickActions } from "./components/QuickActions";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalCards: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  usedCards: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCards: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    usedCards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your administration panel</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            <Link href="/admin/cards/upload">Upload Cards</Link>
          </Button>
        </div>
      </div>

      <StatsGrid stats={stats} />
      <QuickActions />
      <RecentOrders />
    </div>
  );
}