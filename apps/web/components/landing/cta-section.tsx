"use client";

import React from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export const CTASection = () => {
  return (
    <section className="py-44 bg-[#050505] border-t border-[#1A1A1A] relative text-center">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F5F5] leading-[1.08] mb-8 font-sans">
          The next suspicious email <br className="hidden sm:inline" />
          shouldn&apos;t be a mystery.
        </h2>

        <p className="text-lg sm:text-xl text-[#A0A0A0] max-w-xl mx-auto leading-relaxed mb-12 font-sans">
          Investigate the signal behind the message.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 font-mono text-xs">
          <Link href="/signup">
            <Button className="bg-[#F5F5F5] hover:bg-white text-[#050505] font-mono font-medium text-xs px-8 py-6 rounded-none border border-[#F5F5F5] transition-all">
              Start investigating
            </Button>
          </Link>
          <a href="#story" className="text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors py-3">
            Explore MailForensix →
          </a>
        </div>
      </div>
    </section>
  );
};
