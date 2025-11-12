import "../dashboard/theme.css";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
// import Header from "@/components/landing/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
