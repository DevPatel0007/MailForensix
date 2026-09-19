"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldCheck,
  AlertTriangle,
  Mail,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ScanLine,
  History,
  CheckCircle2,
  AlertOctagon,
  ExternalLink,
  Shield,
  Search,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { trpc } from "~/trpc/client"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.gmail.dashboardStats.useQuery()
  const { data: pastScans, isLoading: scansLoading } = trpc.gmail.pastScans.useQuery()

  const recentScans = (pastScans?.scans || []).slice(0, 7)

  const avgScore = stats?.averageScore ? Number(stats.averageScore.toFixed(1)) : 0
  const safeCount = stats?.safeEmails ?? 0
  const threatCount = stats?.threatsDetected ?? 0
  const totalScans = stats?.totalScans ?? 0

  // Calculate threat distribution percentages
  const safePercent = totalScans > 0 ? Math.round((safeCount / totalScans) * 100) : 100
  const threatPercent = totalScans > 0 ? Math.round((threatCount / totalScans) * 100) : 0

  // Risk Classification
  const getRiskLevel = (score: number) => {
    if (score <= 20) return { label: "Optimal Security", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
    if (score <= 50) return { label: "Low Threat Risk", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
    if (score <= 75) return { label: "Elevated Risk", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" }
    return { label: "Critical Hazard", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" }
  }

  const risk = getRiskLevel(avgScore)

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Security Overview
            </h1>
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              Live Monitoring
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Continuous email forensics, threat telemetry, and sender validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs shadow-none border-border/70 hover:border-border">
            <Link href="/dashboard/scans">
              <History className="size-3.5" />
              <span>Past Scans</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 font-semibold shadow-xs">
            <Link href="/dashboard/mailbox">
              <ScanLine className="size-3.5" />
              <span>Scan Mailbox</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Four Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Scanned */}
        <Card className="border border-border/60 bg-card hover:border-border/90 hover:shadow-xs transition-all duration-150 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Scanned
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
              <Mail className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              {statsLoading ? <Skeleton className="h-8 w-16" /> : totalScans}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3 shrink-0" />
              <span>+20% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Threats Detected */}
        <Card className="border border-border/60 bg-card hover:border-border/90 hover:shadow-xs transition-all duration-150 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Threats Detected
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              {statsLoading ? <Skeleton className="h-8 w-16" /> : threatCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>{threatPercent}% of total emails</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Safe Emails */}
        <Card className="border border-border/60 bg-card hover:border-border/90 hover:shadow-xs transition-all duration-150 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Safe Emails
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              {statsLoading ? <Skeleton className="h-8 w-16" /> : safeCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span>{safePercent}% verified clean</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Average Security Score */}
        <Card className="border border-border/60 bg-card hover:border-border/90 hover:shadow-xs transition-all duration-150 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Threat Score
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Activity className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  {avgScore} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>Lower score is safer</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Security Overview Analytics Section */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Security Score Gauge Card */}
        <Card className="lg:col-span-5 border border-border/60 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Security Posture Gauge</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Aggregate risk computed across Layers 1–4
                </CardDescription>
              </div>
              <Badge variant="outline" className={`text-xs ${risk.bg} ${risk.color} ${risk.border}`}>
                {risk.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/20 border border-border/40">
              {/* Radial gauge representation */}
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="text-muted/40"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className={avgScore > 50 ? "text-red-500" : "text-emerald-500"}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(avgScore, 100) / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                    {statsLoading ? "..." : avgScore}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Risk Index
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 w-full pt-4 border-t border-border/50 text-center">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Status Verdict</p>
                  <p className="text-xs font-semibold text-foreground">
                    {avgScore <= 50 ? "Safe Overall" : "Action Required"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Layer Telemetry</p>
                  <p className="text-xs font-semibold text-emerald-500">Active (4 Layers)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Threat Distribution & Classification */}
        <Card className="lg:col-span-7 border border-border/60 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Threat Distribution</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Breakdown of analyzed email safety classifications
                </CardDescription>
              </div>
              <Link href="/dashboard/analytics" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                Full analytics <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {/* Horizontal stacked visual bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">Email Verdict Ratio</span>
                <span className="text-muted-foreground font-mono">{totalScans} evaluated</span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/50 p-0.5 border border-border/50">
                <div
                  className="bg-emerald-500 rounded-l-full transition-all duration-500"
                  style={{ width: `${safePercent}%` }}
                  title={`Safe: ${safePercent}%`}
                />
                <div
                  className="bg-red-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${threatPercent}%` }}
                  title={`Threats: ${threatPercent}%`}
                />
              </div>
            </div>

            {/* Distribution metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" /> Verified Clean
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">{safeCount}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Valid SPF, DKIM, and DMARC alignments without suspicious indicators.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                    <AlertOctagon className="size-3.5" /> High Risk & Threats
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">{threatCount}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Failed authentication, spoofed sender domains, or suspicious attachments.
                </p>
              </div>
            </div>

            {/* Forensic pipeline layers indicator */}
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">Forensics Pipeline:</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-background border border-border/80 text-[11px] font-mono">
                  L1 Auth
                </span>
                <span className="px-2 py-0.5 rounded bg-background border border-border/80 text-[11px] font-mono">
                  L2 Domain & WHOIS
                </span>
                <span className="px-2 py-0.5 rounded bg-background border border-border/80 text-[11px] font-mono">
                  L3 NLP & BEC
                </span>
                <span className="px-2 py-0.5 rounded bg-background border border-border/80 text-[11px] font-mono">
                  L4 Attachments
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Forensic Activity Table */}
      <Card className="border border-border/60 bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Forensic Activity</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Latest email security evaluations and threat classifications
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/scans" className="flex items-center gap-1">
              <span>View all scans</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/60">
                  <TableHead className="text-xs font-medium text-muted-foreground w-[130px]">Date</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Subject</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">Sender</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground w-[110px]">Threat Score</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground w-[100px]">Verdict</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scansLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-14 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : recentScans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Shield className="size-8 text-muted-foreground/40" />
                        <p className="text-sm font-medium">No scans recorded yet</p>
                        <p className="text-xs text-muted-foreground/70 max-w-sm">
                          Connect your Gmail in the Mailbox section to run live forensic evaluations on your emails.
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
                          <Link href="/dashboard/mailbox">Go to Mailbox</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentScans.map((scan: any) => {
                    const score = scan.layer2?.score ?? scan.layer1?.score ?? 0
                    const isThreat = score > 50

                    return (
                      <TableRow key={scan._id} className="border-border/40 hover:bg-muted/30 transition-colors">
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
                            <div className="h-1.5 w-10 rounded-full bg-muted/60 overflow-hidden">
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
                            <Link href={`/dashboard/mailbox`}>
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
