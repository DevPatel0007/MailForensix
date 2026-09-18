"use client"

import { useTheme } from "next-themes"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { AnimatedThemeToggler } from "~/components/ui/animated-theme-toggler"

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <span className="text-base font-medium text-ink flex-1">MailForensix</span>

        {/* Animated theme toggler — controlled via next-themes */}
        <AnimatedThemeToggler
          variant="circle"
          duration={400}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          onThemeChange={(t) => setTheme(t)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
        />
      </div>
    </header>
  )
}
