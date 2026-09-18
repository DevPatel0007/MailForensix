"use client"

import { AppSidebar } from "~/components/app-sidebar"
import { ShieldCheck, AlertTriangle, Mail, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { trpc } from "~/trpc/client"

import data from "./data.json"

export default function Page() {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
              <OverviewContent />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function OverviewContent() {
  const { data: stats, isLoading } = trpc.gmail.dashboardStats.useQuery()
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-lg border-hairline bg-canvas">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-steel">Total Scanned</CardTitle>
          <Mail className="h-4 w-4 text-stone" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-ink">{isLoading ? "..." : stats?.totalScans ?? 0}</div>
          <p className="text-xs text-stone">+20% from last month</p>
        </CardContent>
      </Card>
      <Card className="rounded-lg border-hairline bg-canvas">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-steel">Threats Detected</CardTitle>
          <AlertTriangle className="h-4 w-4 text-threat" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-ink">{isLoading ? "..." : stats?.threatsDetected ?? 0}</div>
          <p className="text-xs text-stone">+4% from last month</p>
        </CardContent>
      </Card>
      <Card className="rounded-lg border-hairline bg-canvas">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-steel">Safe Emails</CardTitle>
          <ShieldCheck className="h-4 w-4 text-mint" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-ink">{isLoading ? "..." : stats?.safeEmails ?? 0}</div>
          <p className="text-xs text-stone">+21% from last month</p>
        </CardContent>
      </Card>
      <Card className="rounded-lg border-hairline bg-canvas">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-steel">Average Security Score</CardTitle>
          <Activity className="h-4 w-4 text-mint-deep" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-ink">{isLoading ? "..." : stats?.averageScore?.toFixed(1) ?? "0.0"} / 100</div>
          <p className="text-xs text-stone">+1.2 points from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}
