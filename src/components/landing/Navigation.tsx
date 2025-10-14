"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <span className="text-foreground">Scratchcard</span>
            <span className="text-primary">.com</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-primary font-medium hover:text-primary-hover transition-colors">
              Home
            </Link>
            <Link href="#" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
                Products
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <Link href="#" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Button variant="outline" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm">
              <Link href="/register">Register</Link>
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
        <div className="md:hidden bg-background border-t border-border">
          <div className="flex flex-col space-y-4 px-4 py-6">
            <Link href="/" className="text-primary font-medium hover:text-primary-hover transition-colors">
              Home
            </Link>
            <Link href="#" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              Products
              <ChevronDown className="h-4 w-4" />
            </button>
            <Link href="#" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Button variant="outline" size="sm" className="w-full">
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" className="w-full">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
