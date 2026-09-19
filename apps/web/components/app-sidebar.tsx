"use client"

import * as React from "react"
import Link from "next/link"
import { NavMain } from "~/components/nav-main"
import { NavMailbox } from "~/components/nav-mailbox"
import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import {
  LayoutDashboard,
  BarChart3,
  Globe2,
  History,
  Settings,
  HelpCircle,
  ShieldCheck,
} from "lucide-react"
import { trpc } from "~/trpc/client"

const mainNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard className="size-4 shrink-0" />,
  },
]

const securityNav = [
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: <BarChart3 className="size-4 shrink-0" />,
  },
  {
    title: "Past Scans",
    url: "/dashboard/scans",
    icon: <History className="size-4 shrink-0" />,
  },
  {
    title: "Geolocation Tracking",
    url: "/dashboard/geolocation",
    icon: <Globe2 className="size-4 shrink-0" />,
  },
]

const systemNav = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings className="size-4 shrink-0" />,
  },
  {
    title: "Help & Docs",
    url: "/dashboard/help",
    icon: <HelpCircle className="size-4 shrink-0" />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = trpc.auth.me.useQuery()

  const userData = user
    ? {
        name: user.fullName || "Forensic Analyst",
        email: user.email,
        avatar: "",
      }
    : {
        name: "Security Analyst",
        email: "analyst@mailforensix.internal",
        avatar: "",
      }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border/60 bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-border/50 px-3 py-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 hover:bg-muted/60 transition-colors rounded-lg px-2"
            >
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
                  <ShieldCheck className="size-4 text-emerald-500" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-bold tracking-tight text-foreground">MailForensix</span>
                  <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">Forensic Suite</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 gap-1">
        {/* MAIN */}
        <NavMain label="Main" items={mainNav} />

        {/* MAILBOX */}
        <NavMailbox />

        {/* SECURITY */}
        <NavMain label="Security Intelligence" items={securityNav} />

        {/* SYSTEM */}
        <div className="mt-auto">
          <NavMain label="System" items={systemNav} />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
