// components/AdminSidebar.tsx
"use client";

import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Upload,
  History,
  CreditCard,
  Mail,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Scratch Cards", url: "/admin/cards", icon: CreditCard },
  //{ title: "Upload Cards", url: "/admin/upload", icon: Upload },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Email Management", url: "/admin/email", icon: Mail },
  { title: "Transactions", url: "/admin/transactions", icon: History },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar">
      <SidebarContent>
        <div className="px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            {open && (
              <span className="text-sidebar-foreground font-semibold text-lg">
                Admin Panel
              </span>
            )}
          </div>
          
          {open && (
            <div className="mt-6 p-3 bg-sidebar-accent rounded-lg">
              <p className="text-sm text-sidebar-foreground font-medium">Admin Access</p>
              <p className="text-xs text-sidebar-foreground/70 mt-1">Full System Control</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
         {/* Logout Section */}
        <div className="mt-auto p-4 border-t">
          <LogoutButton />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}