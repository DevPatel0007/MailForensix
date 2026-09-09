"use client";

import React, { useState } from "react";

export const HeaderForensics = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const headers = [
    {
      field: "From",
      value: '"Acme Executive Billing" <billing@secure-payments.co>',
      flag: "DOMAIN MISMATCH",
      details: "Display name claims Acme Corp, but envelope domain secure-payments.co was registered 14 days ago.",
      severity: "critical",
    },
    {
      field: "Reply-To",
      value: "financial-ops@bad-relays.net",
      flag: "UNTRUSTED INFRASTRUCTURE",
      details: "Replies redirected away from From domain to an unauthorized external mail transfer agent.",
      severity: "critical",
    },
    {
      field: "Return-Path",
      value: "<bounce@bad-relays.net>",
      flag: "AUTHENTICATION ANOMALY",
      details: "Envelope sender mismatch violates strict SPF alignment policies.",
      severity: "warning",
    },
    {
      field: "Received",
      value: "from mail.bad-relays.net (185.220.101.45) by mx.google.com with ESMTPS",
      flag: "SUSPICIOUS ROUTE",
      details: "Originating MTA IP 185.220.101.45 belongs to an offshore bulletproof host ASN.",
      severity: "warning",
    },
    {
      field: "Message-ID",
      value: "<20260902142200.8849@bad-relays.net>",
      flag: "HEADER FORGERY",
      details: "Message-ID structure matches automated bulk phishing toolkit generator.",
      severity: "info",
    },
    {
      field: "Authentication-Results",
      value: "mx.google.com; dkim=fail header.i=@secure-payments.co; spf=softfail",
      flag: "AUTHENTICATION FAILURE",
      details: "Cryptographic DKIM signature failed verification. SPF record softfailed.",
      severity: "critical",
    },
  ];

  return (
    <section id="headers" className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-16">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-4">
            02 // HEADER TELEMETRY
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] font-sans">
            Read beyond the message.
          </h2>
          <p className="text-[#A0A0A0] text-lg mt-4 font-sans">
            Raw email RFC 5322 headers contain immutable timestamps, cryptographic signatures, and routing telemetry.
          </p>
        </div>

        <div className="border border-[#1A1A1A] bg-[#080808] font-mono text-xs">
          <div className="border-b border-[#1A1A1A] px-6 py-3.5 flex items-center justify-between text-[#A0A0A0]">
            <span>RFC 5322 HEADER ANOMALY INSPECTOR</span>
            <span>6 ANOMALIES IDENTIFIED</span>
          </div>

          <div className="divide-y divide-[#1A1A1A]">
            {headers.map((h, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-6 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected ? "bg-[#0B0B0B]" : "hover:bg-[#0B0B0B]/50"
                  }`}
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[#555555] font-bold w-36 uppercase">{h.field}:</span>
                      <span className="text-[#F5F5F5] font-mono break-all">{h.value}</span>
                    </div>
                    {isSelected && (
                      <p className="text-[#A0A0A0] text-[11px] pt-2 pl-36 leading-relaxed">
                        {h.details}
                      </p>
                    )}
                  </div>

                  <span
                    className={`font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 border whitespace-nowrap self-start md:self-center ${
                      h.severity === "critical"
                        ? "border-rose-900/60 text-rose-400 bg-rose-950/20"
                        : h.severity === "warning"
                        ? "border-amber-900/60 text-amber-400 bg-amber-950/20"
                        : "border-[#1A1A1A] text-[#A0A0A0]"
                    }`}
                  >
                    {h.flag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
