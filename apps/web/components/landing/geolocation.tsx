"use client";

import React from "react";

export const GeolocationSection = () => {
  return (
    <section id="intelligence" className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-16">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-4">
            04 // GEOGRAPHIC TELEMETRY
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] font-sans">
            See where it came from.
          </h2>
          <p className="text-[#A0A0A0] text-lg mt-4 font-sans">
            Triangulate the origin of originating mail transfer agents through BGP routing tables and hop coordinates.
          </p>
        </div>

        <div className="border border-[#1A1A1A] bg-[#080808] p-6 sm:p-8 font-mono text-xs">
          <div className="border-b border-[#1A1A1A] pb-4 mb-6 flex items-center justify-between text-[#A0A0A0]">
            <span>GLOBAL MTA ROUTE TELEMETRY</span>
            <span>IP: 185.220.101.45</span>
          </div>

          <div className="relative w-full h-[320px] bg-[#050505] border border-[#1A1A1A] overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full text-[#1A1A1A]" viewBox="0 0 800 400" fill="none" stroke="currentColor">
              <path d="M140 100 Q 240 70, 300 140 T 200 240 Z" fill="#0B0B0B" stroke="#1A1A1A" strokeWidth="1" />
              <path d="M400 90 Q 560 50, 700 110 T 580 260 Z" fill="#0B0B0B" stroke="#1A1A1A" strokeWidth="1" />
              <path d="M460 210 Q 520 230, 500 330 T 440 270 Z" fill="#0B0B0B" stroke="#1A1A1A" strokeWidth="1" />

              <path d="M 450 140 L 510 145 L 545 160" stroke="#555555" strokeWidth="1" strokeDasharray="3 3" />

              <circle cx="545" cy="160" r="4" fill="#F5F5F5" />
              <circle cx="545" cy="160" r="8" stroke="#F5F5F5" strokeWidth="1" className="animate-ping opacity-40" />
            </svg>

            <div className="absolute top-[38%] left-[64%] bg-[#0B0B0B] border border-[#1A1A1A] px-3 py-1.5 font-mono text-[11px] text-[#F5F5F5]">
              ORIGIN: Eastern Europe (RO)
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1A1A1A] grid grid-cols-2 md:grid-cols-4 gap-4 text-[#A0A0A0]">
            <div>
              <span className="text-[#555555] text-[10px] block">ORIGIN REGION</span>
              <span className="text-[#F5F5F5]">Eastern Europe</span>
            </div>
            <div>
              <span className="text-[#555555] text-[10px] block">CONFIDENCE</span>
              <span className="text-[#F5F5F5]">94.8%</span>
            </div>
            <div>
              <span className="text-[#555555] text-[10px] block">HOST ASN</span>
              <span className="text-[#F5F5F5]">AS44050 (CyberRoute)</span>
            </div>
            <div>
              <span className="text-[#555555] text-[10px] block">RELAY HOPS</span>
              <span className="text-[#F5F5F5]">4 MTAs Traversed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
