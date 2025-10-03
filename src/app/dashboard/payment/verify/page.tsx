"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PaymentVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    const verifyTransaction = async () => {
      const reference = searchParams.get("reference");
      
      if (!reference || !session?.user?.id) {
        toast.error("Invalid payment reference");
        setStatus("failed");
        return;
      }

      try {
        // Verify payment with our API
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
            userId: session.user.id,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          toast.success("Payment successful! Order created.");
          setStatus("success");
          
          // Redirect to orders page after 2 seconds
          setTimeout(() => {
            router.push("/dashboard/purchases");
          }, 2000);
        } else {
          toast.error(result.error || "Payment verification failed");
          setStatus("failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Payment verification failed");
        setStatus("failed");
      }
    };

    if (session?.user?.id) {
      verifyTransaction();
    }
  }, [searchParams, router, session]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment</p>
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