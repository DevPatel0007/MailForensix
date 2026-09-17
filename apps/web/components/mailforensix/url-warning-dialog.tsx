"use client";

import React from 'react';
import { useMail } from '~/context/MailContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { ShieldAlert, ShieldCheck, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function UrlWarningDialog() {
  const { safeUrlWarning, closeUrlWarning } = useMail();

  if (!safeUrlWarning || !safeUrlWarning.isOpen) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(safeUrlWarning.url);
    toast.success('URL copied to clipboard');
  };

  const handleProceed = () => {
    closeUrlWarning();
    window.open(safeUrlWarning.url, '_blank', 'noopener,noreferrer');
  };

  const isDangerous = safeUrlWarning.status === 'MALICIOUS' || safeUrlWarning.status === 'SUSPICIOUS';

  return (
    <Dialog open={safeUrlWarning.isOpen} onOpenChange={closeUrlWarning}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isDangerous ? (
              <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold">
                {isDangerous ? 'Security Intercept: Suspicious Link' : 'External Link Verification'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                MailForensix isolated URL inspection and protection sandbox.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          {/* Target URL box */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Destination URL
            </span>
            <div className="p-2.5 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 break-all flex items-start justify-between gap-2">
              <span>{safeUrlWarning.url}</span>
              <button
                type="button"
                onClick={copyUrl}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer shrink-0"
                title="Copy URL"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Classification Reasons */}
          {safeUrlWarning.reasons && safeUrlWarning.reasons.length > 0 && (
            <div className="p-3 rounded-md bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 text-red-900 dark:text-red-200 space-y-1.5">
              <span className="font-semibold block text-[11px]">
                Threat Heuristic Warnings:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-800 dark:text-red-300">
                {safeUrlWarning.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            {isDangerous
              ? 'Opening this URL in your default browser could expose you to phishing, credential theft, or malicious script execution.'
              : 'You are navigating outside your corporate security sandbox to an external web property.'}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={closeUrlWarning} className="text-xs">
            Cancel (Stay Safe)
          </Button>
          <Button
            variant={isDangerous ? 'destructive' : 'default'}
            size="sm"
            onClick={handleProceed}
            className="text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            <span>Proceed Anyway</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
