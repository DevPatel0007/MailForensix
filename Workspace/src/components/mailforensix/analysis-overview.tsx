import React from 'react';
import { ForensicAnalysis } from '../../types';
import { ThreatBadge } from './threat-badge';
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Target, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnalysisOverviewProps {
  analysis: ForensicAnalysis;
}

export function AnalysisOverview({ analysis }: AnalysisOverviewProps) {
  return (
    <div className="space-y-4 text-xs">
      {/* 1. Threat Classification Box */}
      <div className="p-3.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#151821] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Threat Classification
          </span>
          <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
            Confidence: <strong className="text-neutral-900 dark:text-neutral-100">{analysis.confidence}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight">
            {analysis.threatClassification}
          </span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
          {analysis.summary}
        </p>
      </div>

      {/* 2. AI Explanation */}
      <div className="p-3.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720] space-y-2">
        <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-[#00C896]" />
          <span>AI Forensic Reasoning</span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
          {analysis.aiExplanation}
        </p>
      </div>

      {/* 3. Behavioral Indicators */}
      {analysis.behavioralIndicators && analysis.behavioralIndicators.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block px-0.5">
            Behavioral Flags ({analysis.behavioralIndicators.length})
          </span>
          <div className="space-y-1.5">
            {analysis.behavioralIndicators.map((bi) => (
              <div
                key={bi.id}
                className={cn(
                  'p-2.5 rounded-md border text-xs flex items-start gap-2',
                  bi.severity === 'critical'
                    ? 'bg-red-50/70 border-red-200/80 text-red-900 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-200'
                    : bi.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800 dark:bg-neutral-900/60 dark:border-neutral-800 dark:text-neutral-200'
                )}
              >
                {bi.severity === 'critical' ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                ) : bi.severity === 'warning' ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-neutral-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block text-[11px]">{bi.type}</span>
                  <span className="text-[11px] opacity-90 leading-normal">{bi.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MITRE ATT&CK Mapping */}
      {analysis.mitreAttack && analysis.mitreAttack.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 text-[10px] font-semibold uppercase tracking-wider">
            <Target className="h-3 w-3 text-red-500" />
            <span>MITRE ATT&amp;CK Techniques</span>
          </div>
          <div className="grid gap-1.5">
            {analysis.mitreAttack.map((tech) => (
              <div
                key={tech.techniqueId}
                className="flex items-center justify-between p-2 rounded border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                    {tech.techniqueId}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {tech.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  {tech.tactic}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
