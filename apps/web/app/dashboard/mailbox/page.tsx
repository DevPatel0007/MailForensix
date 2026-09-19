"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { GmailViewer } from "~/components/gmail-viewer"
import { Badge } from "~/components/ui/badge"
import { ShieldCheck, Loader2 } from "lucide-react"

function MailboxContent() {
  const searchParams = useSearchParams()
  const label = (searchParams.get("label") ?? "INBOX") as
    | "INBOX"
    | "SENT"
    | "DRAFT"
    | "STARRED"
    | "SPAM"
    | "TRASH"
    | "IMPORTANT"

  return <GmailViewer initialLabel={label} />
}

export default function MailboxPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Mailbox & Forensic Inbox
          </h1>
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            Investigation Suite
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Inspect message headers, perform deep multi-layer forensic threat scoring, and examine cryptographic signatures.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-emerald-500" />
            <span>Loading mailbox forensics...</span>
          </div>
        }
      >
        <MailboxContent />
      </Suspense>
    </div>
  )
}
