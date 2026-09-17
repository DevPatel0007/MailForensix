import React from 'react';
import { useMail } from '~/context/MailContext';
import { FolderType, ForensicsViewType } from '~/types/mailforensix';
import { 
  Inbox, 
  Bookmark, 
  Send, 
  Star, 
  FileText, 
  AlertCircle, 
  Trash2, 
  ShieldAlert, 
  Search, 
  BarChart3, 
  FileCheck2, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  PenSquare
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: () => void; // for closing mobile drawer
}

export function Sidebar({ isCollapsed = false, onToggleCollapse, onItemClick }: SidebarProps) {
  const { 
    currentFolder, 
    setCurrentFolder, 
    forensicsView, 
    setForensicsView, 
    folderCounts, 
    activeThreatsCount,
    isConnected,
    userEmail,
    disconnectGmail,
    reconnectGmail,
    setIsComposeOpen,
  } = useMail();

  const folderNavItems: { id: FolderType; label: string; icon: React.ElementType; countKey: keyof typeof folderCounts }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, countKey: 'inbox' },
    { id: 'important', label: 'Important', icon: Bookmark, countKey: 'important' },
    { id: 'sent', label: 'Sent', icon: Send, countKey: 'sent' },
    { id: 'starred', label: 'Starred', icon: Star, countKey: 'starred' },
    { id: 'drafts', label: 'Drafts', icon: FileText, countKey: 'drafts' },
    { id: 'spam', label: 'Spam', icon: AlertCircle, countKey: 'spam' },
    { id: 'trash', label: 'Trash', icon: Trash2, countKey: 'trash' },
  ];

  const forensicNavItems: { id: ForensicsViewType; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { 
      id: 'threats', 
      label: 'Threats', 
      icon: ShieldAlert, 
      badge: activeThreatsCount, 
      badgeColor: 'bg-red-500/10 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50' 
    },
    { id: 'investigations', label: 'Investigations', icon: FileCheck2, badge: '2 Active' },
    { id: 'ioc_search', label: 'IOC Search', icon: Search },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleFolderSelect = (folder: FolderType) => {
    setCurrentFolder(folder);
    onItemClick?.();
  };

  const handleForensicsSelect = (view: ForensicsViewType) => {
    setForensicsView(view);
    onItemClick?.();
  };

  const displayEmail = userEmail || 'milapmodi43@gmail.com';

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between border-r border-neutral-200/90 bg-[#F9FAFB] dark:border-neutral-800 dark:bg-[#0D1017] transition-all duration-200 select-none h-full',
        isCollapsed ? 'w-14' : 'w-56 lg:w-60'
      )}
    >
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden p-2.5 space-y-4">
        {/* Top: Connected Gmail Account Area */}
        <div className={cn('pt-1 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80', isCollapsed && 'px-0 text-center')}>
          {!isCollapsed ? (
            <div className="px-1.5 py-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Connected Account
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate mt-0.5" title={displayEmail}>
                {displayEmail}
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-1" title={`${displayEmail} (${isConnected ? 'Connected' : 'Offline'})`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          )}

          {/* Compose Email Quick Action */}
          <div className="mt-2.5">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsComposeOpen(true);
                onItemClick?.();
              }}
              className={cn(
                'w-full bg-[#00C896] hover:bg-[#00b285] text-white shadow-xs font-medium tracking-wide flex items-center justify-center gap-2',
                isCollapsed && 'px-0 justify-center'
              )}
              title="Compose New Email"
            >
              <PenSquare className="h-3.5 w-3.5 shrink-0" />
              {!isCollapsed && <span>Compose</span>}
            </Button>
          </div>
        </div>

        {/* Navigation Group 1: Standard Gmail Folders */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Mailbox
            </div>
          )}
          {folderNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = forensicsView === null && currentFolder === item.id;
            const count = folderCounts[item.countKey];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleFolderSelect(item.id)}
                title={isCollapsed ? `${item.label} (${count.toLocaleString()})` : undefined}
                className={cn(
                  'group flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-emerald-50 text-neutral-900 border-l-2 border-[#00C896] dark:bg-emerald-950/30 dark:text-neutral-100 dark:border-[#00D4A4]'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 transition-colors',
                      isSelected ? 'text-[#00C896] dark:text-[#00D4A4]' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded-sm transition-colors',
                      isSelected
                        ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300'
                    )}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Group 2: FORENSICS */}
        <div className="space-y-0.5 pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center justify-between">
              <span>Forensics</span>
              <Shield className="h-3 w-3 text-neutral-400" />
            </div>
          )}
          {forensicNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = forensicsView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleForensicsSelect(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'group flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-emerald-50 text-neutral-900 border-l-2 border-[#00C896] dark:bg-emerald-950/30 dark:text-neutral-100 dark:border-[#00D4A4]'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 transition-colors',
                      isSelected ? 'text-[#00C896] dark:text-[#00D4A4]' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded-sm',
                      item.badgeColor || 'bg-neutral-200/60 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Settings, Help, Disconnect */}
        <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-0.5 mt-auto">
          <button
            type="button"
            onClick={() => handleForensicsSelect('reports')}
            title={isCollapsed ? 'Settings' : undefined}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button
            type="button"
            onClick={() => handleForensicsSelect('reports')}
            title={isCollapsed ? 'Help & Documentation' : undefined}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            {!isCollapsed && <span>Help &amp; Docs</span>}
          </button>

          {/* Disconnect / Reconnect Gmail */}
          <button
            type="button"
            onClick={isConnected ? disconnectGmail : reconnectGmail}
            title={isCollapsed ? (isConnected ? 'Disconnect Gmail' : 'Reconnect Gmail') : undefined}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors mt-2',
              isConnected
                ? 'text-neutral-500 hover:bg-red-50 hover:text-red-700 dark:text-neutral-400 dark:hover:bg-red-950/30 dark:hover:text-red-400'
                : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400'
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>{isConnected ? 'Disconnect Gmail' : 'Reconnect Gmail'}</span>}
          </button>
        </div>
      </div>

      {/* Collapse / Expand Toggle Button on desktop */}
      {onToggleCollapse && (
        <div className="hidden md:flex items-center justify-end p-2 border-t border-neutral-200/80 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </aside>
  );
}
