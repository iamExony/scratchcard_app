import type { Metadata } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

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
          {children}
          </SessionProviderWrapper>
      </body>
    </html>
  );
}
