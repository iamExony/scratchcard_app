// components/LogoutButton.tsx
"use client";
"../dashboard/theme.css"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        // Redirect to login page
        router.push("/login");
        router.refresh(); // Refresh to clear any cached auth state
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      
      onClick={handleLogout}
      disabled={loading}
      className="w-full justify-start"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}