import React from 'react';
import { ForensicAnalysis } from '~/types/mailforensix';
import { Globe, AlertTriangle, Calendar, Server, Copy } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { toast } from 'sonner';

interface DomainIntelligenceProps {
  domain: ForensicAnalysis['domainIntelligence'];
  sender: ForensicAnalysis['senderIntelligence'];
}

export function DomainIntelligence({ domain, sender }: DomainIntelligenceProps) {
  const copyDomain = () => {
    navigator.clipboard.writeText(domain.domain);
    toast.success(`Domain ${domain.domain} copied`);
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Typosquatting Alert if detected */}
      {domain.typosquattingTarget && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/30 text-red-900 dark:text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[11px] block">
              Lookalike Domain / Typosquatting Alert
            </span>
            <p className="text-[11px] text-red-800 dark:text-red-300 mt-0.5">
              Domain <strong className="font-mono">{domain.domain}</strong> appears to impersonate target:{' '}
              <strong className="font-mono underline">{domain.typosquattingTarget}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Domain Card */}
      <div className="p-3.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            WHOIS &amp; Domain Registration
          </span>
          <Badge
            variant={
              domain.reputation.includes('Blacklisted') || domain.reputation.includes('Flagged')
                ? 'malicious'
                : domain.reputation.includes('Uncategorized')
                ? 'suspicious'
                : 'safe'
            }
            className="text-[10px]"
          >
            {domain.reputation.includes('Blacklisted') ? 'Blacklisted' : 'Monitored'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="h-4 w-4 text-[#00C896] shrink-0" />
            <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
              {domain.domain}
            </span>
          </div>
          <button
            type="button"
            onClick={copyDomain}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
          >
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Domain Attributes Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <span className="text-[10px] text-neutral-400 block mb-0.5">Registrar</span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 block truncate">
            {domain.registrar}
          </span>
        </div>

        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <span className="text-[10px] text-neutral-400 block mb-0.5">Domain Age</span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 block truncate">
            {sender.domainAge}
          </span>
        </div>

        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <span className="text-[10px] text-neutral-400 block mb-0.5">Creation Date</span>
          <div className="flex items-center gap-1 font-mono text-neutral-700 dark:text-neutral-300">
            <Calendar className="h-3 w-3 text-neutral-400 shrink-0" />
            <span>{domain.created}</span>
          </div>
        </div>

        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <span className="text-[10px] text-neutral-400 block mb-0.5">Expiration Date</span>
          <div className="flex items-center gap-1 font-mono text-neutral-700 dark:text-neutral-300">
            <Calendar className="h-3 w-3 text-neutral-400 shrink-0" />
            <span>{domain.expires}</span>
          </div>
        </div>
      </div>

      {/* Authoritative Name Servers */}
      {domain.dnsServers && domain.dnsServers.length > 0 && (
        <div className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720] space-y-1.5">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider">
            <Server className="h-3 w-3" />
            <span>Authoritative Nameservers</span>
          </div>
          <div className="space-y-1 font-mono text-[10px] text-neutral-600 dark:text-neutral-300">
            {domain.dnsServers.map((ns, idx) => (
              <div key={idx} className="p-1 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                {ns}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
