import React from 'react';
import { useMail } from '../../context/MailContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileCheck2, ShieldAlert, Clock, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function InvestigationsView() {
  const { setSelectedEmailId, setForensicsView, emails } = useMail();

  const investigations = [
    {
      id: 'CASE-2026-0941',
      title: 'Targeted Executive Impersonation & Wire Transfer Fraud',
      targetEmailId: 'em-002',
      severity: 'CRITICAL',
      status: 'In Progress',
      openedAt: 'Sept 09, 2026 - 11:15 AM',
      analyst: 'Milap Modi (Lead SOC)',
      tactics: ['T1566.002 - Spearphishing Link', 'T1589 - Financial Wire BEC'],
      summary: 'Spoofed communications pretending to originate from CFO David Harris demanding an immediate $48,500 swift wire transfer to a Singaporean shell corporation bank routing.',
    },
    {
      id: 'CASE-2026-0883',
      title: 'Credential Harvesting via Fake Microsoft 365 Password Reset',
      targetEmailId: 'em-004',
      severity: 'HIGH',
      status: 'Contained',
      openedAt: 'Sept 08, 2026 - 02:40 PM',
      analyst: 'Automated Playbook #M365-DEF',
      tactics: ['T1566.002 - Spearphishing Link', 'T1598.003 - Fake Login Page'],
      summary: 'Inbound message from no-reply@m1crosoft-security.com routed through a high-risk Bulgarian bulletproof host (94.156.71.182) utilizing typosquatting login-micros0ft-support.com.',
    },
    {
      id: 'CASE-2026-0792',
      title: 'DocuSign Document Exploit with Dangerous Macro Payload',
      targetEmailId: 'em-005',
      severity: 'CRITICAL',
      status: 'Remediated',
      openedAt: 'Sept 07, 2026 - 09:12 AM',
      analyst: 'Threat Heuristic Engine',
      tactics: ['T1566.001 - Spearphishing Attachment', 'T1204.002 - Malicious File Execution'],
      summary: 'Attached Agreement_Final_DocuSign.pdf contained an obfuscated JavaScript shellcode stager and malicious SHA256 executable payload hash.',
    },
  ];

  const handleOpenCaseEmail = (emailId: string) => {
    setForensicsView(null);
    setSelectedEmailId(emailId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50/50 dark:bg-[#0C0E14] text-xs">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#00C896]" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Security Operations Case Management
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Track, contain, and remediate forensic incidents across company mailboxes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => toast.success('New investigation incident case initialized')}
              className="bg-[#00C896] hover:bg-[#00b285] text-white text-xs font-medium"
            >
              + Open Incident Case
            </Button>
          </div>
        </div>

        {/* Case Cards */}
        <div className="grid gap-3.5">
          {investigations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#121620] space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {item.id}
                  </span>
                  <Badge
                    variant={item.severity === 'CRITICAL' ? 'malicious' : 'suspicious'}
                    className="text-[10px]"
                  >
                    {item.severity}
                  </Badge>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                  <Clock className="h-3 w-3" />
                  <span>{item.openedAt}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* MITRE Tactics and Analyst info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-neutral-400">MITRE Tactics:</span>
                  {item.tactics.map((t, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Assigned: {item.analyst}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCaseEmail(item.targetEmailId)}
                    className="h-6 text-[11px] border-neutral-300 dark:border-neutral-700"
                  >
                    <span>View Evidence</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
