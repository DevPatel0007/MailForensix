import React from 'react';
import { ThreatStatus } from '../../types';
import { Badge } from '../ui/badge';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle, ShieldAlert, UserX, FileWarning } from 'lucide-react';

interface ThreatBadgeProps {
  status: ThreatStatus;
  className?: string;
  showIcon?: boolean;
}

export function ThreatBadge({ status, className, showIcon = true }: ThreatBadgeProps) {
  switch (status) {
    case 'SAFE':
      return (
        <Badge variant="safe" className={className}>
          {showIcon && <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
          <span>SAFE</span>
        </Badge>
      );
    case 'SUSPICIOUS':
      return (
        <Badge variant="suspicious" className={className}>
          {showIcon && <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
          <span>SUSPICIOUS</span>
        </Badge>
      );
    case 'MALICIOUS':
      return (
        <Badge variant="malicious" className={className}>
          {showIcon && <AlertOctagon className="h-3 w-3 text-red-600 dark:text-red-400" />}
          <span>MALICIOUS</span>
        </Badge>
      );
    case 'PHISHING':
      return (
        <Badge variant="malicious" className={className}>
          {showIcon && <ShieldAlert className="h-3 w-3 text-red-600 dark:text-red-400" />}
          <span>PHISHING</span>
        </Badge>
      );
    case 'BEC':
      return (
        <Badge variant="malicious" className={className}>
          {showIcon && <FileWarning className="h-3 w-3 text-red-600 dark:text-red-400" />}
          <span>BEC FRAUD</span>
        </Badge>
      );
    case 'IMPERSONATION':
      return (
        <Badge variant="malicious" className={className}>
          {showIcon && <UserX className="h-3 w-3 text-red-600 dark:text-red-400" />}
          <span>SPOOFED</span>
        </Badge>
      );
    case 'NOT_ANALYZED':
      return (
        <Badge variant="notAnalyzed" className={className}>
          {showIcon && <HelpCircle className="h-3 w-3 text-neutral-400" />}
          <span>NOT ANALYZED</span>
        </Badge>
      );
    case 'UNKNOWN':
    default:
      return (
        <Badge variant="secondary" className={className}>
          <span>UNKNOWN</span>
        </Badge>
      );
  }
}
