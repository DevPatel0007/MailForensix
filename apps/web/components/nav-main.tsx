"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"

export function NavMain({
  label,
  items,
}: {
  label?: string
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    badge?: string | number
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="py-1.5">
      {label && (
        <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 pb-1.5">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "h-8 px-2.5 rounded-md text-sm font-medium transition-all duration-150 ease-out",
                    isActive
                      ? "bg-emerald-500/10 text-foreground border border-emerald-500/20 font-medium shadow-2xs [&>svg]:text-emerald-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 [&>svg]:text-muted-foreground/80 hover:[&>svg]:text-foreground"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="truncate">{item.title}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto text-[11px] font-mono text-muted-foreground px-1.5 py-0.2 rounded bg-muted/60">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
