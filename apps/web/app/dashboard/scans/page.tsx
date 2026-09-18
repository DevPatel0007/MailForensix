"use client"

import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/app-sidebar"
import { trpc } from "~/trpc/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"

export default function ScansPage() {
  const { data, isLoading } = trpc.gmail.pastScans.useQuery()

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
            <h1 className="text-2xl font-bold tracking-tight text-ink">Past Scans</h1>
            <p className="text-steel mb-4">A historical log of all emails analyzed by MailForensix.</p>
            
            <Card className="rounded-lg border-hairline bg-canvas">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest {data?.scans?.length || 0} emails processed.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-hairline">
                  <Table>
                    <TableHeader className="bg-surface">
                      <TableRow className="border-hairline-soft">
                        <TableHead className="text-steel font-medium">Date</TableHead>
                        <TableHead className="text-steel font-medium">Subject</TableHead>
                        <TableHead className="text-steel font-medium">From</TableHead>
                        <TableHead className="text-steel font-medium">Score</TableHead>
                        <TableHead className="text-steel font-medium text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-steel">Loading scans...</TableCell>
                        </TableRow>
                      ) : data?.scans?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-steel">No scans found.</TableCell>
                        </TableRow>
                      ) : (
                        data?.scans?.map((scan: any) => {
                          const score = scan.layer2?.score || scan.layer1?.score || 0;
                          const isThreat = score > 50;
                          
                          return (
                            <TableRow key={scan._id} className="border-hairline-soft hover:bg-surface-soft">
                              <TableCell className="font-medium text-ink">
                                {new Date(scan.date || scan.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-ink">{scan.subject || "(No Subject)"}</TableCell>
                              <TableCell className="text-steel">{scan.from}</TableCell>
                              <TableCell className="text-ink">{score}/100</TableCell>
                              <TableCell className="text-right">
                                <Badge 
                                  variant="outline" 
                                  className={isThreat 
                                    ? "bg-[rgba(212,86,86,0.15)] text-threat border-threat/20 font-semibold text-[11px] uppercase tracking-wider rounded-sm px-1.5 py-0.5" 
                                    : "bg-[rgba(27,166,115,0.15)] text-mint-deep border-mint/20 font-semibold text-[11px] uppercase tracking-wider rounded-sm px-1.5 py-0.5"}
                                >
                                  {isThreat ? "Threat" : "Safe"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
