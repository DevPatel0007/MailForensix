"use client"

import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { name: 'Mon', safe: 4000, threats: 240 },
  { name: 'Tue', safe: 3000, threats: 139 },
  { name: 'Wed', safe: 2000, threats: 980 },
  { name: 'Thu', safe: 2780, threats: 390 },
  { name: 'Fri', safe: 1890, threats: 480 },
  { name: 'Sat', safe: 2390, threats: 380 },
  { name: 'Sun', safe: 3490, threats: 430 },
]

export default function AnalyticsPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Analytics Overview</h1>
            <p className="text-steel mb-4">A detailed breakdown of your scanned email traffic.</p>
            
            <Card className="rounded-lg border-hairline bg-canvas">
              <CardHeader>
                <CardTitle>Email Traffic & Threats</CardTitle>
                <CardDescription>Safe vs Threat volume over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
                      <XAxis dataKey="name" stroke="var(--steel)" />
                      <YAxis stroke="var(--steel)" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--hairline)' }} />
                      <Bar dataKey="safe" stackId="a" fill="var(--mint)" />
                      <Bar dataKey="threats" stackId="a" fill="var(--threat)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
