"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LoadingOverlayContext = createContext({ show: () => {}, hide: () => {} });

export function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Listen for global show-loader event
    const handler = () => setVisible(true);
    window.addEventListener('show-loader', handler);
    return () => window.removeEventListener('show-loader', handler);
  }, []);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  return (
    <LoadingOverlayContext.Provider value={{ show, hide }}>
      {children}
      {visible && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center">
            <div className="h-12 w-12 border-4 border-primary-landing border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-lg font-semibold text-primary-landing">Loading...</span>
          </div>
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  return useContext(LoadingOverlayContext);
}
