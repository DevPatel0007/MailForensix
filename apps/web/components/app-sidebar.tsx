"use client"

import * as React from "react"

import { NavMain } from "~/components/nav-main"
import { NavMailbox } from "~/components/nav-mailbox"
import { NavSecondary } from "~/components/nav-secondary"
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
  LayoutDashboardIcon,
  ChartBarIcon,
  MapPinIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  ShieldIcon,
} from "lucide-react"
import { trpc } from "~/trpc/client"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: <ChartBarIcon />,
  },
  {
    title: "Past Scans",
    url: "/dashboard/scans",
    icon: <FileTextIcon />,
  },
  {
    title: "Geolocation Tracking",
    url: "/dashboard/geolocation",
    icon: <MapPinIcon />,
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: <Settings2Icon />,
  },
  {
    title: "Get Help",
    url: "#",
    icon: <CircleHelpIcon />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = trpc.auth.me.useQuery()

  const userData = user
    ? {
        name: user.fullName,
        email: user.email,
        avatar: "",
      }
    : {
        name: "Loading...",
        email: "...",
        avatar: "",
      }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <ShieldIcon className="size-5! text-mint" />
                <span className="text-base font-semibold">MailForensix</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <NavMain items={[navItems[0]!]} />

        {/* Mailbox — collapsible Gmail folder dropdown */}
        <NavMailbox />

        {/* Rest of the nav */}
        <NavMain items={navItems.slice(1)} />

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
