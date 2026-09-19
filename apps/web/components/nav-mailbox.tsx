"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import {
  ChevronDown,
  Inbox,
  Send,
  FileText,
  Star,
  ShieldAlert,
  Trash2,
  Bookmark,
  LogOut,
  Loader2,
  Mail,
  PlusCircle,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "~/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { trpc } from "~/trpc/client"
import { cn } from "~/lib/utils"

const LABEL_ICONS: Record<string, React.ElementType> = {
  INBOX: Inbox,
  SENT: Send,
  IMPORTANT: Bookmark,
  STARRED: Star,
  DRAFT: FileText,
  SPAM: ShieldAlert,
  TRASH: Trash2,
}

const LABEL_ORDER = ["INBOX", "SENT", "IMPORTANT", "STARRED", "DRAFT", "SPAM", "TRASH"]

function NavMailboxInner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const activeLabel = searchParams.get("label") ?? (pathname === "/dashboard/mailbox" ? "INBOX" : null)

  const [open, setOpen] = useState(true)

  const connection = trpc.gmail.connection.useQuery()
  const labels = trpc.gmail.labels.useQuery(undefined, {
    enabled: connection.data?.connected === true,
  })
  const disconnect = trpc.gmail.disconnect.useMutation({
    onSuccess: () => {
      void connection.refetch()
    },
  })

  const isConnected = connection.data?.connected === true

  const sortedLabels = React.useMemo(() => {
    if (!labels.data?.labels) return []
    const ordered: typeof labels.data.labels = []
    for (const id of LABEL_ORDER) {
      const match = labels.data.labels.find((l) => l.id === id)
      if (match) ordered.push(match)
    }
    for (const label of labels.data.labels) {
      if (!LABEL_ORDER.includes(label.id)) ordered.push(label)
    }
    return ordered
  }, [labels.data])

  return (
    <SidebarGroup className="py-1.5">
      <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 pb-1.5 flex items-center justify-between">
        <span>Mailbox</span>
        {isConnected && labels.data?.labels && (
          <span className="text-[10px] font-mono text-muted-foreground/60 font-normal">
            {labels.data.labels.find((l) => l.id === "INBOX")?.total ?? 0} msgs
          </span>
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          <Collapsible open={open} onOpenChange={setOpen} className="w-full">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip="Mail Folders"
                  className={cn(
                    "h-8 px-2.5 rounded-md text-sm font-medium transition-all duration-150 ease-out",
                    pathname === "/dashboard/mailbox"
                      ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 [&>svg]:text-emerald-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate">Mail Folders</span>
                  <ChevronDown
                    className="ml-auto size-3.5 shrink-0 transition-transform duration-200"
                    style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent className="pt-1">
                <SidebarMenuSub className="mr-0 pr-0 ml-3.5 border-l border-border/50 pl-2 space-y-0.5">
                  {!isConnected ? (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild className="h-7 text-xs">
                        <Link
                          href="/dashboard/mailbox"
                          className="flex items-center gap-2 text-muted-foreground hover:text-emerald-500 transition-colors"
                        >
                          <PlusCircle className="size-3.5 shrink-0" />
                          <span>Connect Gmail</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ) : labels.isLoading ? (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton className="h-7 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin mr-1.5" />
                        <span>Syncing folders...</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ) : (
                    <>
                      {sortedLabels.map((label) => {
                        const Icon = LABEL_ICONS[label.id] ?? Mail
                        const isFolderActive = pathname === "/dashboard/mailbox" && activeLabel === label.id

                        return (
                          <SidebarMenuSubItem key={label.id}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isFolderActive}
                              className={cn(
                                "h-7 px-2 text-xs rounded transition-all duration-150",
                                isFolderActive
                                  ? "bg-emerald-500/15 text-foreground font-semibold border-l-2 border-emerald-500 [&>svg]:text-emerald-500"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <Link
                                href={`/dashboard/mailbox?label=${label.id}`}
                                className="flex items-center gap-2 w-full"
                              >
                                <Icon className="size-3.5 shrink-0 opacity-80" />
                                <span className="capitalize text-[12px] font-normal truncate">
                                  {label.name.toLowerCase()}
                                </span>
                                {label.total > 0 && (
                                  <span className="ml-auto text-[11px] font-mono text-muted-foreground/70 tabular-nums">
                                    {label.total}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}

                      <SidebarMenuSubItem className="pt-1">
                        <SidebarMenuSubButton
                          onClick={() => {
                            if (!disconnect.isPending) disconnect.mutate()
                          }}
                          aria-disabled={disconnect.isPending}
                          className="h-7 px-2 text-xs cursor-pointer text-muted-foreground/70 hover:text-destructive transition-colors"
                        >
                          <LogOut className="size-3.5 shrink-0 mr-2" />
                          <span className="text-[11px]">
                            {disconnect.isPending ? "Disconnecting..." : "Disconnect Gmail"}
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function NavMailbox() {
  return (
    <React.Suspense
      fallback={
        <SidebarGroup className="py-1.5">
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 pb-1.5">
            Mailbox
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="h-8 px-2.5 rounded-md bg-muted/20 animate-pulse" />
          </SidebarGroupContent>
        </SidebarGroup>
      }
    >
      <NavMailboxInner />
    </React.Suspense>
  )
}

