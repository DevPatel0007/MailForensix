import React from 'react';
import { ForensicAnalysis } from '../../types';
import { Copy, ShieldAlert, Link2, Globe, Server, Hash } from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface IocListProps {
  iocs: ForensicAnalysis['iocs'];
}

export function IocList({ iocs }: IocListProps) {
  const copyIoc = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`Copied IOC: ${val}`);
  };

  const getIocIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <Link2 className="h-3.5 w-3.5 text-red-500" />;
      case 'domain':
        return <Globe className="h-3.5 w-3.5 text-amber-500" />;
      case 'ip':
        return <Server className="h-3.5 w-3.5 text-purple-500" />;
      case 'hash':
      default:
        return <Hash className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  if (!iocs || iocs.length === 0) {
    return (
      <div className="p-6 text-center text-neutral-400 text-xs">
        No indicators of compromise recorded for this message.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        <span>Artifacts &amp; IOCs ({iocs.length})</span>
        <span>Threat Feed Export</span>
      </div>

      <div className="space-y-2">
        {iocs.map((ioc, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-md border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720] flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0">
                {getIocIcon(ioc.type)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
                    {ioc.type}
                  </span>
                  <Badge
                    variant={
                      ioc.threatLevel === 'high' || ioc.threatLevel === 'MALICIOUS'
                        ? 'malicious'
                        : ioc.threatLevel === 'medium' || ioc.threatLevel === 'SUSPICIOUS'
                        ? 'suspicious'
                        : 'safe'
                    }
                    className="text-[9px] py-0 px-1"
                  >
                    {ioc.threatLevel}
                  </Badge>
                </div>
                <div
                  className="font-mono text-neutral-800 dark:text-neutral-200 text-[11px] truncate mt-0.5"
                  title={ioc.value}
                >
                  {ioc.value}
                </div>
                {ioc.description && (
                  <span className="text-[10px] text-neutral-400 block truncate mt-0.5">
                    {ioc.description}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyIoc(ioc.value)}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer shrink-0"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
