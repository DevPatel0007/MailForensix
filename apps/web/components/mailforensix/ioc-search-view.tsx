"use client";

import React, { useState } from 'react';
import { useMail } from '~/context/MailContext';
import { Search, ArrowRight, Copy } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

export function IocSearchView() {
  const { emails, setSelectedEmailId, setForensicsView } = useMail();
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all IOCs from all emails
  const allIocs = React.useMemo(() => {
    const list: Array<{
      type: string;
      value: string;
      threatLevel: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'low' | 'medium' | 'high';
      emailId: string;
      emailSubject: string;
      sender: string;
      description?: string;
    }> = [];

    emails.forEach((email) => {
      if (email.analysis?.iocs) {
        email.analysis.iocs.forEach((ioc) => {
          list.push({
            type: ioc.type,
            value: ioc.value,
            threatLevel: ioc.threatLevel,
            emailId: email.id,
            emailSubject: email.subject,
            sender: email.sender.name,
            description: ioc.description,
          });
        });
      }
    });

    return list;
  }, [emails]);

  const filteredIocs = React.useMemo(() => {
    if (!searchTerm.trim()) return allIocs;
    const q = searchTerm.toLowerCase();
    return allIocs.filter(
      (ioc) =>
        ioc.value.toLowerCase().includes(q) ||
        ioc.type.toLowerCase().includes(q) ||
        ioc.emailSubject.toLowerCase().includes(q) ||
        ioc.sender.toLowerCase().includes(q) ||
        (ioc.description && ioc.description.toLowerCase().includes(q))
    );
  }, [allIocs, searchTerm]);

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`Copied: ${val}`);
  };

  const handleJumpToEmail = (emailId: string) => {
    setForensicsView(null);
    setSelectedEmailId(emailId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50/50 dark:bg-[#0C0E14] text-xs">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[#00C896]" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Global Indicators of Compromise (IOC) Search
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Query IPs, malicious domains, file hashes, and target URLs across all monitored communications.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by IP (e.g. 94.156.71.182), domain (e.g. login-micros0ft), or SHA256..."
            className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-4 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-neutral-800 dark:bg-[#121620] dark:text-neutral-100"
          />
        </div>

        {/* Quick Filter chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
          <span>Popular queries:</span>
          {['94.156.71.182', 'login-micros0ft', 'docusign', 'urgent-transfer'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setSearchTerm(chip)}
              className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <span>Matched IOC Artifacts ({filteredIocs.length})</span>
            <span>Reputation Level</span>
          </div>

          <div className="space-y-2">
            {filteredIocs.map((ioc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#121620] flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase">
                      {ioc.type}
                    </span>
                    <Badge
                      variant={
                        ioc.threatLevel === 'high' || ioc.threatLevel === 'MALICIOUS'
                          ? 'malicious'
                          : ioc.threatLevel === 'medium' || ioc.threatLevel === 'SUSPICIOUS'
                          ? 'suspicious'
                          : 'safe'
                      }
                      className="text-[9px] py-0 px-1"
                    >
                      {ioc.threatLevel}
                    </Badge>
                    <span className="text-[11px] text-neutral-400 truncate">
                      in: <strong className="text-neutral-700 dark:text-neutral-300 font-normal">{ioc.emailSubject}</strong>
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate mt-1">
                    {ioc.value}
                  </div>

                  {ioc.description && (
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {ioc.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyVal(ioc.value)}
                    title="Copy IOC"
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1.5 h-7 w-7"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJumpToEmail(ioc.emailId)}
                    className="h-7 text-[11px] border-neutral-200 dark:border-neutral-700"
                  >
                    <span>View Email</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
