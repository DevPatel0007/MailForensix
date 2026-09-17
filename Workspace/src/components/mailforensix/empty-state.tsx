import React from 'react';
import { Inbox, ShieldCheck, Search, FileQuestion } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  type: 'inbox' | 'threats' | 'search' | 'not_analyzed' | 'default';
  searchQuery?: string;
  onResetSearch?: () => void;
}

export function EmptyState({ type, searchQuery, onResetSearch }: EmptyStateProps) {
  switch (type) {
    case 'threats':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center my-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3 border border-emerald-200/80 dark:border-emerald-800/60">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No threats detected
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            All messages in your active queue have passed cryptographic SPF/DKIM/DMARC checks and reputation screening.
          </p>
        </div>
      );

    case 'search':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center my-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 mb-3">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No emails match your search
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            {searchQuery ? `No records found matching "${searchQuery}".` : 'Try adjusting your search query or filter tags.'}
          </p>
          {onResetSearch && (
            <Button variant="outline" size="sm" onClick={onResetSearch} className="mt-4 text-xs">
              Clear search filter
            </Button>
          )}
        </div>
      );

    case 'not_analyzed':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center my-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 mb-3">
            <FileQuestion className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No pending unanalyzed emails
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            All incoming messages have either completed automated heuristic analysis or been triaged.
          </p>
        </div>
      );

    case 'inbox':
    default:
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center my-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 mb-3">
            <Inbox className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No emails here
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            Your folder is currently empty.
          </p>
        </div>
      );
  }
}
