import React from 'react';
import { ForensicAnalysis } from '~/types/mailforensix';
import { Badge } from '~/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '~/lib/utils';

interface AuthenticationCardProps {
  auth: ForensicAnalysis['authentication'];
}

export function AuthenticationCard({ auth }: AuthenticationCardProps) {
  const getStatusBadge = (status: string) => {
    if (status === 'PASS') {
      return (
        <Badge variant="safe" className="text-[10px] font-mono font-bold">
          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
          PASS
        </Badge>
      );
    }
    if (status === 'SOFTFAIL' || status === 'NEUTRAL') {
      return (
        <Badge variant="suspicious" className="text-[10px] font-mono font-bold">
          <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="malicious" className="text-[10px] font-mono font-bold">
        <XCircle className="h-3 w-3 mr-1 text-red-600" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Alignment Banner */}
      <div className={cn(
        'p-3 rounded-lg border flex items-center justify-between',
        auth.aligned 
          ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200'
          : 'bg-red-50/70 border-red-200/80 text-red-900 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-200'
      )}>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <div>
            <span className="font-semibold block text-[11px]">
              DMARC Identifier Alignment
            </span>
            <span className="text-[10px] opacity-80">
              {auth.aligned
                ? 'RFC 7489 Alignment Passed: Header From strictly aligns with SPF/DKIM domains'
                : 'Alignment Failure: Header From domain differs from sending envelope'}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase">
          {auth.aligned ? 'ALIGNED' : 'UNALIGNED'}
        </span>
      </div>

      {/* Triple Security Protocol Verification */}
      <div className="space-y-2">
        {/* SPF */}
        <div className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720]">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block">SPF</span>
              <span className="text-[10px] text-neutral-400">Sender Policy Framework IP validation</span>
            </div>
            {getStatusBadge(auth.spf)}
          </div>
          {auth.spfDetails && (
            <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 break-all mt-2">
              {auth.spfDetails}
            </div>
          )}
        </div>

        {/* DKIM */}
        <div className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720]">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block">DKIM</span>
              <span className="text-[10px] text-neutral-400">DomainKeys Identified Mail cryptographic signature</span>
            </div>
            {getStatusBadge(auth.dkim)}
          </div>
          {auth.dkimDetails && (
            <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 break-all mt-2">
              {auth.dkimDetails}
            </div>
          )}
        </div>

        {/* DMARC */}
        <div className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720]">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block">DMARC</span>
              <span className="text-[10px] text-neutral-400">Domain-based Message Authentication Reporting &amp; Conformance</span>
            </div>
            {getStatusBadge(auth.dmarc)}
          </div>
          {auth.dmarcDetails && (
            <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 break-all mt-2">
              {auth.dmarcDetails}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
