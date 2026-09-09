"use client";

import React, { useState } from "react";

export const CapabilitiesSection = () => {
  const [activeItem, setActiveItem] = useState(0);

  const capabilities = [
    {
      num: "01",
      title: "AI THREAT DETECTION",
      desc: "Identifies phishing, spoofing, malicious intent and suspicious patterns using LLM reasoning.",
      telemetry: "INTENT ENGINE V-4.2 // 98.4% SEMANTIC ACCURACY",
    },
    {
      num: "02",
      title: "EMAIL FORENSICS",
      desc: "Inspects RFC 5322 routing, DKIM signatures, SPF alignment and hidden metadata parameters.",
      telemetry: "PARSES 48 HEADER PARAMETERS STATISTICALLY",
    },
    {
      num: "03",
      title: "DOMAIN INTELLIGENCE",
      desc: "Investigates infrastructure age, WHOIS registrar history, and passive DNS changes.",
      telemetry: "WHOIS & PASSIVE DNS GRAPH QUERY COMPLETE",
    },
    {
      num: "04",
      title: "IP ANALYSIS",
      desc: "Evaluates originating MTA IP reputation across global threat intelligence feeds.",
      telemetry: "CORRELATED WITH 140+ REPUTATION FEEDS",
    },
    {
      num: "05",
      title: "GEOLOCATION",
      desc: "Determines physical network origins and BGP ASNs across multi-hop relay paths.",
      telemetry: "MTA HOPS RESOLVED TO EXACT COORDINATES",
    },
    {
      num: "06",
      title: "THREAT CORRELATION",
      desc: "Connects indicators and surfaces active widespread campaigns across SOC tenants.",
      telemetry: "GRAPH ENGINE LINKED TO APT CAMPAIGN IOCS",
    },
    {
      num: "07",
      title: "FORENSIC REPORTING",
      desc: "Turns raw analysis into court-ready STIX 2.1 evidence bundles with SHA-256 integrity.",
      telemetry: "IMMUTABLE SHA-256 DIGEST GENERATED",
    },
  ];

  return (
    <section className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-16">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-4">
            07 // CAPABILITIES LIST
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] font-sans">
            System Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 border-t border-b border-[#1A1A1A] divide-y divide-[#1A1A1A]">
            {capabilities.map((item, idx) => {
              const isHovered = activeItem === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveItem(idx)}
                  className={`py-6 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 group ${
                    isHovered ? "text-[#F5F5F5]" : "text-[#555555]"
                  }`}
                >
                  <div className="flex items-baseline gap-4 font-mono">
                    <span className="text-xs">{item.num}</span>
                    <span className="text-lg font-bold tracking-tight uppercase group-hover:text-[#F5F5F5]">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-[#A0A0A0] max-w-sm">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 border border-[#1A1A1A] bg-[#080808] p-8 font-mono text-xs flex flex-col justify-between min-h-[360px] sticky top-28">
            <div>
              <div className="text-[#555555] text-[10px] uppercase tracking-wider mb-2">
                TELEMETRY PREVIEW // ITEM {capabilities[activeItem]!.num}
              </div>
              <h3 className="text-xl font-bold text-[#F5F5F5] mb-4">
                {capabilities[activeItem]!.title}
              </h3>
              <p className="text-[#A0A0A0] leading-relaxed mb-6 font-sans text-sm">
                {capabilities[activeItem]!.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-[#1A1A1A] text-[#F5F5F5] font-mono text-[11px]">
              <span className="text-[#555555] block text-[10px] uppercase">ACTIVE SYSTEM PROCESS</span>
              {capabilities[activeItem]!.telemetry}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
