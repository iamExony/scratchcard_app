"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Wallet, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function WalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [transaction, setTransaction] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verifyDeposit = async () => {
      const depositStatus = searchParams.get("deposit");
      const reference = searchParams.get("reference");

      console.log("🔍 Deposit callback params:", { depositStatus, reference });

      if (!reference) {
        setStatus("error");
        setErrorMessage("No transaction reference found");
        return;
      }

      try {
        // Use GET request to verify payment
        const verifyResponse = await fetch(`/api/payments/verify?reference=${reference}`);
        const verifyData = await verifyResponse.json();

        console.log("📄 Verification response:", verifyData);

        if (!verifyResponse.ok) {
          throw new Error(verifyData.error || "Verification failed");
        }

        if (verifyData.data?.status === "success") {
          setStatus("success");
          setTransaction(verifyData.data);
          toast.success("Deposit completed successfully!");

          // Refresh user data
          setTimeout(() => {
            window.dispatchEvent(new Event('storage'));
          }, 1000);
        } else {
          setStatus("error");
          setErrorMessage(verifyData.data?.gateway_response || verifyData.message || "Payment not successful");
          toast.error("Deposit verification failed");
        }
      } catch (error) {
        console.error("Deposit verification error:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Failed to verify deposit");
        toast.error("Failed to verify deposit");
      }
    };

    verifyDeposit();
  }, [searchParams]);

  const handleRetryVerification = async () => {
    const reference = searchParams.get("reference");
    if (!reference) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const verifyResponse = await fetch(`/api/payments/verify?reference=${reference}`);
      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.data?.status === "success") {
        setStatus("success");
        setTransaction(verifyData.data);
        toast.success("Deposit verified successfully!");
      } else {
        setStatus("error");
        setErrorMessage(verifyData.error || verifyData.data?.gateway_response || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Verification failed. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleViewTransactions = () => {
    router.push("/dashboard/transactions");
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Deposit</h2>
            <p className="text-muted-foreground">Please wait while we verify your transaction...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {status === "success" ? (
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Deposit Successful!</CardTitle>
            <CardDescription>
              Your wallet has been funded successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Amount:</span>
                  <p className="text-lg font-bold text-green-600">
                    ₦{transaction ? (transaction.amount / 100).toLocaleString() : '0'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Status:</span>
                  <p className="text-green-600 font-medium">Completed</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-muted-foreground">Reference:</span>
                  <p className="font-mono text-xs break-all">{transaction?.reference}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-muted-foreground">Date:</span>
                  <p>{transaction?.paid_at ? new Date(transaction.paid_at).toLocaleString() : new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleViewTransactions}
              >
                <Wallet className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Deposit Failed</CardTitle>
            <CardDescription>
              {errorMessage || "We couldn't process your deposit"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-600 text-center">
                {errorMessage || "Your transaction was not completed. Please check your payment details and try again."}
              </p>
              {searchParams.get("reference") && (
                <p className="text-xs text-red-600 text-center mt-2">
                  Reference: {searchParams.get("reference")}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                className="flex-1"
                onClick={handleRetryVerification}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}