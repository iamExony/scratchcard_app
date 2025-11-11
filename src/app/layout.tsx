import type { Metadata } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "sonner";
import { PageLoader } from "@/components/PageLoader";
import { NavigationLoader } from "@/components/NavigationLoader";

export const metadata: Metadata = {
  title: "Scratchcard App",
  description: "A platform for managing users and pins",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <PageLoader />
          <NavigationLoader />
          {children}
          <Toaster position="top-right" richColors />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
