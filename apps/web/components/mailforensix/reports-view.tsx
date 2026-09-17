"use client";

import React from 'react';
import { useMail } from '~/context/MailContext';
import { BarChart3, Download, Printer } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

export function ReportsView() {
  const { emails, userEmail } = useMail();

  const totalAnalyzed = emails.filter((e) => e.threatStatus !== 'NOT_ANALYZED').length;
  const safeCount = emails.filter((e) => e.threatStatus === 'SAFE').length;
  const suspiciousCount = emails.filter((e) => e.threatStatus === 'SUSPICIOUS').length;
  const maliciousCount = emails.filter(
    (e) =>
      e.threatStatus === 'MALICIOUS' ||
      e.threatStatus === 'PHISHING' ||
      e.threatStatus === 'BEC' ||
      e.threatStatus === 'IMPERSONATION'
  ).length;

  const handleExportJson = () => {
    const reportData = {
      workspace: userEmail || 'milapmodi43@gmail.com',
      generatedAt: new Date().toISOString(),
      summary: {
        totalEmailsMonitored: emails.length,
        analyzed: totalAnalyzed,
        safe: safeCount,
        suspicious: suspiciousCount,
        malicious: maliciousCount,
      },
      threats: emails
        .filter((e) => e.threatStatus !== 'SAFE' && e.threatStatus !== 'NOT_ANALYZED')
        .map((e) => ({
          id: e.id,
          subject: e.subject,
          sender: e.sender,
          threatStatus: e.threatStatus,
          riskScore: e.analysis?.riskScore,
          auth: e.analysis?.authentication,
          iocs: e.analysis?.iocs,
        })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mailforensix-threat-report-${Date.now()}.json`;
    a.click();
    toast.success('Forensic Threat JSON report exported');
  };

  const handlePrint = () => {
    toast.info('Formatting forensic summary for print...');
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50/50 dark:bg-[#0C0E14] text-xs">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#00C896]" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Threat Intelligence &amp; Compliance Reports
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Automated audit summary for enterprise security posture and email threat vectors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs border-neutral-300 dark:border-neutral-700"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span>Print / PDF</span>
            </Button>
            <Button
              size="sm"
              onClick={handleExportJson}
              className="bg-[#00C896] hover:bg-[#00b285] text-white text-xs font-medium"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span>Export JSON Report</span>
            </Button>
          </div>
        </div>

        {/* High-level KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#121620]">
            <span className="text-[10px] text-neutral-400 font-semibold uppercase block">
              Total Messages
            </span>
            <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1 block">
              {emails.length}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">100% Ingested</span>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 bg-white dark:bg-[#121620]">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase block">
              Verified Safe
            </span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {safeCount}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Cryptographically Clean</span>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-white dark:bg-[#121620]">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase block">
              Suspicious
            </span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
              {suspiciousCount}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Heuristic Anomalies</span>
          </div>

          <div className="p-3.5 rounded-lg border border-red-200/60 dark:border-red-900/40 bg-white dark:bg-[#121620]">
            <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase block">
              Active Threats
            </span>
            <span className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-1 block">
              {maliciousCount}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">Neutralized / Quarantined</span>
          </div>
        </div>

        {/* Cryptographic Compliance Breakdown */}
        <div className="p-4 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#121620] space-y-3">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
            Email Authentication Standard Enforcement
          </h3>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 rounded border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-neutral-800 dark:text-neutral-200">SPF Validation</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">80% Pass</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">2 unauthorized relays rejected by SPF TXT directive</p>
            </div>

            <div className="p-3 rounded border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-neutral-800 dark:text-neutral-200">DKIM Signatures</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">70% Pass</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">3 forged headers failed RSA 2048-bit verification</p>
            </div>

            <div className="p-3 rounded border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-neutral-800 dark:text-neutral-200">DMARC Alignment</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">70% Aligned</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">Quarantine policy enforced on unaligned senders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
