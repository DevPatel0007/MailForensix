import React from 'react';
import { useMail } from '../../context/MailContext';
import { INITIAL_CONNECTED_ACCOUNT } from '../../data/mockEmails';
import { Shield, CheckCircle2 } from 'lucide-react';

export function MailboxHeader() {
  const { currentFolder, forensicsView, emails, folderCounts } = useMail();

  const getTitle = () => {
    if (forensicsView === 'threats') return 'Threat Intelligence Queue';
    if (forensicsView === 'investigations') return 'Active Forensic Investigations';
    if (forensicsView === 'ioc_search') return 'Global IOC Intelligence Search';
    if (forensicsView === 'reports') return 'Threat & Compliance Reports';

    switch (currentFolder) {
      case 'inbox': return 'Inbox';
      case 'important': return 'Important';
      case 'sent': return 'Sent Mail';
      case 'starred': return 'Starred';
      case 'drafts': return 'Drafts';
      case 'spam': return 'Spam Quarantine';
      case 'trash': return 'Trash';
      default: return 'Email Workspace';
    }
  };

  const getMessageStats = () => {
    if (forensicsView) return null;
    const folderKey = currentFolder as keyof typeof folderCounts;
    const totalCount = folderCounts[folderKey] || 0;
    const unreadCount = emails.filter(e => e.folder === currentFolder && !e.isRead && !e.isDeleted).length;

    return `${totalCount.toLocaleString()} messages · ${unreadCount} unread`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-neutral-200/90 dark:border-neutral-800 bg-white/70 dark:bg-[#0F121A]/70 backdrop-blur-xs">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {getTitle()}
          </h1>
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
            <Shield className="h-3 w-3 text-[#00C896]" />
            MailForensix Guard
          </span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Review and investigate your Gmail messages securely as{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {INITIAL_CONNECTED_ACCOUNT.email}
          </span>
        </p>
      </div>

      {getMessageStats() && (
        <div className="mt-2 sm:mt-0 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded border border-neutral-200/80 dark:border-neutral-700/60">
            {getMessageStats()}
          </span>
        </div>
      )}
    </div>
  );
}
