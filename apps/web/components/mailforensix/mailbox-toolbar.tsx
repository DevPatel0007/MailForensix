import React from 'react';
import { useMail } from '~/context/MailContext';
import { 
  RotateCw, 
  Mail, 
  MailOpen, 
  Archive, 
  Trash2, 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowUpDown
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '~/components/ui/dropdown-menu';

export function MailboxToolbar() {
  const {
    emails,
    selectedEmailIds,
    selectAllEmails,
    markAsRead,
    archiveEmails,
    deleteEmails,
    refreshEmails,
    filterStatus,
    setFilterStatus,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    currentFolder,
    forensicsView,
  } = useMail();

  const selectedCount = selectedEmailIds.size;
  const currentItems = emails.filter(e => forensicsView === 'threats' ? (e.threatStatus !== 'SAFE' && e.threatStatus !== 'NOT_ANALYZED') : (e.folder === currentFolder && !e.isDeleted));
  const isAllSelected = currentItems.length > 0 && selectedCount === currentItems.length;

  const handleBulkRead = () => {
    markAsRead(Array.from(selectedEmailIds), true);
  };

  const handleBulkUnread = () => {
    markAsRead(Array.from(selectedEmailIds), false);
  };

  const handleBulkArchive = () => {
    archiveEmails(Array.from(selectedEmailIds));
  };

  const handleBulkDelete = () => {
    deleteEmails(Array.from(selectedEmailIds));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#11141C] text-xs">
      {/* Left controls: Checkbox, Refresh, Bulk Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2 pl-1 pr-1.5 py-1">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={selectAllEmails}
            title={isAllSelected ? 'Deselect all' : 'Select all'}
          />
          {selectedCount > 0 && (
            <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 font-medium">
              {selectedCount} selected
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={refreshEmails}
          title="Refresh messages"
          className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Button>

        {/* Action icons when selection > 0 */}
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          disabled={selectedCount === 0}
          onClick={handleBulkRead}
          title="Mark as read"
          className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <MailOpen className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={selectedCount === 0}
          onClick={handleBulkUnread}
          title="Mark as unread"
          className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Mail className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={selectedCount === 0}
          onClick={handleBulkArchive}
          title="Archive selected"
          className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={selectedCount === 0}
          onClick={handleBulkDelete}
          title="Delete selected"
          className="text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Right controls: Filters, Sort, Search, Compose */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Threat Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1.5 font-normal border-neutral-200 dark:border-neutral-700/80"
            >
              <SlidersHorizontal className="h-3 w-3 text-neutral-500" />
              <span>
                {filterStatus === 'ALL'
                  ? 'All Statuses'
                  : filterStatus === 'UNREAD'
                  ? 'Unread Only'
                  : filterStatus === 'SAFE'
                  ? 'Safe Only'
                  : filterStatus === 'SUSPICIOUS'
                  ? 'Suspicious'
                  : filterStatus === 'MALICIOUS'
                  ? 'Malicious / Phishing'
                  : 'Not Analyzed'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuLabel>Filter by Security</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus('ALL')}>
              <span>All Messages</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('UNREAD')}>
              <span>Unread</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('SAFE')} className="text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 mr-2" />
              <span>Safe</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('SUSPICIOUS')} className="text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 mr-2" />
              <span>Suspicious</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('MALICIOUS')} className="text-red-700 dark:text-red-400">
              <AlertOctagon className="h-3.5 w-3.5 mr-2" />
              <span>Malicious &amp; Phishing</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('NOT_ANALYZED')}>
              <span>Not Analyzed</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1 font-normal border-neutral-200 dark:border-neutral-700/80"
            >
              <ArrowUpDown className="h-3 w-3 text-neutral-500" />
              <span className="hidden sm:inline">Sort:</span>
              <span>
                {sortOption === 'NEWEST'
                  ? 'Newest'
                  : sortOption === 'OLDEST'
                  ? 'Oldest'
                  : 'Risk Score'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 text-xs">
            <DropdownMenuItem onClick={() => setSortOption('NEWEST')}>
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('OLDEST')}>
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('RISK_SCORE')}>
              Highest Risk Score
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Inline quick search filter */}
        <div className="relative hidden md:block w-36 lg:w-44">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter list..."
            className="h-7 w-full rounded border border-neutral-200 bg-neutral-50/70 pl-7 pr-2 text-[11px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-100"
          />
        </div>
      </div>
    </div>
  );
}
