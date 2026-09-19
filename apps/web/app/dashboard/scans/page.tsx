"use client"

import * as React from "react"
import Link from "next/link"
import { trpc } from "~/trpc/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Skeleton } from "~/components/ui/skeleton"
import {
  Search,
  History,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Filter,
  ArrowUpDown,
} from "lucide-react"

export default function ScansPage() {
  const { data, isLoading } = trpc.gmail.pastScans.useQuery()
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<"ALL" | "SAFE" | "THREAT">("ALL")

  const scans = data?.scans || []

  const filteredScans = scans.filter((scan: any) => {
    const score = scan.layer2?.score ?? scan.layer1?.score ?? 0
    const isThreat = score > 50

    if (filter === "SAFE" && isThreat) return false
    if (filter === "THREAT" && !isThreat) return false

    if (search.trim()) {
      const q = search.toLowerCase()
      const subject = (scan.subject || "").toLowerCase()
      const from = (scan.from || "").toLowerCase()
      const id = (scan._id || "").toLowerCase()
      return subject.includes(q) || from.includes(q) || id.includes(q)
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Past Forensic Scans
          </h1>
          <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
            Audit Trail
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Historical investigation log of evaluated emails, header authentications, and threat indicators.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-border/60 bg-card">
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by subject, sender, or scan ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/20 border-border/60"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Button
              variant={filter === "ALL" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("ALL")}
              className="h-7 text-xs px-2.5"
            >
              All ({scans.length})
            </Button>
            <Button
              variant={filter === "SAFE" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("SAFE")}
              className="h-7 text-xs px-2.5 text-emerald-600 dark:text-emerald-400"
            >
              Safe Only
            </Button>
            <Button
              variant={filter === "THREAT" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("THREAT")}
              className="h-7 text-xs px-2.5 text-red-500"
            >
              Threats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border border-border/60 bg-card">
        <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Forensic Investigation Log</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Showing {filteredScans.length} of {scans.length} processed security records
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/60">
                  <TableHead className="text-xs font-medium text-muted-foreground w-[120px]">Scan ID</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground w-[130px]">Timestamp</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Subject</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Sender</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground w-[110px]">Threat Index</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground w-[90px]">Status</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredScans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="size-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium">No forensic logs matching filter</p>
                        <p className="text-xs text-muted-foreground/70">
                          Clear search or run new scans from the Mailbox to inspect messages.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScans.map((scan: any) => {
                    const score = scan.layer2?.score ?? scan.layer1?.score ?? 0
                    const isThreat = score > 50

                    return (
                      <TableRow key={scan._id} className="border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                          {scan._id ? `${scan._id.slice(0, 8)}...` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(scan.date || scan.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-xs text-foreground max-w-[240px] truncate">
                          {scan.subject || "(No Subject)"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate font-mono">
                          {scan.from || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-8 rounded-full bg-muted/60 overflow-hidden">
                              <div
                                className={`h-full ${isThreat ? "bg-red-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(score, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-medium text-foreground">{score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-mono tracking-wider font-semibold py-0.5 px-2 ${
                              isThreat
                                ? "bg-red-500/10 text-red-500 border-red-500/30"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {isThreat ? "Threat" : "Safe"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground">
                            <Link href="/dashboard/mailbox">
                              Inspect
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
