"use client";

import React, { useState, useEffect } from 'react';
import { useMail } from '~/context/MailContext';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { 
  Search, 
  Inbox, 
  Bookmark, 
  Send, 
  AlertCircle, 
  ShieldAlert, 
  Moon, 
  Sun, 
  PenSquare, 
  LogOut,
  RotateCw
} from 'lucide-react';
import { FolderType } from '~/types/mailforensix';

export function CommandDialog() {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setCurrentFolder, 
    setForensicsView, 
    setIsComposeOpen,
    refreshEmails,
    isConnected,
    disconnectGmail,
    reconnectGmail
  } = useMail();
  const { theme, setTheme } = useTheme();

  const [input, setInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCommandPaletteOpen]);

  const runAndClose = (action: () => void) => {
    action();
    setIsCommandPaletteOpen(false);
    setInput('');
  };

  const navFolder = (folder: FolderType) => {
    runAndClose(() => setCurrentFolder(folder));
  };

  return (
    <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-lg border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141C]">
        {/* Command Search Input */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-3.5">
          <Search className="h-4 w-4 text-neutral-400 mr-2 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command or search action..."
            className="h-11 w-full bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100"
            autoFocus
          />
          <kbd className="text-[10px] font-mono text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-72 overflow-y-auto p-2 text-xs divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {/* Quick Actions */}
          <div className="pb-1.5 space-y-0.5">
            <span className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Quick Actions
            </span>
            <button
              type="button"
              onClick={() => runAndClose(() => setIsComposeOpen(true))}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <PenSquare className="h-3.5 w-3.5 text-[#00C896]" />
              <span>Compose New Email</span>
            </button>
            <button
              type="button"
              onClick={() => runAndClose(() => setForensicsView('threats'))}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              <span>View Active Threat Queue</span>
            </button>
            <button
              type="button"
              onClick={() => runAndClose(refreshEmails)}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5 text-neutral-400" />
              <span>Sync Gmail Workspace</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="py-1.5 space-y-0.5">
            <span className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Navigate Mailbox
            </span>
            <button
              type="button"
              onClick={() => navFolder('inbox')}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <Inbox className="h-3.5 w-3.5 text-neutral-400" />
              <span>Go to Inbox</span>
            </button>
            <button
              type="button"
              onClick={() => navFolder('important')}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <Bookmark className="h-3.5 w-3.5 text-neutral-400" />
              <span>Go to Important</span>
            </button>
            <button
              type="button"
              onClick={() => navFolder('sent')}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-neutral-400" />
              <span>Go to Sent</span>
            </button>
            <button
              type="button"
              onClick={() => navFolder('spam')}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <AlertCircle className="h-3.5 w-3.5 text-neutral-400" />
              <span>Go to Spam</span>
            </button>
          </div>

          {/* Preferences & System */}
          <div className="pt-1.5 space-y-0.5">
            <span className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Preferences
            </span>
            <button
              type="button"
              onClick={() => runAndClose(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-neutral-400" />
              )}
              <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
            <button
              type="button"
              onClick={() => runAndClose(isConnected ? disconnectGmail : reconnectGmail)}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/70 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-neutral-400" />
              <span>{isConnected ? 'Disconnect Gmail Account' : 'Reconnect Gmail Account'}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
