// components/admin/StatsGrid.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";

interface StatsGridProps {
  stats: {
    totalUsers: number;
    totalCards: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    usedCards: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Cards",
      value: stats.totalCards.toLocaleString(),
      icon: Package,
      description: "Available scratch cards",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      description: "All-time orders",
      trend: "+18%",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total earnings",
      trend: "+22%",
      trendUp: true,
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      description: "Awaiting processing",
      trend: "-3%",
      trendUp: false,
    },
    {
      title: "Used Cards",
      value: stats.usedCards.toLocaleString(),
      icon: CheckCircle,
      description: "Cards delivered",
      trend: "+8%",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            <div className={`flex items-center text-xs mt-1 ${
              stat.trendUp ? "text-green-600" : "text-red-600"
            }`}>
              {stat.trendUp ? "↑" : "↓"} {stat.trend} from last month
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}