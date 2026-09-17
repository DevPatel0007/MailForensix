"use client";

import React, { useState } from 'react';
import { useMail } from '~/context/MailContext';
import { Dialog, DialogContent, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Send, Paperclip, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function ComposeDialog() {
  const { isComposeOpen, setIsComposeOpen, userEmail, sendEmail } = useMail();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) {
      toast.error('Please specify a recipient');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      sendEmail({ to, subject, message: body });
      setIsSending(false);
      setIsComposeOpen(false);
      setTo('');
      setSubject('');
      setBody('');
    }, 400);
  };

  const displayEmail = userEmail || 'milapmodi43@gmail.com';

  return (
    <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141C]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#0D1017]">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              New Message
            </DialogTitle>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              <ShieldCheck className="h-3 w-3" /> TLS 1.3 Outbound Guard
            </span>
          </div>
        </div>

        <form onSubmit={handleSend} className="flex flex-col text-xs">
          {/* Sender */}
          <div className="flex items-center px-4 py-2 border-b border-neutral-100 dark:border-neutral-800/80">
            <span className="w-16 text-neutral-400 font-medium">From</span>
            <span className="font-mono text-neutral-800 dark:text-neutral-200">
              {displayEmail}
            </span>
          </div>

          {/* Recipient */}
          <div className="flex items-center px-4 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
            <label htmlFor="to-input" className="w-16 text-neutral-400 font-medium">To</label>
            <input
              id="to-input"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent py-1 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
              required
            />
          </div>

          {/* Subject */}
          <div className="flex items-center px-4 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80">
            <label htmlFor="subject-input" className="w-16 text-neutral-400 font-medium">Subject</label>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              className="flex-1 bg-transparent py-1 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none font-medium"
            />
          </div>

          {/* Body */}
          <div className="p-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Write your email here..."
              className="w-full resize-none bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#0D1017]">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toast.info('File attachment simulation: Clean attachment scanned')}
                title="Attach file"
                className="p-1 h-7 w-7"
              >
                <Paperclip className="h-4 w-4 text-neutral-500" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsComposeOpen(false)}
                className="text-xs text-neutral-500"
              >
                Discard
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSending}
                className="bg-[#00C896] hover:bg-[#00b285] text-white text-xs font-medium"
              >
                <Send className="h-3 w-3 mr-1.5" />
                <span>{isSending ? 'Dispatching...' : 'Send'}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
