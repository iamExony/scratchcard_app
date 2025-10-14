import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-foreground">Scratchcard</span>
              <span className="text-primary">.com</span>
            </Link>
          </div>

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
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <a href="login">Login</a>
            </Button>
            <Button size="sm">
              <a href="register">Register</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
