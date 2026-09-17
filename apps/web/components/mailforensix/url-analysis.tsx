import React from 'react';
import { DetectedUrl } from '~/types/mailforensix';
import { useMail } from '~/context/MailContext';
import { Link2, ExternalLink } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

interface UrlAnalysisProps {
  detectedUrls?: DetectedUrl[];
}

export function UrlAnalysis({ detectedUrls }: UrlAnalysisProps) {
  const { openUrlWarning } = useMail();

  if (!detectedUrls || detectedUrls.length === 0) {
    return (
      <div className="p-4 rounded-md border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-center text-xs text-neutral-500">
        No external hyperlinks identified in this message body.
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        <span>Extracted Hyperlinks ({detectedUrls.length})</span>
        <span>Sandbox Verification</span>
      </div>

      <div className="space-y-2.5">
        {detectedUrls.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720] space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span className="font-mono text-neutral-800 dark:text-neutral-200 text-[11px] font-semibold truncate" title={item.domain}>
                  {item.domain}
                </span>
              </div>
              <Badge
                variant={
                  item.status === 'MALICIOUS'
                    ? 'malicious'
                    : item.status === 'SUSPICIOUS'
                    ? 'suspicious'
                    : 'safe'
                }
                className="text-[9px] py-0 px-1.5 shrink-0"
              >
                {item.status}
              </Badge>
            </div>

            <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 font-mono text-[10px] text-neutral-600 dark:text-neutral-400 break-all">
              {item.url}
            </div>

            {/* Classification Reasons */}
            {item.reasons && item.reasons.length > 0 && (
              <div className="space-y-1 pt-1">
                {item.reasons.map((reason, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action to test in isolated sandbox or prompt warning */}
            <div className="flex items-center justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[11px] border-neutral-200 dark:border-neutral-700"
                onClick={() =>
                  openUrlWarning({
                    url: item.url,
                    domain: item.domain,
                    status: item.status,
                    reasons: item.reasons,
                  })
                }
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>Sandbox URL Inspection</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
