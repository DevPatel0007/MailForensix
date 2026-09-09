"use client";

import React, { useState } from "react";

export const AIDetection = () => {
  const [activeNode, setActiveNode] = useState(0);

  const nodes = [
    {
      type: "EMAIL",
      label: "SUSPICIOUS PAYLOAD",
      metadata: "Subject: Urgent account verification required",
      details: "Raw RFC 5322 MIME structure parsed with embedded executive wire instructions.",
    },
    {
      type: "DOMAIN",
      label: "secure-payments.co",
      metadata: "Age: 14 Days // Registrar: Privacy Proxy",
      details: "Newly registered domain posing as legitimate financial infrastructure.",
    },
    {
      type: "IP",
      label: "185.220.101.45",
      metadata: "Reputation: Flagged in 14 Feeds",
      details: "Originating MTA IP associated with offshore bulletproof hosting.",
    },
    {
      type: "NETWORK",
      label: "AS44050 (CyberRoute)",
      metadata: "Routing: 4 MTA Hops Traversed",
      details: "Autonomous System Number registered under high-risk hosting provider.",
    },
    {
      type: "LOCATION",
      label: "Eastern Europe (Bucharest)",
      metadata: "Coordinates: 44.4323, 26.1063",
      details: "Resolved physical origin location of originating mail transfer agent.",
    },
  ];

  return (
    <section id="pipeline" className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-16">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-4">
            03 // RELATIONSHIP GRAPH
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] font-sans">
            Trace the signal.
          </h2>
          <p className="text-[#A0A0A0] text-lg mt-4 font-sans">
            Connect isolated email payloads to physical infrastructure networks and adversary campaign clusters.
          </p>
        </div>

        <div className="border border-[#1A1A1A] bg-[#080808] p-8 font-mono text-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 overflow-x-auto pb-6 border-b border-[#1A1A1A]">
            {nodes.map((node, idx) => {
              const isActive = activeNode === idx;
              return (
                <React.Fragment key={idx}>
                  <div
                    onClick={() => setActiveNode(idx)}
                    className={`p-4 border transition-all cursor-pointer min-w-[200px] ${
                      isActive
                        ? "border-[#F5F5F5] bg-[#0B0B0B] text-[#F5F5F5]"
                        : "border-[#1A1A1A] text-[#555555] hover:text-[#A0A0A0] hover:border-[#333333]"
                    }`}
                  >
                    <div className="text-[10px] text-[#555555] mb-1">NODE 0{idx + 1}</div>
                    <div className="font-semibold text-sm mb-1">{node.type}</div>
                    <div className="text-[11px] truncate text-[#A0A0A0]">{node.label}</div>
                  </div>

                  {idx < nodes.length - 1 && (
                    <div className="hidden lg:block text-[#1A1A1A] text-lg">→</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-8 pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4">
              <span className="text-[#555555] text-[10px] block mb-1 uppercase">SELECTED NODE METADATA</span>
              <span className="text-[#F5F5F5] text-sm font-semibold">{nodes[activeNode]!.label}</span>
            </div>

            <div className="md:col-span-8 border-l border-[#1A1A1A] pl-6 text-[#A0A0A0] leading-relaxed">
              <span className="text-[#555555] block text-[10px] uppercase mb-1">TECHNICAL SUMMARY</span>
              {nodes[activeNode]!.details}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
