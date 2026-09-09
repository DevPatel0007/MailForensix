"use client";

import React, { useState } from "react";

export const InvestigationDemo = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: "Suspicious Payload",
      leftTitle: "RAW SMTP EMAIL MESSAGE",
      leftContent: `From: "Acme Executive Billing" <billing@secure-payments.co>
To: analyst@company.com
Subject: Urgent account verification required
Date: Wed, 02 Sep 2026 14:22:00 +0000

Dear Finance Team,

Please verify your corporate credentials immediately at the secure link below to prevent account suspension.

Link: https://secure-payments.co/verify-login`,
      rightTitle: "INGESTION STATUS",
      rightContent: [
        "MIME payload parsed (RFC 5322)",
        "Headers extracted: 48 parameters",
        "Target URL identified: secure-payments.co",
      ],
    },
    {
      label: "Threat Indicators",
      leftTitle: "IOC INDICATOR MATRIX",
      leftContent: `1. DOMAIN: secure-payments.co (Registered 14 days ago)
2. IP: 185.220.101.45 (Flagged in 14 threat feeds)
3. IMPERSONATION: Acme Executive Billing vs secure-payments.co
4. EXPLOIT URL: https://secure-payments.co/verify-login`,
      rightTitle: "IOC SCORE",
      rightContent: [
        "4 Critical threat indicators matched",
        "Domain age anomaly: 14 days",
        "Credential harvesting vector detected",
      ],
    },
    {
      label: "Infrastructure",
      leftTitle: "ROUTING & HOST TELEMETRY",
      leftContent: `Origin IP: 185.220.101.45
Network ASN: AS44050 (CyberRoute Ltd.)
SPF Record: SOFTFAIL
DKIM Status: FAIL (Signature mismatch)
Relay Hops: 4 MTAs Traversed`,
      rightTitle: "INFRASTRUCTURE VERDICT",
      rightContent: [
        "Offshore bulletproof host ASN",
        "Authentication policy softfailed",
        "Anonymizing proxy MTAs detected",
      ],
    },
    {
      label: "Forensic Report",
      leftTitle: "STIX 2.1 EVIDENCE BUNDLE",
      leftContent: `{
  "type": "indicator",
  "id": "indicator--e3b0c442-8849-2026",
  "name": "Phish-EU-2026-99A",
  "pattern": "[domain-name:value = 'secure-payments.co']",
  "valid_from": "2026-09-02T14:22:00Z",
  "confidence": 96.4
}`,
      rightTitle: "EVIDENCE INTEGRITY",
      rightContent: [
        "SHA-256 Digest generated",
        "STIX 2.1 JSON Schema validated",
        "SIEM auto-push ready",
      ],
    },
  ];

  const current = steps[activeStep]!;

  return (
    <section id="evidence" className="py-32 bg-[#050505] border-t border-[#1A1A1A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mb-16">
          <span className="font-mono text-xs text-[#555555] uppercase tracking-widest block mb-4">
            06 // THE CLIMAX
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] font-sans">
            From message to evidence.
          </h2>
          <p className="text-[#A0A0A0] text-lg mt-4 font-sans">
            The raw message transforms into verifiable, structured forensic intelligence ready for incident response.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 font-mono text-xs">
          {steps.map((st, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-4 py-2 border transition-all whitespace-nowrap ${
                activeStep === idx
                  ? "border-[#F5F5F5] bg-[#0B0B0B] text-[#F5F5F5]"
                  : "border-[#1A1A1A] text-[#555555] hover:text-[#A0A0A0]"
              }`}
            >
              0{idx + 1}. {st.label}
            </button>
          ))}
        </div>

        <div className="border border-[#1A1A1A] bg-[#080808] grid grid-cols-1 lg:grid-cols-12 font-mono text-xs">
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-[#1A1A1A]">
            <div className="text-[#555555] text-[10px] uppercase mb-4 tracking-wider">
              {current.leftTitle}
            </div>
            <pre className="text-[#F5F5F5] whitespace-pre-wrap leading-relaxed font-mono bg-[#050505] p-5 border border-[#1A1A1A] min-h-[220px]">
              {current.leftContent}
            </pre>
          </div>

          <div className="lg:col-span-5 p-6 flex flex-col justify-between">
            <div>
              <div className="text-[#555555] text-[10px] uppercase mb-4 tracking-wider">
                {current.rightTitle}
              </div>

              <div className="space-y-3 mb-6">
                {current.rightContent.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-[#1A1A1A] bg-[#050505] text-[#A0A0A0]"
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between text-[11px]">
              <span className="text-[#555555]">STATUS: VERIFIED</span>
              <span className="text-[#F5F5F5] font-semibold">SHA-256 MATCH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
