"use client";

import { Suspense } from "react";
import PaymentVerificationPage from "./PaymentVerificationPage";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading payment verification...</div>}>
      <PaymentVerificationPage />
    </Suspense>
  );
}
