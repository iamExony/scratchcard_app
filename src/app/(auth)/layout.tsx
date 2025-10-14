import type { Metadata } from "next";
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
      
          <Header />
          <Navigation />
          {children}
          <Footer />
         
      </body>
    </html>
  );
}
