import Footer from "@/components/landing/Footer";
//import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Navigation from "@/components/landing/Navigation";
import ProductsSection from "@/components/landing/ProductSection";
import AboutSection from "@/components/landing/AboutSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ContactSection from "@/components/landing/ContactSection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import WhatsAppButton from "@/components/landing/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <section id="products">
        <ProductsSection />
      </section>
      <section id="about">
        <AboutSection />
      </section>
      <TestimonialsSection />
      <section id="pricing">{/* <PricingSection /> */}</section>
      <section id="contact">
        <ContactSection />
      </section>
      <NewsletterSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}