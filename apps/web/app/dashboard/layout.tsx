import * as React from "react"
import { AppSidebar } from "~/components/app-sidebar"
import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in-50 duration-200">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
