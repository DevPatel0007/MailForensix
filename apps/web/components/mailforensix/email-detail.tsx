import React, { useState } from 'react';
import { Email } from '~/types/mailforensix';
import { EmailHeader } from './email-header';
import { EmailBody } from './email-body';
import { AttachmentList } from './attachment-list';
import { AnalysisPanel } from './analysis-panel';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-white dark:bg-[#0C0E14]">
      {/* Left / Main Email Content (60-65% width) */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Email Header */}
        <EmailHeader email={email} onBackToList={onClose} />

        {/* Email Body with DOMPurify sanitization & safe links */}
        <EmailBody email={email} />

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <AttachmentList attachments={email.attachments} />
        )}
      </div>

      {/* Toggle button for Forensics Panel on smaller laptops */}
      <div className="hidden lg:flex items-center">
        <button
          type="button"
          onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
          className="h-14 w-3.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-l flex items-center justify-center text-neutral-500 cursor-pointer transition-colors"
          title={showAnalysisPanel ? 'Collapse forensic panel' : 'Expand forensic panel'}
        >
          {showAnalysisPanel ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Right Forensic Analysis Panel (35-40% width) */}
      {showAnalysisPanel && (
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 h-full flex flex-col">
          <AnalysisPanel email={email} />
        </div>
      )}
    </div>
  );
}
