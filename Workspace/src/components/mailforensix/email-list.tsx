import React, { useMemo, useState } from 'react';
import { useMail } from '../../context/MailContext';
import { Email } from '../../types';
import { EmailRow } from './email-row';
import { EmptyState } from './empty-state';
import { Skeleton } from '../ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface EmailListProps {
  onSelectEmail: (email: Email) => void;
  isLoading?: boolean;
}

export function EmailList({ onSelectEmail, isLoading = false }: EmailListProps) {
  const {
    emails,
    selectedEmailId,
    selectedEmailIds,
    currentFolder,
    forensicsView,
    searchQuery,
    filterStatus,
    sortOption,
    setSearchQuery,
    folderCounts,
  } = useMail();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter emails
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      // If forensics view is active:
      if (forensicsView === 'threats') {
        const isThreat = 
          email.threatStatus === 'MALICIOUS' || 
          email.threatStatus === 'PHISHING' || 
          email.threatStatus === 'BEC' || 
          email.threatStatus === 'IMPERSONATION' || 
          email.threatStatus === 'SUSPICIOUS';
        if (!isThreat) return false;
      } else {
        // Standard folder filtering
        if (currentFolder === 'starred') {
          if (!email.isStarred || email.isDeleted) return false;
        } else if (currentFolder === 'trash') {
          if (!email.isDeleted && email.folder !== 'trash') return false;
        } else if (currentFolder === 'important') {
          if ((email.folder !== 'important' && !email.labels?.includes('Important')) || email.isDeleted) return false;
        } else {
          if (email.folder !== currentFolder || email.isDeleted) return false;
        }
      }

      // Security status filter
      if (filterStatus === 'UNREAD' && email.isRead) return false;
      if (filterStatus === 'SAFE' && email.threatStatus !== 'SAFE') return false;
      if (filterStatus === 'SUSPICIOUS' && email.threatStatus !== 'SUSPICIOUS') return false;
      if (
        filterStatus === 'MALICIOUS' && 
        email.threatStatus !== 'MALICIOUS' && 
        email.threatStatus !== 'PHISHING' && 
        email.threatStatus !== 'BEC' && 
        email.threatStatus !== 'IMPERSONATION'
      ) return false;
      if (filterStatus === 'NOT_ANALYZED' && email.threatStatus !== 'NOT_ANALYZED') return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchSubject = email.subject.toLowerCase().includes(query);
        const matchSenderName = email.sender.name.toLowerCase().includes(query);
        const matchSenderEmail = email.sender.email.toLowerCase().includes(query);
        const matchDomain = email.sender.domain.toLowerCase().includes(query);
        const matchSnippet = email.snippet.toLowerCase().includes(query);
        const matchIp = email.analysis?.ipIntelligence?.sourceIp?.toLowerCase().includes(query);
        const matchIoc = email.analysis?.iocs?.some(ioc => ioc.value.toLowerCase().includes(query));

        return matchSubject || matchSenderName || matchSenderEmail || matchDomain || matchSnippet || matchIp || matchIoc;
      }

      return true;
    });
  }, [emails, currentFolder, forensicsView, filterStatus, searchQuery]);

  // Sort emails
  const sortedEmails = useMemo(() => {
    const list = [...filteredEmails];
    if (sortOption === 'NEWEST') {
      return list.sort((a, b) => b.timestamp - a.timestamp);
    }
    if (sortOption === 'OLDEST') {
      return list.sort((a, b) => a.timestamp - b.timestamp);
    }
    if (sortOption === 'RISK_SCORE') {
      return list.sort((a, b) => (b.analysis?.riskScore || 0) - (a.analysis?.riskScore || 0));
    }
    return list;
  }, [filteredEmails, sortOption]);

  // Pagination calculation
  const totalCount = sortedEmails.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentBatch = sortedEmails.slice(startIndex, startIndex + pageSize);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-neutral-100 dark:border-neutral-800">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state handling
  if (sortedEmails.length === 0) {
    if (searchQuery.trim()) {
      return <EmptyState type="search" searchQuery={searchQuery} onResetSearch={() => setSearchQuery('')} />;
    }
    if (forensicsView === 'threats') {
      return <EmptyState type="threats" />;
    }
    if (filterStatus === 'NOT_ANALYZED') {
      return <EmptyState type="not_analyzed" />;
    }
    return <EmptyState type="inbox" />;
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white dark:bg-[#0E1118]">
      {/* Dense Email rows container */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
        {currentBatch.map((email) => (
          <EmailRow
            key={email.id}
            email={email}
            isSelectedInList={selectedEmailIds.has(email.id)}
            isActiveOpen={selectedEmailId === email.id}
            onSelectRow={onSelectEmail}
          />
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#0D1017] text-xs text-neutral-500 select-none">
        <div className="text-[11px] font-mono">
          Showing {Math.min(startIndex + 1, totalCount)}-{Math.min(startIndex + pageSize, totalCount)} of {totalCount}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="iconSm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-6 w-6 p-0 border-neutral-200 dark:border-neutral-800"
            title="Previous page"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-[11px] font-mono px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="iconSm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-6 w-6 p-0 border-neutral-200 dark:border-neutral-800"
            title="Next page"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
