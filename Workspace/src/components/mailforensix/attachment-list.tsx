import React from 'react';
import { EmailAttachment } from '../../types';
import { FileText, FileCode, FileArchive, Download, Eye, ShieldAlert, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface AttachmentListProps {
  attachments?: EmailAttachment[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) return null;

  const copyHash = (hash?: string) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    toast.success('SHA-256 hash copied to clipboard');
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.exe') || name.endsWith('.dll') || name.endsWith('.bat')) {
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    }
    if (name.endsWith('.html') || name.endsWith('.js') || name.endsWith('.py')) {
      return <FileCode className="h-4 w-4 text-amber-500" />;
    }
    if (name.endsWith('.zip') || name.endsWith('.tar') || name.endsWith('.gz')) {
      return <FileArchive className="h-4 w-4 text-neutral-500" />;
    }
    return <FileText className="h-4 w-4 text-neutral-500" />;
  };

  return (
    <div className="border-t border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#0F121A] p-4 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[10px]">
          Attachments ({attachments.length})
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">
          Antivirus &amp; Static Threat Sandboxing
        </span>
      </div>

      <div className="grid gap-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center justify-between p-2.5 rounded-md border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141720]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0">
                {getFileIcon(att.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate" title={att.name}>
                    {att.name}
                  </span>
                  <Badge
                    variant={
                      att.status === 'Clean'
                        ? 'safe'
                        : att.status === 'Suspicious'
                        ? 'suspicious'
                        : 'malicious'
                    }
                    className="text-[10px] py-0 px-1.5"
                  >
                    {att.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                  <span>{att.size}</span>
                  {att.sha256 && (
                    <button
                      type="button"
                      onClick={() => copyHash(att.sha256)}
                      className="flex items-center gap-1 hover:text-neutral-600 dark:hover:text-neutral-300"
                      title="Click to copy SHA-256 hash"
                    >
                      <span>SHA256: {att.sha256.slice(0, 10)}...</span>
                      <Copy className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px] border-neutral-200 dark:border-neutral-700"
                onClick={() => toast.info(`Viewing sandbox metadata for ${att.name}`)}
              >
                <Eye className="h-3 w-3 mr-1" />
                <span>View</span>
              </Button>
              <Button
                variant={att.status === 'Malicious' ? 'destructive' : 'outline'}
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() => {
                  if (att.status === 'Malicious') {
                    toast.error('Download blocked: High-risk malware detected');
                  } else {
                    toast.success(`Download started: ${att.name}`);
                  }
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
