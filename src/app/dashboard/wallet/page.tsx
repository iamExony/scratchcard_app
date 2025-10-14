"use client";

import { Suspense } from "react";
import WalletPage from "./WalletPage";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading payment verification...</div>}>
      <WalletPage />
    </Suspense>
  );
}
