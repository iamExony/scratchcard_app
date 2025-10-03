// components/admin/QuickActions.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Users,
  Package,
  Mail,
  Download,
  Settings,
} from "lucide-react";

const quickActions = [
  {
    title: "Upload Cards",
    description: "Add new scratch cards to inventory",
    icon: Upload,
    variant: "default" as const,
    onClick: () => console.log("Upload cards"),
  },
  {
    title: "Manage Users",
    description: "View and manage user accounts",
    icon: Users,
    variant: "outline" as const,
    onClick: () => console.log("Manage users"),
  },
  {
    title: "Inventory",
    description: "View available card stock",
    icon: Package,
    variant: "outline" as const,
    onClick: () => console.log("View inventory"),
  },
  {
    title: "Bulk Email",
    description: "Send emails to multiple users",
    icon: Mail,
    variant: "outline" as const,
    onClick: () => console.log("Bulk email"),
  },
  {
    title: "Export Data",
    description: "Download reports and data",
    icon: Download,
    variant: "outline" as const,
    onClick: () => console.log("Export data"),
  },
  {
    title: "System Settings",
    description: "Configure system preferences",
    icon: Settings,
    variant: "outline" as const,
    onClick: () => console.log("System settings"),
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-center justify-center gap-2"
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}