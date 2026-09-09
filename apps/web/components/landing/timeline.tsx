"use client";

import React, { useState } from "react";

export const TimelineSection = () => {
  const [activeStep, setActiveStep] = useState(7);

  const stages = [
    { name: "CONTENT", detail: "Extracted high urgency financial coercion vector", status: "PASSED" },
    { name: "HEADER", detail: "SPF softfail & DKIM signature mismatch detected", status: "FLAGGED" },
    { name: "IDENTITY", detail: "Executive display name spoofing identified", status: "FLAGGED" },
    { name: "DOMAIN", detail: "Lookalike domain registered 14 days ago", status: "FLAGGED" },
    { name: "IP", detail: "Originating MTA 185.220.101.45 on bulletproof network", status: "FLAGGED" },
    { name: "GEOLOCATION", detail: "Origin resolved to Bucharest, Romania (AS44050)", status: "RESOLVED" },
    { name: "THREAT INTELLIGENCE", detail: "Matched APT-Phish-EU-99A campaign feed", status: "CORRELATED" },
    { name: "FORENSIC VERDICT", detail: "High risk spearphishing attempt. Quarantined.", status: "HIGH RISK" },
  ];

  return (
    <section className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-16">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-4">
            05 // ANALYTICAL PIPELINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] font-sans">
            Understand why it matters.
          </h2>
          <p className="text-[#A0A0A0] text-lg mt-4 font-sans">
            Every analytical stage exposes the reasoning, metrics, and contributing indicators leading to the final verdict.
          </p>
        </div>

        <div className="border border-[#1A1A1A] bg-[#080808] font-mono text-xs divide-y divide-[#1A1A1A]">
          <div className="px-6 py-3.5 text-[#555555] flex justify-between">
            <span>PIPELINE STAGE</span>
            <span>FINDING & STATUS</span>
          </div>

          {stages.map((stg, idx) => {
            const isActive = idx <= activeStep;
            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-5 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isActive ? "bg-[#0B0B0B]" : "opacity-40"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#555555] font-semibold w-8">0{idx + 1}</span>
                  <span className="text-[#F5F5F5] font-bold w-44">{stg.name}</span>
                  <span className="text-[#A0A0A0] text-[11px] hidden md:inline">{stg.detail}</span>
                </div>

                <span
                  className={`text-[10px] tracking-wider uppercase font-semibold self-start md:self-center ${
                    stg.status === "HIGH RISK" || stg.status === "FLAGGED"
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {stg.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 border border-[#1A1A1A] bg-[#0B0B0B] p-6 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[#F5F5F5] font-bold text-sm">THREAT DETECTED: HIGH RISK</span>
          </div>

          <div className="flex items-center gap-8 text-[#A0A0A0]">
            <span>CONFIDENCE: <strong className="text-[#F5F5F5]">96.4%</strong></span>
            <span>VERDICT ID: <strong className="text-[#F5F5F5]">V-2026-88049</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
