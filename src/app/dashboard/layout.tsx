import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "./components/DashboardLayout";
import { Toaster } from "@/components/ui/sonner"
import './theme.css'


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      
      <main className="min-h-screen flex w-full">
        <DashboardLayout>
        {children}
        </DashboardLayout>
        <Toaster />
      </main>
    </SidebarProvider>
  )
}