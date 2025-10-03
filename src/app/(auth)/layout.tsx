import type { Metadata } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./globals.css";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";


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
          <Header />
          <Navigation />
          {children}
          <Footer />
          </SessionProviderWrapper>
      </body>
    </html>
  );
}
