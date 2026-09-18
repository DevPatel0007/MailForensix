"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Inbox,
  Send,
  FileText,
  Star,
  Shield,
  Trash2,
  Bookmark,
  LogOut,
  Loader2,
} from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "~/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { trpc } from "~/trpc/client"
import { useRouter } from "next/navigation"

const LABEL_ICONS: Record<string, React.ElementType> = {
  INBOX: Inbox,
  SENT: Send,
  DRAFT: FileText,
  STARRED: Star,
  SPAM: Shield,
  TRASH: Trash2,
  IMPORTANT: Bookmark,
}

const LABEL_ORDER = ["SENT", "INBOX", "IMPORTANT", "TRASH", "DRAFT", "SPAM", "STARRED"]

export function NavMailbox() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const connection = trpc.gmail.connection.useQuery()
  const labels = trpc.gmail.labels.useQuery(undefined, {
    enabled: connection.data?.connected === true && open,
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
    // Add any remaining labels not in the known order
    for (const label of labels.data.labels) {
      if (!LABEL_ORDER.includes(label.id)) ordered.push(label)
    }
    return ordered
  }, [labels.data])

  return (
    <SidebarMenu>
      <Collapsible open={open} onOpenChange={setOpen} asChild>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="Mailbox">
                  <Inbox className="shrink-0" />
                  <span>Mailbox</span>
                  <ChevronDown
                    className="ml-auto shrink-0 transition-transform duration-200"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub className="mr-0 pr-0">
                  {!isConnected ? (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href="/dashboard/mailbox">
                          <span className="text-stone">Connect Gmail to view folders</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ) : labels.isLoading ? (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <Loader2 className="size-3 animate-spin" />
                        <span>Loading...</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ) : (
                    <>
                      {sortedLabels.map((label) => {
                        const Icon = LABEL_ICONS[label.id] ?? Inbox
                        return (
                          <SidebarMenuSubItem key={label.id}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={`/dashboard/mailbox?label=${label.id}`}
                                className="flex items-center gap-2"
                              >
                                <Icon className="shrink-0 size-3.5" />
                                <span className="uppercase text-[11px] font-semibold tracking-wider">
                                  {label.name}
                                </span>
                                <span className="ml-auto text-xs text-stone tabular-nums">
                                  {label.total > 0 ? label.total : 0}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => disconnect.mutate()}
                          disabled={disconnect.isPending}
                          className="mt-1 w-full cursor-pointer text-stone hover:text-foreground"
                        >
                          <LogOut className="shrink-0 size-3.5" />
                          <span>
                            {disconnect.isPending ? "Disconnecting..." : "Disconnect"}
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
  )
}
