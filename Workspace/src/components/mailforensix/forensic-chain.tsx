import React from 'react';
import { ForensicAnalysis, SenderInfo } from '../../types';
import { Mail, User, Server, Globe, MapPin, Link2, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ForensicChainProps {
  analysis: ForensicAnalysis;
  sender: SenderInfo;
}

export function ForensicChain({ analysis, sender }: ForensicChainProps) {
  const steps = [
    {
      title: 'Inbound Envelope',
      subtitle: sender.name,
      icon: Mail,
      isRisk: analysis.riskScore > 65,
    },
    {
      title: 'Sender Identity',
      subtitle: sender.email,
      icon: User,
      isRisk: !analysis.authentication.aligned,
    },
    {
      title: 'Transit Relay IP',
      subtitle: analysis.ipIntelligence.sourceIp,
      icon: Server,
      isRisk: analysis.ipIntelligence.isTorOrVpn || analysis.ipIntelligence.reputationScore < 50,
    },
    {
      title: 'Origin Network',
      subtitle: analysis.ipIntelligence.asn.slice(0, 14),
      icon: Globe,
      isRisk: false,
    },
    {
      title: 'Geographic Node',
      subtitle: `${analysis.ipIntelligence.city}, ${analysis.ipIntelligence.countryCode}`,
      icon: MapPin,
      isRisk: false,
    },
    {
      title: 'Domain Provenance',
      subtitle: analysis.domainIntelligence.domain,
      icon: Globe,
      isRisk: !!analysis.domainIntelligence.typosquattingTarget,
    },
    ...(analysis.detectedUrls && analysis.detectedUrls.length > 0
      ? [
          {
            title: 'Target Payload',
            subtitle: analysis.detectedUrls[0].domain,
            icon: Link2,
            isRisk: analysis.detectedUrls[0].status === 'MALICIOUS',
          },
        ]
      : []),
  ];

  return (
    <div className="p-3.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720] space-y-3 text-xs">
      <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        <span>Forensic Chain of Custody</span>
        <span>Hop Provenance</span>
      </div>

      <div className="flex flex-col space-y-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                  step.isRisk
                    ? 'border-red-400 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-850 dark:text-neutral-300'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase">
                    Step {idx + 1}: {step.title}
                  </span>
                  {step.isRisk && (
                    <span className="text-[9px] font-mono text-red-600 dark:text-red-400 uppercase font-bold">
                      Anomaly
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  {step.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
