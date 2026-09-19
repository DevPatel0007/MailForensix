"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { AnimatedThemeToggler } from "~/components/ui/animated-theme-toggler"
import { CommandMenu } from "~/components/command-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "~/components/ui/button"
import { Search, Bell, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react"

const ROUTE_LABELS: Record<string, { group?: string; title: string }> = {
  "/dashboard": { title: "Overview" },
  "/dashboard/mailbox": { title: "Mailbox & Forensics" },
  "/dashboard/analytics": { group: "Security", title: "Analytics" },
  "/dashboard/scans": { group: "Security", title: "Past Scans" },
  "/dashboard/geolocation": { group: "Security", title: "Geolocation Tracking" },
  "/dashboard/settings": { title: "Settings" },
  "/dashboard/help": { title: "Documentation" },
}

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentRoute = ROUTE_LABELS[pathname] || { title: "Overview" }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/85 backdrop-blur-md px-4 lg:px-6 transition-[width,height] ease-linear">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="mx-1 h-4 bg-border/60" />
          
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList className="text-xs font-medium">
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  MailForensix
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentRoute.group && (
                <>
                  <BreadcrumbSeparator className="text-muted-foreground/40" />
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">{currentRoute.group}</span>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator className="text-muted-foreground/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground">
                  {currentRoute.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen(true)}
            className="h-8 gap-2 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border/70 bg-card/60 shadow-none font-normal"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Quick search...</span>
            <kbd className="pointer-events-none hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </Button>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Security notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border/80">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security Feed</span>
                <span className="text-[11px] text-emerald-500 font-medium">All systems online</span>
              </div>
              <div className="divide-y divide-border/40 max-h-72 overflow-y-auto text-xs">
                <div className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">Analysis engine active</p>
                    <p className="text-[11px] text-muted-foreground">Layer 1-4 pipeline ready for deep inspections.</p>
                    <p className="text-[10px] text-muted-foreground/60">Just now</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">Geolocation telemetry synced</p>
                    <p className="text-[11px] text-muted-foreground">Sender hop trace database updated.</p>
                    <p className="text-[10px] text-muted-foreground/60">10m ago</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Animated theme toggler — strictly preserved Magic UI view transition */}
          {mounted ? (
            <AnimatedThemeToggler
              variant="circle"
              duration={400}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              onThemeChange={(t) => setTheme(t)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            />
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
      </header>

      {/* Global Command Menu */}
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
