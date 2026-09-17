import React from 'react';
import { cn } from '../../lib/utils';
import { Shield, ShieldAlert, AlertTriangle } from 'lucide-react';

interface ThreatScoreProps {
  score: number;
  confidence?: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ThreatScore({ score, confidence, level, size = 'md', className }: ThreatScoreProps) {
  const getScoreColor = (val: number) => {
    if (val < 25) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30' };
    if (val < 65) return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30' };
    return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500', border: 'border-red-500/30' };
  };

  const getComputedLevel = (val: number) => {
    if (level) return level;
    if (val < 25) return 'LOW RISK';
    if (val < 65) return 'MODERATE RISK';
    if (val < 85) return 'HIGH RISK';
    return 'CRITICAL';
  };

  const colors = getScoreColor(score);
  const computedLevel = getComputedLevel(score);

  return (
    <div className={cn('flex items-center justify-between p-3.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#151821]', className)}>
      <div className="flex items-center gap-3">
        {/* Visual score circle indicator */}
        <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
          <span className={cn('text-base font-bold font-mono', colors.text)}>
            {score}
          </span>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 absolute -bottom-1 font-mono">
            /100
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-bold tracking-wider', colors.text)}>
              {computedLevel}
            </span>
            {confidence && (
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                {confidence}% Confidence
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {score < 25 ? 'Verified authentic headers & domain' : score < 65 ? 'Anomalies detected in mail transit' : 'Severe security compromise markers identified'}
          </p>
        </div>
      </div>

      {/* Mini indicator icon */}
      <div className="hidden sm:block">
        {score < 25 ? (
          <Shield className="h-5 w-5 text-emerald-500/80" />
        ) : score < 65 ? (
          <AlertTriangle className="h-5 w-5 text-amber-500/80" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-red-500/80" />
        )}
      </div>
    </div>
  );
}
