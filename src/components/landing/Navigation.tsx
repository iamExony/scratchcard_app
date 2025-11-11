"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {  Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLoadingOverlay } from "./LoadingOverlay";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/", section: "home" },
  { label: "About", href: "#about", section: "about" },
  { label: "Pricing", href: "#pricing", section: "pricing" },
  { label: "Products", href: "#products", section: "products" },
  { label: "Contact", href: "#contact", section: "contact" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { show: showLoader } = useLoadingOverlay();
  const router = useRouter();

  // Helper for smooth scroll
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setActiveSection(sectionId); // Set active immediately
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  // Listen to scroll to update active nav
  useEffect(() => {
    const handleScroll = () => {
      const offsets = navLinks.map(link => {
        if (link.section === "home") return { section: "home", top: 0 };
        const el = document.getElementById(link.section);
        return el ? { section: link.section, top: el.getBoundingClientRect().top + window.scrollY } : null;
      }).filter(Boolean);
      const scrollY = window.scrollY + 80;
      let current = "home";
      for (let i = 0; i < offsets.length; i++) {
        if (scrollY >= offsets[i].top) {
          current = offsets[i].section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="bg-white py-2 border-b border-border sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Image src="/cards/ddcl-logo-small.png" alt="Logo" width={32} height={32} className="rounded-full" priority />
            <span className="text-primary-landing text-black">Scratchcard</span>
            <span className="">.com</span>
          </Link>
          {/* Centered Nav Items */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            {navLinks.map(link => (
              link.section === "home" ? (
                <Link
                  key={link.section}
                  href={link.href}
                  className={`font-semibold transition-colors ${activeSection === link.section ? "text-primary-landing" : "text-black hover:text-primary-landing"}`}
                  onClick={() => setActiveSection(link.section)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.section}
                  href={link.href}
                  className={`font-medium transition-colors ${activeSection === link.section ? "text-primary-landing" : "text-black hover:text-primary-landing"}`}
                  onClick={e => {
                    setActiveSection(link.section); // Set active immediately
                    handleSmoothScroll(e, link.section);
                  }}
                >
                  {link.label}
                </a>
              )
            ))}
          </div>
          {/* Login/Register at right */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary-landing text-primary-landing font-semibold shadow-sm hover:bg-primary-landing/10"
              onClick={() => {
                showLoader();
                router.push("/login");
              }}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-primary-landing text-white font-semibold shadow-md hover:bg-primary-landing/80"
              onClick={() => {
                showLoader();
                router.push("/register");
              }}
            >
              Register
            </Button>
          </div>
          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-border shadow-lg animate-fade-in-down">
          <div className="flex flex-col space-y-4 px-4 py-6">
            {navLinks.map(link => (
              link.section === "home" ? (
                <Link
                  key={link.section}
                  href={link.href}
                  className={`font-semibold transition-colors ${activeSection === link.section ? "text-primary-landing" : "text-black hover:text-primary-landing"}`}
                  onClick={() => { setActiveSection(link.section); setIsOpen(false); }}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.section}
                  href={link.href}
                  className={`font-medium transition-colors ${activeSection === link.section ? "text-primary-landing" : "text-black hover:text-primary-landing"}`}
                  onClick={e => {
                    setActiveSection(link.section); // Set active immediately
                    handleSmoothScroll(e, link.section);
                    setIsOpen(false);
                  }}
                >
                  {link.label}
                </a>
              )
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full border-primary-landing text-primary-landing font-semibold hover:bg-primary-landing/10"
              onClick={() => {
                showLoader();
                router.push("/login");
                setIsOpen(false);
              }}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="w-full rounded-full bg-primary-landing text-white font-semibold shadow-md hover:bg-primary-landing/80"
              onClick={() => {
                showLoader();
                router.push("/register");
                setIsOpen(false);
              }}
            >
              Register
            </Button>
          </div>
        </div>

      )}
    </nav>
  );
}

export default Navigation;
