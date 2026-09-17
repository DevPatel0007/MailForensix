/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { MailProvider, useMail } from './context/MailContext';
import { TopNav } from './components/mailforensix/top-nav';
import { Sidebar } from './components/mailforensix/sidebar';
import { MailboxHeader } from './components/mailforensix/mailbox-header';
import { MailboxToolbar } from './components/mailforensix/mailbox-toolbar';
import { EmailList } from './components/mailforensix/email-list';
import { EmailDetail } from './components/mailforensix/email-detail';
import { CommandDialog } from './components/mailforensix/command-dialog';
import { ComposeDialog } from './components/mailforensix/compose-dialog';
import { UrlWarningDialog } from './components/mailforensix/url-warning-dialog';
import { InvestigationsView } from './components/mailforensix/investigations-view';
import { IocSearchView } from './components/mailforensix/ioc-search-view';
import { ReportsView } from './components/mailforensix/reports-view';
import { Sheet, SheetContent } from './components/ui/sheet';
import { Toaster } from 'sonner';

function WorkspaceLayout() {
  const {
    selectedEmail,
    setSelectedEmailId,
    forensicsView,
  } = useMail();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#F3F4F6] dark:bg-[#0A0C11] text-neutral-900 dark:text-neutral-100 font-sans antialiased select-none">
      {/* 1. Global Navigation Bar */}
      <TopNav onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* 2. Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Mobile Slide-in Drawer Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar
              isCollapsed={false}
              onItemClick={() => setIsMobileSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Dynamic Center Work Area */}
        <main className="flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-white dark:bg-[#0E1118]">
          {/* If a specialized forensics view is selected: */}
          {forensicsView === 'investigations' ? (
            <InvestigationsView />
          ) : forensicsView === 'ioc_search' ? (
            <IocSearchView />
          ) : forensicsView === 'reports' ? (
            <ReportsView />
          ) : selectedEmail ? (
            /* Opened Email Forensic Detail View */
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmailId(null)}
            />
          ) : (
            /* Standard Mailbox List Queue View */
            <div className="flex flex-col h-full overflow-hidden">
              <MailboxHeader />
              <MailboxToolbar />
              <div className="flex-1 overflow-hidden">
                <EmailList
                  onSelectEmail={(email) => setSelectedEmailId(email.id)}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Global Modals & Dialogs */}
      <CommandDialog />
      <ComposeDialog />
      <UrlWarningDialog />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MailProvider>
        <WorkspaceLayout />
        <Toaster position="bottom-right" richColors theme="system" />
      </MailProvider>
    </ThemeProvider>
  );
}
