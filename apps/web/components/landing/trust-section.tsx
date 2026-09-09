"use client";

import React from "react";

export const TrustSection = () => {
  const steps = [
    { num: "01", name: "DETECT", desc: "Identify anomalous headers & semantic intent" },
    { num: "02", name: "TRACE", desc: "Follow routing hops & BGP ASN telemetry" },
    { num: "03", name: "CORRELATE", desc: "Cross-reference global IOC threat feeds" },
    { num: "04", name: "EXPLAIN", desc: "Provide transparent step-by-step reasoning" },
    { num: "05", name: "REPORT", desc: "Output STIX 2.1 evidence with SHA-256 integrity" },
  ];

  return (
    <section className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-16">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-6">
            08 // THE FORENSIC PARADIGM
          </span>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F5F5] leading-[1.08] mb-8 font-sans">
            Detection is only the beginning.
          </h2>

          <p className="text-xl sm:text-3xl text-[#A0A0A0] font-light leading-relaxed font-sans max-w-3xl">
            MailForensix helps you trace the evidence behind every suspicious message.
          </p>
        </div>

        <div className="mt-16 pt-12 border-t border-[#1A1A1A] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 font-mono text-xs">
          {steps.map((st, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[#555555] text-[10px] block">{st.num}</span>
              <span className="text-[#F5F5F5] font-bold text-base block">{st.name}</span>
              <p className="text-[#A0A0A0] text-xs font-sans leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
