"use client";

import React from "react";

export const ProblemSection = () => {
  return (
    <section className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-6">
            01 // REVEAL THE TRAIL
          </span>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F5F5] leading-[1.08] mb-8 font-sans">
            Every email leaves evidence.
          </h2>

          <p className="text-xl sm:text-3xl text-[#A0A0A0] font-light leading-relaxed font-sans max-w-3xl">
            Behind a suspicious message is a trail of identity, infrastructure, routing and intent.
          </p>

          <div className="mt-16 pt-8 border-t border-[#1A1A1A] grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-xs text-[#555555]">
            <div>
              <span className="text-[#F5F5F5] block font-semibold mb-1">01. IDENTITY</span>
              <span>Spoofed headers & display names</span>
            </div>
            <div>
              <span className="text-[#F5F5F5] block font-semibold mb-1">02. INFRASTRUCTURE</span>
              <span>Transient MTAs & rogue DNS</span>
            </div>
            <div>
              <span className="text-[#F5F5F5] block font-semibold mb-1">03. ROUTING</span>
              <span>BGP ASN & origin coordinates</span>
            </div>
            <div>
              <span className="text-[#F5F5F5] block font-semibold mb-1">04. INTENT</span>
              <span>Semantic coercion vectors</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
