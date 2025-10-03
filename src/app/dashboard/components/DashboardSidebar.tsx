"use client";
import {
  LayoutDashboard,
  FileText,
  History,
  ShoppingCart,
  Activity,
  Wallet,
  CreditCard,
  Ticket,
  Award,
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
import '../theme.css'


const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "e-Statement", url: "/statement", icon: FileText },
  { title: "Payment History", url: "/dashboard/payments", icon: History },
  { title: "Purchase History", url: "/purchases", icon: ShoppingCart },
  { title: "View Activity", url: "/activity", icon: Activity },
];

const productItems = [
  { title: "WAEC Pin", url: "/products/waec", icon: Award },
  { title: "NECO Token", url: "/products/neco", icon: Ticket },
  { title: "NABTEB Pin", url: "/products/nabteb", icon: CreditCard },
  { title: "NECO Card", url: "/products/neco-card", icon: Wallet },
];

export function DashboardSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <div className="px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            {open && (
              <span className="text-sidebar-foreground font-semibold text-lg">
                Resultpins
              </span>
            )}
          </div>
          
          {open && (
            <div className="mt-6 p-3 bg-sidebar-accent rounded-lg">
              <p className="text-sm text-sidebar-foreground font-medium">Welcome!</p>
              <p className="text-xs text-sidebar-foreground/70 mt-1">Ekemini Okon</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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

        <SidebarGroup>
          <SidebarGroupLabel>Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {productItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
      </SidebarContent>
    </Sidebar>
  );
}
