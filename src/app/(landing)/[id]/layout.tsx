import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  );
}
