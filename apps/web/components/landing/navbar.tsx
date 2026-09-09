"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/90 backdrop-blur-md border-b border-[#1A1A1A] py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-mono text-sm tracking-widest font-semibold uppercase text-[#F5F5F5]">
            MAIL<span className="text-[#A0A0A0]">FORENSIX</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-xs font-mono tracking-wider text-[#A0A0A0]">
          <a href="#story" className="hover:text-[#F5F5F5] transition-colors duration-150">
            Product
          </a>
          <a href="#intelligence" className="hover:text-[#F5F5F5] transition-colors duration-150">
            Intelligence
          </a>
          <a href="#pipeline" className="hover:text-[#F5F5F5] transition-colors duration-150">
            How it works
          </a>
          <a href="#evidence" className="hover:text-[#F5F5F5] transition-colors duration-150">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link href="/login" className="text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors px-2 py-1">
            Log in
          </Link>
          <Link href="/signup">
            <Button className="bg-[#F5F5F5] hover:bg-white text-[#050505] font-mono font-medium text-xs px-4 py-2 rounded-none border border-[#F5F5F5] transition-all">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
