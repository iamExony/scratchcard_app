"use client";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoadingOverlay } from "./LoadingOverlay";

// const bgImages = [
//   "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop",
//   "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop",
//   "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1920&h=1080&fit=crop"
// ];


const Hero = () => {
  const router = useRouter();
  const { show: showLoader } = useLoadingOverlay();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Background slider


  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
      });
    };
    const node = heroRef.current;
    if (node) node.addEventListener("mousemove", handleMouseMove);
    return () => { if (node) node.removeEventListener("mousemove", handleMouseMove); };
  }, []);

  return (
  <section ref={heroRef} className="relative min-h-[700px] flex items-center justify-center overflow-hidden bg-secondary-hero">
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 mt-24 leading-tight tracking-tight text-black">
          <span className="block">Scratch, Reveal,</span>
          <span className="block"><span className="">Get Results</span> Instantly!</span>
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-black max-w-2xl mx-auto">
          Experience the fastest, most secure way to buy and manage exam scratch cards in Nigeria.<br />
          {/* <span className="font-semibold text-blue-700">Trusted by thousands. Seamless digital delivery, 24/7 support, and unbeatable value.</span> */}
        </p>
        <div className="flex flex-col mb-24 sm:flex-row gap-4 justify-center items-center mt-8">
          <Button size="lg" className="rounded-md cursor-pointer bg-primary-landing hover:bg-primary-landing/80 text-white font-semibold px-10 py-6 text-xl transition-all duration-200 border-0" onClick={() => { showLoader(); router.push("/register"); }}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="rounded-md cursor-pointer font-semibold px-10 py-6 text-xl hover:text-primary-landing transition-all duration-200" onClick={() => { showLoader(); router.push("/login"); }}>
            Login
          </Button>
        </div>
          <div className="w-full flex justify-center">
            <Image
              src="/cards/hero-image.webp"
              alt="Scratchcard Hero"
              width={1200}
              height={400}
              className="rounded-2xl w-full max-w-2xl md:max-w-3xl lg:max-w-7xl h-auto object-cover"
              priority
            />
          </div>
      </div>
    </section>
  );
};

export default Hero;
