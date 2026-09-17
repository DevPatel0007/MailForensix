import React from 'react';
import { Email } from '~/types/mailforensix';
import { useMail } from '~/context/MailContext';
import { ThreatBadge } from './threat-badge';
import { Checkbox } from '~/components/ui/checkbox';
import { Star, Paperclip } from 'lucide-react';
import { cn } from '~/lib/utils';

interface EmailRowProps {
  key?: React.Key;
  email: Email;
  isSelectedInList: boolean;
  isActiveOpen: boolean;
  onSelectRow: (email: Email) => void;
}

export function EmailRow({ email, isSelectedInList, isActiveOpen, onSelectRow }: EmailRowProps) {
  const { toggleSelectEmail, toggleStar, analyzingEmailIds } = useMail();
  const isAnalyzing = analyzingEmailIds.has(email.id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelectEmail(email.id);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar(email.id);
  };

  return (
    <div
      onClick={() => onSelectRow(email)}
      className={cn(
        'group relative flex items-center gap-2.5 px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800/80 cursor-pointer transition-colors text-xs select-none',
        // Unread styling
        !email.isRead && 'bg-[#F9FBFB] dark:bg-[#121620]/60 font-medium',
        email.isRead && 'bg-white dark:bg-[#0E1118]/80 text-neutral-600 dark:text-neutral-400',
        // Hover state
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/60',
        // Selected via checkbox
        isSelectedInList && 'bg-emerald-50/60 dark:bg-emerald-950/20',
        // Currently opened email in detail view
        isActiveOpen && 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-2 border-[#00C896] dark:border-[#00D4A4]'
      )}
    >
      {/* 1. Checkbox */}
      <div className="flex items-center shrink-0" onClick={handleCheckboxClick}>
        <Checkbox
          checked={isSelectedInList}
          onCheckedChange={() => toggleSelectEmail(email.id)}
          aria-label={`Select email from ${email.sender.name}`}
        />
      </div>

      {/* 2. Star */}
      <button
        type="button"
        onClick={handleStarClick}
        className="text-neutral-300 hover:text-amber-400 dark:text-neutral-600 dark:hover:text-amber-400 transition-colors p-0.5 shrink-0"
        title={email.isStarred ? 'Unstar message' : 'Star message'}
      >
        <Star
          className={cn(
            'h-3.5 w-3.5',
            email.isStarred ? 'fill-amber-400 text-amber-400' : 'stroke-[1.5]'
          )}
        />
      </button>

      {/* 3. Sender Identity (Avatar / Name) */}
      <div className="flex items-center gap-2 w-36 sm:w-44 shrink-0 truncate">
        {email.sender.avatar ? (
          <img
            src={email.sender.avatar}
            alt=""
            className="h-5 w-5 rounded-full object-cover shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700 bg-neutral-100"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 shrink-0">
            {email.sender.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className={cn(
            'truncate tracking-tight',
            !email.isRead ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'text-neutral-700 dark:text-neutral-300'
          )}
          title={`${email.sender.name} <${email.sender.email}>`}
        >
          {email.sender.name}
        </span>
      </div>

      {/* 4. Subject + Preview Snippet */}
      <div className="flex items-baseline gap-2 flex-1 min-w-0">
        <span
          className={cn(
            'truncate max-w-[280px] sm:max-w-md shrink-0',
            !email.isRead ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'text-neutral-800 dark:text-neutral-200'
          )}
        >
          {email.subject}
        </span>
        <span className="hidden md:inline truncate text-neutral-400 dark:text-neutral-500 text-[11px] font-normal">
          — {email.snippet}
        </span>
      </div>

      {/* 5. Attachment icon indicator if present */}
      {email.attachments && email.attachments.length > 0 && (
        <span className="hidden sm:flex items-center text-neutral-400 dark:text-neutral-500 shrink-0" title={`${email.attachments.length} attachment(s)`}>
          <Paperclip className="h-3 w-3" />
        </span>
      )}

      {/* 6. Threat Status Badge */}
      <div className="shrink-0">
        {isAnalyzing ? (
          <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 animate-pulse">
            Scanning...
          </span>
        ) : (
          <ThreatBadge status={email.threatStatus} />
        )}
      </div>

      {/* 7. Formatted Date */}
      <div className="w-16 text-right shrink-0 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
        {email.date}
      </div>
    </div>
  );
}
