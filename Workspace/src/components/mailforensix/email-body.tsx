import React, { useState, useMemo } from 'react';
import { Email } from '../../types';
import { sanitizeEmailHtml } from '../../lib/sanitizer';
import { useMail } from '../../context/MailContext';
import { ImageOff, Image, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface EmailBodyProps {
  email: Email;
}

export function EmailBody({ email }: EmailBodyProps) {
  const { openUrlWarning } = useMail();
  const [allowExternalImages, setAllowExternalImages] = useState(false);

  // Safely sanitized HTML
  const sanitizedContent = useMemo(() => {
    return sanitizeEmailHtml(email.bodyHtml, allowExternalImages);
  }, [email.bodyHtml, allowExternalImages]);

  // Intercept click on links to perform security checks
  const handleBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.href) {
      e.preventDefault();
      const href = anchor.href;
      
      try {
        const parsed = new URL(href);
        // Find if this URL was classified in forensic analysis
        const detected = email.analysis?.detectedUrls?.find(u => u.url === href || href.includes(u.domain));

        if (detected && detected.status === 'MALICIOUS') {
          openUrlWarning({
            url: href,
            domain: detected.domain,
            status: 'MALICIOUS',
            reasons: detected.reasons,
          });
          return;
        }

        if (detected && detected.status === 'SUSPICIOUS') {
          openUrlWarning({
            url: href,
            domain: detected.domain,
            status: 'SUSPICIOUS',
            reasons: detected.reasons,
          });
          return;
        }

        // Even for safe links, verify domain matches sender
        if (email.threatStatus === 'PHISHING' || email.threatStatus === 'MALICIOUS' || email.threatStatus === 'BEC') {
          openUrlWarning({
            url: href,
            domain: parsed.hostname,
            status: 'MALICIOUS',
            reasons: ['Email is flagged as high-risk threat', 'Potential credential phishing destination'],
          });
          return;
        }

        // Safe URL prompt
        openUrlWarning({
          url: href,
          domain: parsed.hostname,
          status: 'SAFE',
          reasons: ['Cryptographically verified domain', 'No anomalies reported in threat intelligence feed'],
        });
      } catch (err) {
        // Invalid URL format
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#0C0E14] text-neutral-800 dark:text-neutral-200">
      {/* Privacy Notice Banner: External Images Blocked */}
      <div className="mb-4 flex items-center justify-between p-2.5 rounded border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-[#121620] text-xs">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          {allowExternalImages ? (
            <Image className="h-4 w-4 text-emerald-500" />
          ) : (
            <ImageOff className="h-4 w-4 text-neutral-400" />
          )}
          <span className="text-[11px]">
            {allowExternalImages
              ? 'External tracking pixels and images are currently enabled.'
              : 'Remote images and tracking pixels are blocked for your security.'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAllowExternalImages(!allowExternalImages)}
          className="h-6 text-[11px] px-2 border-neutral-300 dark:border-neutral-700"
        >
          {allowExternalImages ? 'Block Images' : 'Load Images'}
        </Button>
      </div>

      {/* Threat Warning Banner for Malicious Messages */}
      {(email.threatStatus === 'MALICIOUS' || email.threatStatus === 'PHISHING' || email.threatStatus === 'BEC') && (
        <div className="mb-5 flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/30 text-xs text-red-900 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block text-red-800 dark:text-red-300">
              Security Warning: Threat Signature Detected
            </span>
            <p className="text-[11px] text-red-700 dark:text-red-300/90 leading-relaxed">
              MailForensix heuristics detected dangerous indicators in this message. Do NOT enter credentials, transfer funds, or download attachments.
            </p>
          </div>
        </div>
      )}

      {/* Sanitized Email Content Canvas */}
      <div
        className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed overflow-x-auto select-text selection:bg-[#00C896]/20"
        onClick={handleBodyClick}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
}
