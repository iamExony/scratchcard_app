"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide loader after initial mount
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative">
          {/* Outer rotating circle */}
          <div className="h-20 w-20 border-4 border-blue-200 rounded-full animate-spin mx-auto"></div>
          {/* Inner rotating circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-700 animate-pulse">
          Loading Scratchcard.com...
        </p>
      </div>
    </div>
  );
}