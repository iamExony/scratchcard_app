// app/admin/layout.tsx
"use client";

import { AdminSidebar } from "./components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner"
import "../dashboard/theme.css"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Toaster />
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
          
      </div>
    </SidebarProvider>
  );
}