import Navigation from "@/components/landing/Navigation";
import "./globals.css";
import { LoadingOverlayProvider } from "@/components/landing/LoadingOverlay";
import Footer from "@/components/landing/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white min-h-screen">
      <LoadingOverlayProvider>
        
        <main className="w-full mx-auto max-w-[1600px] px-0 ">
          {children}
        </main>
        
      </LoadingOverlayProvider>
    </div>
  );
}