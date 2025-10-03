import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Navigation from "@/components/landing/Navigation";
import ProductsSection from "@/components/landing/ProductSection";
import "./globals.css";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <Hero />
      <ProductsSection />
      <Footer />
    </div>
  );
}
