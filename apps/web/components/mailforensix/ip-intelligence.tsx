import React from 'react';
import { ForensicAnalysis } from '~/types/mailforensix';
import { Server, MapPin, Copy } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { toast } from 'sonner';

interface IpIntelligenceProps {
  ip: ForensicAnalysis['ipIntelligence'];
}

export function IpIntelligence({ ip }: IpIntelligenceProps) {
  const copyIp = () => {
    navigator.clipboard.writeText(ip.sourceIp);
    toast.success(`IP ${ip.sourceIp} copied to clipboard`);
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Primary IP Header Card */}
      <div className="p-3.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Originating Node (Relay)
          </span>
          {ip.isTorOrVpn ? (
            <Badge variant="malicious" className="text-[10px]">
              Proxy / Bulletproof Exit Node
            </Badge>
          ) : (
            <Badge variant="safe" className="text-[10px]">
              Direct Corporate Gateway
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#00C896]" />
            <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {ip.sourceIp}
            </span>
          </div>
          <button
            type="button"
            onClick={copyIp}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="Copy IP Address"
          >
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Geolocation & Routing Matrix */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <span className="text-[10px] text-neutral-400 block mb-0.5">Location</span>
          <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200 truncate">
            <MapPin className="h-3 w-3 text-neutral-500 shrink-0" />
            <span className="truncate">{ip.city}, {ip.country} ({ip.countryCode})</span>
          </div>
        </div>

        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <span className="text-[10px] text-neutral-400 block mb-0.5">Autonomous System</span>
          <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200 block truncate">
            {ip.asn}
          </span>
        </div>

        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 col-span-2">
          <span className="text-[10px] text-neutral-400 block mb-0.5">ISP / Infrastructure Provider</span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 block truncate">
            {ip.isp}
          </span>
        </div>

        <div className="p-2.5 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 col-span-2">
          <span className="text-[10px] text-neutral-400 block mb-0.5">Registered Organization</span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 block truncate">
            {ip.organization}
          </span>
        </div>
      </div>

      {/* Threat Reputation Score Meter */}
      <div className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#151821] space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-500 dark:text-neutral-400">IP Reputation Trust Index</span>
          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
            {ip.reputationScore} / 100
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              ip.reputationScore > 75
                ? 'bg-emerald-500'
                : ip.reputationScore > 40
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${ip.reputationScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
