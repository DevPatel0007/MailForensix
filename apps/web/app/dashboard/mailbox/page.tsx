"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/app-sidebar"
import { GmailViewer } from "~/components/gmail-viewer"

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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Mailbox</h1>
            <p className="text-steel mb-2">
              View your emails, run full security analysis scans, and download JSON reports.
            </p>
            <Suspense fallback={null}>
              <MailboxContent />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
