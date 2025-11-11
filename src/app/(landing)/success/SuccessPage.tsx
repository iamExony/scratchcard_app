"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    const verify = async () => {
      const ref = searchParams.get("reference");
      if (!ref) {
        toast.error("Invalid reference");
        setStatus("failed");
        return;
      }
      try {
        const res = await fetch("/api/payments/verify/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: ref }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          toast.success("Payment confirmed!");
          setTimeout(() => router.push("/"), 20000);
        } else {
          setStatus("failed");
          toast.error(data.error || "Verification failed");
        }
      } catch {
        setStatus("failed");
        toast.error("Something went wrong");
      }
    };
    verify();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0F1F] flex items-center justify-center p-4 overflow-hidden">

      {/* Background effects */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600 rounded-full blur-[160px] opacity-50" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500 rounded-full blur-[150px] opacity-40" />

      {/* Main card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

        {/* STATUS SWITCH */}
        {status === "verifying" && (
          <div className="text-center space-y-5 bg-">
            <div className="mx-auto w-20 h-20 border-[6px] border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Verifying Payment
            </h2>
            <p className="text-gray-300 text-sm">Confirming your transaction, hold tight...</p>
            <p className="text-[11px] text-gray-500 font-mono mt-2">
              REF: {searchParams.get("reference")}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-5 animate-fadeIn">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-white">Payment Successful!</h2>
            <p className="text-gray-300 text-sm">Redirecting you shortly...</p>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 animate-progress"></div>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center space-y-5 animate-fadeIn">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-400 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-white">Payment Failed</h2>
            <p className="text-gray-300 text-sm">Please retry or contact support</p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all shadow-lg hover:scale-[1.03]"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(10px);}
          to {opacity: 1; transform: translateY(0);}
        }
        @keyframes progress {
          from {width: 0%}
          to {width: 100%}
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out }
        .animate-progress { animation: progress 4s linear forwards }
      `}</style>
    </div>
  );
}
