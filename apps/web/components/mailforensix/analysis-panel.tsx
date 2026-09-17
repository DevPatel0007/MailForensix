import React, { useState } from 'react';
import { Email } from '~/types/mailforensix';
import { useMail } from '~/context/MailContext';
import { ThreatScore } from './threat-score';
import { AnalysisOverview } from './analysis-overview';
import { AuthenticationCard } from './authentication-card';
import { IpIntelligence } from './ip-intelligence';
import { DomainIntelligence } from './domain-intelligence';
import { IocList } from './ioc-list';
import { UrlAnalysis } from './url-analysis';
import { ForensicChain } from './forensic-chain';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Button } from '~/components/ui/button';
import { ShieldAlert, Sparkles, RotateCw, CheckCircle2, FileSearch } from 'lucide-react';

interface AnalysisPanelProps {
  email: Email;
}

export function AnalysisPanel({ email }: AnalysisPanelProps) {
  const { runAnalysis, analyzingEmailIds } = useMail();
  const [activeTab, setActiveTab] = useState('overview');

  const isAnalyzing = analyzingEmailIds.has(email.id);
  const analysis = email.analysis;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 bg-neutral-50/50 dark:bg-[#10131B]">
        <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <RotateCw className="h-8 w-8 text-[#00C896] animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Running MailForensix Intelligence Pipeline
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
            Evaluating cryptographic SPF/DKIM records, querying ASN routing tables, analyzing domain age, and unpacking sandbox payloads...
          </p>
        </div>
      </div>
    );
  }

  if (email.threatStatus === 'NOT_ANALYZED' || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 bg-neutral-50/40 dark:bg-[#0F121A]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
          <FileSearch className="h-6 w-6" />
        </div>
        <div className="max-w-xs space-y-1">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Awaiting Forensic Analysis
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            This message has not been deeply inspected by the automated threat sandbox yet.
          </p>
        </div>
        <Button
          onClick={() => runAnalysis(email.id)}
          className="bg-[#00C896] hover:bg-[#00b285] text-white text-xs shadow-xs font-medium"
        >
          <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
          Run Threat Scan
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FBFBFC] dark:bg-[#0E1118] border-l border-neutral-200/90 dark:border-neutral-800 overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#11141C]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#00C896]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              AI Security Intelligence
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Analyzed
            </span>
          </div>
        </div>

        {/* Risk Score Gauge Component */}
        <ThreatScore
          score={analysis.riskScore}
          confidence={analysis.confidence}
          level={analysis.riskLevel}
        />
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="px-3 pt-2 bg-white dark:bg-[#11141C] border-b border-neutral-200/90 dark:border-neutral-800">
          <TabsList className="w-full grid grid-cols-5 h-8 bg-neutral-100 dark:bg-neutral-800/70 p-0.5 rounded-md">
            <TabsTrigger value="overview" className="text-[11px] px-1 py-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="auth" className="text-[11px] px-1 py-1">
              Auth
            </TabsTrigger>
            <TabsTrigger value="network" className="text-[11px] px-1 py-1">
              Network
            </TabsTrigger>
            <TabsTrigger value="domain" className="text-[11px] px-1 py-1">
              Domain
            </TabsTrigger>
            <TabsTrigger value="iocs" className="text-[11px] px-1 py-1">
              IOCs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <TabsContent value="overview" className="mt-0 space-y-4">
            <AnalysisOverview analysis={analysis} />
            <ForensicChain analysis={analysis} sender={email.sender} />
          </TabsContent>

          <TabsContent value="auth" className="mt-0">
            <AuthenticationCard auth={analysis.authentication} />
          </TabsContent>

          <TabsContent value="network" className="mt-0">
            <IpIntelligence ip={analysis.ipIntelligence} />
          </TabsContent>

          <TabsContent value="domain" className="mt-0">
            <DomainIntelligence
              domain={analysis.domainIntelligence}
              sender={analysis.senderIntelligence}
            />
          </TabsContent>

          <TabsContent value="iocs" className="mt-0 space-y-4">
            <IocList iocs={analysis.iocs} />
            <UrlAnalysis detectedUrls={analysis.detectedUrls} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
