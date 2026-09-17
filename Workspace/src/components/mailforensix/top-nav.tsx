import React, { useState } from 'react';
import { useMail } from '../../context/MailContext';
import { useTheme } from '../../context/ThemeContext';
import { INITIAL_CONNECTED_ACCOUNT } from '../../data/mockEmails';
import { 
  Search, 
  RotateCw, 
  Bell, 
  HelpCircle, 
  Sun, 
  Moon, 
  Shield, 
  CheckCircle2, 
  LogOut, 
  Settings, 
  Sliders, 
  Menu,
  Database,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface TopNavProps {
  onOpenMobileSidebar?: () => void;
}

export function TopNav({ onOpenMobileSidebar }: TopNavProps) {
  const { 
    isConnected, 
    disconnectGmail, 
    reconnectGmail, 
    refreshEmails, 
    setIsCommandPaletteOpen,
    searchQuery,
    setSearchQuery,
    activeThreatsCount 
  } = useMail();
  const { theme, toggleTheme } = useTheme();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 w-full items-center justify-between border-b border-neutral-200/90 bg-white px-3 sm:px-4 dark:border-neutral-800 dark:bg-[#0E1118]">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="iconSm"
            className="md:hidden text-neutral-600 dark:text-neutral-400"
            onClick={onOpenMobileSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            {/* Minimal "M" Logo Mark in mint */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#00C896] to-[#00A87D] text-white shadow-xs">
              <span className="font-mono font-bold text-sm leading-none tracking-tighter">M</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                MailForensix
              </span>
              <span className="hidden sm:inline-flex items-center rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                SECURITY WORKSPACE
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search / Command Bar */}
        <div className="flex flex-1 max-w-md mx-3 sm:mx-6">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="group flex h-8 w-full items-center justify-between rounded-md border border-neutral-200/90 bg-neutral-50/80 px-2.5 text-xs text-neutral-400 transition-colors hover:border-neutral-300 hover:bg-neutral-100/70 hover:text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-500 dark:hover:border-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 shrink-0" />
              <span className="truncate">
                {searchQuery ? `Searching: "${searchQuery}"` : 'Search emails, senders, domains, IPs...'}
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Refresh emails */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={refreshEmails}
            title="Refresh workspace"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          {/* Theme switcher */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {theme === 'light' ? (
              <Moon className="h-3.5 w-3.5 text-neutral-600" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            )}
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                className="relative text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                title="Security Notifications"
              >
                <Bell className="h-3.5 w-3.5" />
                {activeThreatsCount > 0 && (
                  <span className="absolute 1 top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0E1118]" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Security Feed</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Live Guard</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-xs">
                  <div className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Critical Phishing Intercepted
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    login-micros0ft-support.com blocked by heuristic rule #M365-TYPO
                  </p>
                </div>
                <div className="p-2 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                  <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Anomalous Login Alert
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Session 94.156.71.182 in Sofia, BG detected on Instagram
                  </p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help & Documentation */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setIsHelpOpen(true)}
            title="Help & Forensic Intelligence Documentation"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </Button>

          {/* User Avatar & Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 pl-1 pr-1.5 py-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={INITIAL_CONNECTED_ACCOUNT.avatar}
                    alt={INITIAL_CONNECTED_ACCOUNT.name}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-[#0E1118] ${isConnected ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold leading-none text-neutral-900 dark:text-neutral-100">
                    {INITIAL_CONNECTED_ACCOUNT.name}
                  </p>
                  <p className="text-[11px] leading-none text-neutral-500 dark:text-neutral-400 truncate">
                    {INITIAL_CONNECTED_ACCOUNT.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Gmail Status</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {isConnected ? 'Connected' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Threat Shield</span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-mono">Active (14 Blocked)</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsHelpOpen(true)}>
                <Shield className="mr-2 h-3.5 w-3.5 text-neutral-500" />
                <span>Security Policies</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCommandPaletteOpen(true)}>
                <Sliders className="mr-2 h-3.5 w-3.5 text-neutral-500" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isConnected ? (
                <DropdownMenuItem
                  onClick={disconnectGmail}
                  className="text-red-600 dark:text-red-400 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Disconnect Gmail</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={reconnectGmail}
                  className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-700"
                >
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                  <span>Reconnect Gmail</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Help & SOC Documentation Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>MailForensix Intelligence Guide</DialogTitle>
            <DialogDescription>
              Enterprise-grade automated email forensics and threat classification framework.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed py-2">
            <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#00C896]" /> Threat Scoring Architecture
              </span>
              <p>
                Scores range from 0 to 100 based on weighted Bayesian evaluation of SPF/DKIM/DMARC cryptographic validation, IP autonomous system (ASN) reputation, typosquatting domain heuristics, and weaponized payload markers.
              </p>
            </div>
            <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Safe Sandboxing &amp; URL Protection
              </span>
              <p>
                All URLs and HTML snippets are isolated and rendered with strict sanitization. Dangerous and suspicious links will trigger confirmation intercept dialogs prior to external dispatch.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-neutral-400 font-mono">MailForensix Engine v2.4.0</span>
              <Button size="sm" variant="outline" onClick={() => setIsHelpOpen(false)}>
                Close Guide
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
