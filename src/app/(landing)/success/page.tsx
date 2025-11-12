"use client";
export const dynamic = "force-dynamic";
import { Suspense } from "react";
import SuccessPage from "./SuccessPage";

export default function SuccessClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
          </div>
        </div>
      }
    >
      <SuccessPage />
    </Suspense>
  );
}