"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // const { data: session } = useSession();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    const verifyTransaction = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        toast.error("Invalid payment reference");
        setStatus("failed");
        return;
      }

      try {
        console.log("🔍 Verifying payment with reference:", reference);

        // Verify payment with our API
        const response = await fetch("/api/payments/verify/guest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference
          }),
        });

        const result = await response.json();

        console.log("📦 Verification API response:", result);

        if (response.ok && result.success) {
          // Success case - whether it's new or existing transaction
          if (result.data?.existing) {
            toast.success("Payment successful! Your order was already processed.");
          } else {
            toast.success("Payment successful! Order created.");
          }
          setStatus("success");

          // Redirect to orders page after 2 seconds
          setTimeout(() => {
            router.push("/");
          }, 5000);
        } else {
          // Actual failure case
          console.error("❌ Payment verification failed:", result.error);
          toast.error(result.error || "Payment verification failed");
          setStatus("failed");
        }
      } catch (error) {
        console.error("💥 Verification error:", error);
        // Even if verification API fails, the payment might still be successful
        // Let's check if we can find the transaction
        try {
          const checkResponse = await fetch(`/api/check-orders?reference=${searchParams.get("reference")}`);
          const checkResult = await checkResponse.json();

          if (checkResult.success && checkResult.orders > 0) {
            // Orders exist, so payment was successful
            toast.success("Payment successful! Your order has been processed.");
            setStatus("success");
            setTimeout(() => {
              router.push("/dashboard/purchases");
            }, 2000);
          } else {
            toast.error("Payment status uncertain. Please check your orders.");
            setStatus("failed");
          }
        } catch {
          toast.error("Payment verification failed. Please check your orders.");
          setStatus("failed");
        }
      }
    };
      verifyTransaction();

  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment</p>
            <p className="text-xs text-muted-foreground mt-2">
              Reference: {searchParams.get("reference")}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-success">Payment Successful!</h2>
            <p className="text-muted-foreground">Redirecting to your purchases...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-destructive">Payment Failed</h2>
            <p className="text-muted-foreground mb-4">Please try again or contact support</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
