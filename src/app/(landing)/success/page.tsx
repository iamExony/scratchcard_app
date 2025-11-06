"use client";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const reference = params.get("ref");

  return (
    <div className="w-[90%] md:w-[40%] mx-auto mt-10 text-center">
      <h1 className="text-2xl font-semibold text-green-600 mb-4">Payment Successful!</h1>
      <p>Your transaction was successful. Check your email for your scratch card details.</p>
      <p className="mt-2 text-gray-600">Reference: {reference}</p>
    </div>
  );
}
