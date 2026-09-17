import React from 'react';
import { Email } from '~/types/mailforensix';
import { useMail } from '~/context/MailContext';
import { ThreatBadge } from './threat-badge';
import { Button } from '~/components/ui/button';
import { 
  Reply, 
  Forward, 
  Archive, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  RotateCw, 
  ArrowLeft
} from 'lucide-react';

interface EmailHeaderProps {
  email: Email;
  onBackToList?: () => void;
}

export function EmailHeader({ email, onBackToList }: EmailHeaderProps) {
  const { 
    runAnalysis, 
    analyzingEmailIds, 
    archiveEmails, 
    deleteEmails, 
    setIsComposeOpen 
  } = useMail();

  const isAnalyzing = analyzingEmailIds.has(email.id);

  const handleReply = () => {
    setIsComposeOpen(true);
  };

  const handleForward = () => {
    setIsComposeOpen(true);
  };

  const handleArchive = () => {
    archiveEmails([email.id]);
  };

  const handleDelete = () => {
    deleteEmails([email.id]);
  };

  const handleTriggerAnalysis = () => {
    runAnalysis(email.id);
  };

  return (
    <div className="border-b border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#11141C] p-4">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1">
          {onBackToList && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToList}
              className="md:hidden text-xs gap-1 mr-1 text-neutral-600 dark:text-neutral-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleReply}
            className="text-xs h-7 border-neutral-200 dark:border-neutral-700"
          >
            <Reply className="h-3 w-3 mr-1" />
            <span>Reply</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForward}
            className="text-xs h-7 border-neutral-200 dark:border-neutral-700"
          >
            <Forward className="h-3 w-3 mr-1" />
            <span>Forward</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            title="Archive email"
            className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <Archive className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            title="Delete email"
            className="text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Security Scan Trigger Button */}
        <div>
          <Button
            variant={email.threatStatus === 'NOT_ANALYZED' ? 'default' : 'outline'}
            size="sm"
            onClick={handleTriggerAnalysis}
            disabled={isAnalyzing}
            className={`text-xs h-7 font-medium ${
              email.threatStatus === 'NOT_ANALYZED'
                ? 'bg-[#00C896] hover:bg-[#00b285] text-white shadow-xs'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RotateCw className="h-3 w-3 mr-1.5 animate-spin text-emerald-500" />
                <span>Analyzing Forensic Pipeline...</span>
              </>
            ) : email.threatStatus === 'NOT_ANALYZED' ? (
              <>
                <ShieldAlert className="h-3 w-3 mr-1.5" />
                <span>Run Full Forensic Analysis</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1.5 text-[#00C896]" />
                <span>Re-Analyze Threat</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Subject Line & Threat Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug break-words">
          {email.subject}
        </h2>
        <ThreatBadge status={email.threatStatus} />
      </div>

      {/* Sender and Recipient metadata block */}
      <div className="flex items-start justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {email.sender.avatar ? (
            <img
              src={email.sender.avatar}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700 bg-neutral-100 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 font-bold shrink-0">
              {email.sender.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {email.sender.name}
              </span>
              <span className="text-neutral-400 dark:text-neutral-500 text-[11px] font-mono truncate">
                &lt;{email.sender.email}&gt;
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              to <span className="font-medium text-neutral-700 dark:text-neutral-300">{email.recipient.name}</span> &lt;{email.recipient.email}&gt;
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
          {email.date}
        </div>
      </div>
    </div>
  );
}
