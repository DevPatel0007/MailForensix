"use client"

import * as React from "react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { trpc } from "~/trpc/client"
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Activity,
  ScanLine,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react"

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = trpc.gmail.analyticsStats.useQuery()

  const total = analytics?.totalScans ?? 0
  const threats = analytics?.threatsDetected ?? 0
  const safe = analytics?.safeEmails ?? 0
  const avg = analytics?.averageScore ?? 0
  const detectionRate = analytics?.detectionRate ?? 0
  const cleanRate = analytics?.cleanRate ?? (total === 0 ? 100 : 0)
  const weeklyChange = analytics?.weeklyVolumeChange ?? 0
  const timeline = analytics?.trafficTimeline || []
  const vectors = analytics?.threatVectors || []

  const pieData = [
    { name: "Safe", value: safe > 0 ? safe : (threats === 0 ? 1 : 0), color: "#00d4a4" },
    { name: "Threats", value: threats, color: "#ef4444" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Threat & Forensic Analytics
            </h1>
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              Realtime Telemetry
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Aggregated threat vector distributions, authentication compliance rates, and multi-layer anomaly tracking.
          </p>
        </div>

        <Button asChild size="sm" className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 font-semibold shadow-xs">
          <Link href="/dashboard/mailbox">
            <ScanLine className="size-3.5" />
            <span>Scan Emails</span>
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Evaluated */}
        <Card className="border border-border/60 bg-card">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Evaluated
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1">
            <div className="text-2xl font-mono font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : total}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {weeklyChange >= 0 ? (
                <>
                  <TrendingUp className="size-3" /> +{weeklyChange}% weekly volume
                </>
              ) : (
                <>
                  <TrendingDown className="size-3 text-red-500" /> {weeklyChange}% weekly volume
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Threat Detection Rate */}
        <Card className="border border-border/60 bg-card">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Threat Detection Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1">
            <div className="text-2xl font-mono font-bold text-red-500">
              {isLoading ? <Skeleton className="h-8 w-16" /> : `${detectionRate}%`}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isLoading ? "..." : `${threats} anomalous items detected`}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Clean Authenticity Rate */}
        <Card className="border border-border/60 bg-card">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Clean Authenticity Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1">
            <div className="text-2xl font-mono font-bold text-emerald-500">
              {isLoading ? <Skeleton className="h-8 w-16" /> : `${cleanRate}%`}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Full SPF/DKIM validation
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Mean Risk Index */}
        <Card className="border border-border/60 bg-card">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mean Risk Index
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1">
            <div className="text-2xl font-mono font-bold text-foreground">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  {avg} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
              {avg <= 25 ? "Low risk envelope maintained" : avg <= 50 ? "Moderate threat risk" : "Elevated threat risk"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Email Volume & Threat Frequency Area Chart */}
        <Card className="lg:col-span-8 border border-border/60 bg-card">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Email Volume & Threat Frequency</CardTitle>
                <CardDescription className="text-xs">
                  Daily distribution of verified safe messages versus identified threat vectors
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" /> Safe
                </span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="size-2 rounded-full bg-red-500" /> Threat
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            {isLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center text-xs text-muted-foreground">
                Loading telemetry trends...
              </div>
            ) : total === 0 ? (
              <div className="h-[300px] w-full flex flex-col items-center justify-center text-center gap-2 border border-dashed rounded-lg">
                <ShieldAlert className="size-8 text-muted-foreground/40" />
                <p className="text-xs font-medium text-foreground">No email scan volume recorded yet</p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Scan your mailbox to generate live daily threat telemetry trends.
                </p>
              </div>
            ) : (
              <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="safeGradLive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4a4" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#00d4a4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="threatGradLive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="safe"
                      name="Safe Emails"
                      stroke="#00d4a4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#safeGradLive)"
                    />
                    <Area
                      type="monotone"
                      dataKey="threats"
                      name="Threats"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#threatGradLive)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transmission Ratio Donut Card */}
        <Card className="lg:col-span-4 border border-border/60 bg-card flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">Transmission Ratio</CardTitle>
            <CardDescription className="text-xs">
              Overall integrity balance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="h-[210px] w-[210px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono text-foreground">{safe}</span>
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Safe / Clean</span>
              </div>
            </div>

            <div className="w-full mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/40">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" /> Authenticated Safe
                </span>
                <span className="font-mono font-semibold text-foreground">{safe}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/40">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full bg-red-500" /> Malicious Flags
                </span>
                <span className="font-mono font-semibold text-foreground">{threats}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prevalent Threat Vectors */}
      <Card className="border border-border/60 bg-card">
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Prevalent Threat Vectors</CardTitle>
          <CardDescription className="text-xs">
            Distribution of identified deception techniques categorized by Layer 1–4 intelligence
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vectors.map((v, i) => (
              <div key={i} className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground truncate">{v.type}</span>
                  <span className="font-mono text-xs font-bold text-foreground">{v.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/80 overflow-hidden">
                  <div className={`h-full ${v.color}`} style={{ width: v.share === "0%" ? "2%" : v.share }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Relative prevalence</span>
                  <span>{v.share}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
