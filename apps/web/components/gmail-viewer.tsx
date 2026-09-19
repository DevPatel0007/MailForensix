"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  Loader2,
  Mail,
  Paperclip,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Download,
  AlertTriangle,
  AlertOctagon,
  Globe2,
  Server,
  FileCode,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  FileText,
  Link2,
} from "lucide-react"
import { trpc } from "~/trpc/client"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"

type LabelId = "INBOX" | "SENT" | "DRAFT" | "STARRED" | "SPAM" | "TRASH" | "IMPORTANT"

export function GmailViewer({
  email: propEmail,
  initialLabel = "INBOX",
}: { email?: string; initialLabel?: LabelId } = {}) {
  const [labelId, setLabelId] = useState<LabelId>(initialLabel)
  const [pageToken, setPageToken] = useState<string | undefined>()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setLabelId(initialLabel)
    setPageToken(undefined)
    setSelectedId(null)
  }, [initialLabel])

  const connection = trpc.gmail.connection.useQuery()
  const messages = trpc.gmail.messages.useQuery(
    { labelId, maxResults: 20, pageToken },
    { enabled: connection.data?.connected === true }
  )
  const detail = trpc.gmail.message.useQuery(
    { id: selectedId ?? "" },
    { enabled: Boolean(selectedId) }
  )
  const analysis = trpc.gmail.analysis.useQuery(
    { id: selectedId ?? "" },
    { enabled: Boolean(selectedId) }
  )
  const connectUrl = trpc.gmail.connectUrl.useQuery(undefined, { enabled: false })
  const scan = trpc.gmail.scan.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        void analysis.refetch()
      }, 2500)
    },
  })

  const connect = async () => {
    const result = await connectUrl.refetch()
    if (result.data?.url) window.location.assign(result.data.url)
  }

  const downloadAnalysisJson = () => {
    if (!analysis.data) return
    const blob = new Blob([JSON.stringify(analysis.data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const subject = analysis.data?.subject || selectedId || "analysis"
    const date = analysis.data?.date ? new Date(analysis.data.date).toISOString().split("T")[0] : ""
    const from = analysis.data?.from || ""
    const to = analysis.data?.to || ""
    const baseName = `${subject}_${date}_${from}_${to}`.replace(/[^\w\s_-]/gi, "").replace(/\s+/g, "_")
    a.download = `${baseName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (connection.isLoading)
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-emerald-500" />
        <span>Authenticating Gmail session...</span>
      </div>
    )

  if (connection.isError) return <ErrorState onRetry={() => void connection.refetch()} />
  if (!connection.data?.connected) return <ConnectState onConnect={connect} loading={connectUrl.isFetching} />

  const currentLabelName = labelId.charAt(0) + labelId.slice(1).toLowerCase()

  // Filter messages by search query
  const rawList = messages.data?.messages || []
  const filteredMessages = searchQuery.trim()
    ? rawList.filter(
        (m) =>
          m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rawList

  const overallScore =
    analysis.data?.layer2?.score ??
    analysis.data?.layer1?.score ??
    (analysis.data?.layer3?.score ? analysis.data.layer3.score * 10 : 0)
  const isThreat = overallScore > 50

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* LEFT COLUMN: Message List */}
      <Card className={`${selectedId ? "lg:col-span-5" : "lg:col-span-12"} border border-border/60 bg-card transition-all`}>
        <CardHeader className="p-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="capitalize">{currentLabelName}</span>
                <span className="text-xs font-mono font-normal text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                  {filteredMessages.length}
                </span>
              </CardTitle>
              <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                {propEmail || connection.data?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => void messages.refetch()}
              aria-label="Refresh mailbox"
            >
              <RefreshCw className={`size-3.5 ${messages.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Search filter inside message list */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by subject or sender..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/30 border-border/60"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {messages.isLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-emerald-500" />
              <span>Fetching emails...</span>
            </div>
          ) : messages.isError ? (
            <ErrorState onRetry={() => void messages.refetch()} compact />
          ) : filteredMessages.length ? (
            <div className="divide-y divide-border/40 max-h-[620px] overflow-y-auto">
              {filteredMessages.map((message) => {
                const isSelected = selectedId === message.id

                return (
                  <button
                    key={message.id}
                    className={`block w-full p-3.5 text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-emerald-500/10 border-l-3 border-emerald-500"
                        : "hover:bg-muted/40 border-l-3 border-transparent"
                    }`}
                    onClick={() => setSelectedId(message.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate font-semibold text-xs text-foreground">
                        {message.subject || "(No Subject)"}
                      </span>
                      <time className="shrink-0 text-[10px] font-mono text-muted-foreground">
                        {message.date
                          ? new Date(message.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </time>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground font-mono">
                      {message.from || message.to}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground/70 line-clamp-1">
                      {message.snippet}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No emails found in this folder.
            </div>
          )}

          {/* Pagination Controls */}
          {(messages.data?.nextPageToken || pageToken) && (
            <div className="flex items-center justify-between border-t border-border/50 p-2.5 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!pageToken}
                onClick={() => {
                  setPageToken(undefined)
                  setSelectedId(null)
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!messages.data?.nextPageToken}
                onClick={() => {
                  setPageToken(messages.data?.nextPageToken ?? undefined)
                  setSelectedId(null)
                }}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: Forensic Investigation Suite */}
      {selectedId ? (
        <Card className="lg:col-span-7 border border-border/60 bg-card overflow-hidden sticky top-20">
          <CardHeader className="p-4 border-b border-border/50 bg-muted/15">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                      Forensic Target
                    </Badge>
                    {analysis.data && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono font-semibold uppercase ${
                          isThreat
                            ? "bg-red-500/10 text-red-500 border-red-500/30"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {isThreat ? "Threat Detected" : "Clean / Low Risk"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {detail.isLoading ? "Loading email..." : detail.data?.subject || "(No Subject)"}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {detail.data && (
                    <Button
                      size="sm"
                      onClick={() => scan.mutate({ id: detail.data.id })}
                      disabled={scan.isPending}
                      className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 font-semibold shadow-xs"
                    >
                      <ScanLine className={`size-3.5 ${scan.isPending ? "animate-spin" : ""}`} />
                      <span>{scan.isPending ? "Evaluating..." : "Run Deep Scan"}</span>
                    </Button>
                  )}
                  {analysis.data && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={downloadAnalysisJson}
                      title="Download Forensic JSON"
                    >
                      <Download className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {detail.data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-muted-foreground pt-1 border-t border-border/40">
                  <div className="truncate">
                    <span className="text-foreground/70">From:</span> {detail.data.from}
                  </div>
                  <div className="truncate">
                    <span className="text-foreground/70">Date:</span> {detail.data.date}
                  </div>
                </div>
              )}

              {scan.isSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-md">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Deep analysis dispatched. Generating layer intelligence reports.</span>
                </div>
              )}
              {scan.isError && (
                <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-2 rounded-md">
                  {scan.error.message}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {detail.isError ? (
              <ErrorState onRetry={() => void detail.refetch()} compact />
            ) : detail.data && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start h-9 p-0.5 bg-muted/50 border border-border/60 overflow-x-auto">
                  <TabsTrigger value="overview" className="text-xs gap-1.5 h-7">
                    <ShieldCheck className="size-3.5" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="auth" className="text-xs gap-1.5 h-7">
                    <Layers className="size-3.5" />
                    <span>Auth (L1)</span>
                  </TabsTrigger>
                  <TabsTrigger value="domain" className="text-xs gap-1.5 h-7">
                    <Globe2 className="size-3.5" />
                    <span>Domain & IP (L2)</span>
                  </TabsTrigger>
                  <TabsTrigger value="nlp" className="text-xs gap-1.5 h-7">
                    <AlertTriangle className="size-3.5" />
                    <span>Threat Signals (L3)</span>
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="text-xs gap-1.5 h-7">
                    <Paperclip className="size-3.5" />
                    <span>Artifacts (L4)</span>
                  </TabsTrigger>
                  <TabsTrigger value="body" className="text-xs gap-1.5 h-7">
                    <FileText className="size-3.5" />
                    <span>Body</span>
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: OVERVIEW */}
                <TabsContent value="overview" className="space-y-4 pt-3">
                  {analysis.isLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-8 justify-center">
                      <Loader2 className="size-4 animate-spin text-emerald-500" />
                      <span>Loading threat analysis report...</span>
                    </div>
                  ) : !analysis.data ? (
                    <div className="p-6 rounded-lg border border-dashed border-border text-center space-y-2">
                      <ShieldAlert className="size-8 text-muted-foreground/50 mx-auto" />
                      <p className="text-sm font-medium text-foreground">No analysis on file for this email</p>
                      <p className="text-xs text-muted-foreground">
                        Click "Run Deep Scan" above to execute all 4 forensic detection layers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Score Banner */}
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-muted/20">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">Forensic Risk Score</p>
                          <p className="text-[11px] text-muted-foreground">
                            {isThreat ? "High probability of deceptive or malicious attributes." : "Signatures align with authenticated sender parameters."}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold font-mono ${isThreat ? "text-red-500" : "text-emerald-500"}`}>
                            {overallScore}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono"> / 100</span>
                        </div>
                      </div>

                      {/* Summary Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded border border-border/60 bg-muted/20">
                          <span className="text-[10px] uppercase text-muted-foreground">SPF</span>
                          <p className="font-bold font-mono text-foreground mt-0.5">
                            {analysis.data.layer1?.authentication?.spf?.result?.toUpperCase() || "N/A"}
                          </p>
                        </div>
                        <div className="p-2.5 rounded border border-border/60 bg-muted/20">
                          <span className="text-[10px] uppercase text-muted-foreground">DKIM</span>
                          <p className="font-bold font-mono text-foreground mt-0.5">
                            {analysis.data.layer1?.authentication?.dkim?.result?.toUpperCase() || "N/A"}
                          </p>
                        </div>
                        <div className="p-2.5 rounded border border-border/60 bg-muted/20">
                          <span className="text-[10px] uppercase text-muted-foreground">DMARC</span>
                          <p className="font-bold font-mono text-foreground mt-0.5">
                            {analysis.data.layer1?.authentication?.dmarc?.result?.toUpperCase() || "N/A"}
                          </p>
                        </div>
                        <div className="p-2.5 rounded border border-border/60 bg-muted/20">
                          <span className="text-[10px] uppercase text-muted-foreground">Hops</span>
                          <p className="font-bold font-mono text-foreground mt-0.5">
                            {analysis.data.layer1?.receivedHopCount ?? 1}
                          </p>
                        </div>
                      </div>

                      {/* Threat Findings */}
                      {analysis.data.layer3?.judgement && (
                        <div className="p-3.5 rounded-lg border border-border/70 bg-card space-y-2">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Info className="size-3.5 text-emerald-500" /> Executive Threat Judgment
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground text-[11px]">BEC Pattern:</span>{" "}
                              <span className="font-medium text-foreground">{analysis.data.layer3.judgement.bec_pattern || "None detected"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-[11px]">Urgency Rating:</span>{" "}
                              <span className="font-medium text-foreground">{analysis.data.layer3.judgement.urgency_score ?? 0} / 10</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-[11px]">Impersonation Target:</span>{" "}
                              <span className="font-medium text-foreground">{analysis.data.layer3.judgement.impersonation_target || "None"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-[11px]">Tone Profile:</span>{" "}
                              <span className="font-medium text-foreground">{analysis.data.layer3.judgement.tone_analysis || "Standard"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 2: AUTHENTICATION (LAYER 1) */}
                <TabsContent value="auth" className="space-y-3 pt-3">
                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    {/* SPF Card */}
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/15 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">SPF</span>
                        <Badge
                          variant="outline"
                          className={
                            analysis.data?.layer1?.authentication?.spf?.result === "pass"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]"
                              : "bg-red-500/10 text-red-500 border-red-500/30 text-[10px]"
                          }
                        >
                          {analysis.data?.layer1?.authentication?.spf?.result?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {analysis.data?.layer1?.authentication?.spf?.comment || "Sender Policy Framework validates sender IP."}
                      </p>
                    </div>

                    {/* DKIM Card */}
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/15 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">DKIM</span>
                        <Badge
                          variant="outline"
                          className={
                            analysis.data?.layer1?.authentication?.dkim?.result === "pass"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]"
                              : "bg-red-500/10 text-red-500 border-red-500/30 text-[10px]"
                          }
                        >
                          {analysis.data?.layer1?.authentication?.dkim?.result?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {analysis.data?.layer1?.authentication?.dkim?.comment || "DomainKeys Identified Mail cryptographic signature."}
                      </p>
                    </div>

                    {/* DMARC Card */}
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/15 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">DMARC</span>
                        <Badge
                          variant="outline"
                          className={
                            analysis.data?.layer1?.authentication?.dmarc?.result === "pass"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]"
                              : "bg-red-500/10 text-red-500 border-red-500/30 text-[10px]"
                          }
                        >
                          {analysis.data?.layer1?.authentication?.dmarc?.result?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {analysis.data?.layer1?.authentication?.dmarc?.comment || "Domain-based Message Authentication alignment."}
                      </p>
                    </div>
                  </div>

                  {/* Signals List */}
                  {analysis.data?.layer1?.signals?.length > 0 && (
                    <div className="p-3 rounded-lg border border-border/60 bg-card space-y-1.5">
                      <span className="text-xs font-semibold text-foreground">Authentication Signals</span>
                      <ul className="space-y-1 text-xs">
                        {analysis.data.layer1.signals.map((s: any, i: number) => (
                          <li key={i} className="text-muted-foreground flex items-start gap-1.5 text-[11px]">
                            <span className="text-emerald-500">•</span>
                            <span>{s.explanation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                {/* TAB 3: DOMAIN & IP (LAYER 2) */}
                <TabsContent value="domain" className="space-y-3 pt-3">
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/15 space-y-2">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Server className="size-3.5 text-emerald-500" /> Sender Network Metadata
                      </span>
                      <div className="space-y-1 text-[11px] font-mono">
                        <div><span className="text-muted-foreground">IP:</span> {analysis.data?.layer2?.senderIp || "Unknown"}</div>
                        <div><span className="text-muted-foreground">Reverse DNS:</span> {analysis.data?.layer2?.reverseDns || "None"}</div>
                        <div><span className="text-muted-foreground">ASN:</span> {analysis.data?.layer2?.asn || "N/A"} ({analysis.data?.layer2?.asnOrganization || "Unknown Org"})</div>
                        <div><span className="text-muted-foreground">Country:</span> {analysis.data?.layer2?.country || "Unknown"}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-border/60 bg-muted/15 space-y-2">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Globe2 className="size-3.5 text-emerald-500" /> Domain & WHOIS Intelligence
                      </span>
                      <div className="space-y-1 text-[11px] font-mono">
                        <div><span className="text-muted-foreground">Domain:</span> {analysis.data?.layer2?.domain || "N/A"}</div>
                        <div><span className="text-muted-foreground">Age:</span> {analysis.data?.layer2?.domainAgeDays ? `${analysis.data.layer2.domainAgeDays} days` : "Unknown"}</div>
                        <div><span className="text-muted-foreground">WHOIS Privacy:</span> {analysis.data?.layer2?.whoisHidden ? "Hidden" : "Public"}</div>
                        <div><span className="text-muted-foreground">Cloud Provider:</span> {analysis.data?.layer2?.isCloudInfrastructure ? "Yes" : "No"}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 4: THREAT SIGNALS (LAYER 3) */}
                <TabsContent value="nlp" className="space-y-3 pt-3">
                  {analysis.data?.layer3?.signals?.length > 0 ? (
                    <div className="space-y-2">
                      {analysis.data.layer3.signals.map((s: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/15 flex items-start gap-2.5 text-xs">
                          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">{s.code}</span>
                            <p className="text-foreground text-xs">{s.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      No anomalous psychological or linguistic threat signals detected in message copy.
                    </div>
                  )}
                </TabsContent>

                {/* TAB 5: ARTIFACTS & URLS (LAYER 4) */}
                <TabsContent value="attachments" className="space-y-3 pt-3">
                  {/* Attachments */}
                  {detail.data.attachments.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-foreground">Message Attachments</span>
                      <div className="divide-y divide-border/50 border border-border/60 rounded-lg overflow-hidden text-xs">
                        {detail.data.attachments.map((att) => (
                          <div key={att.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-muted/20">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="font-mono text-xs text-foreground truncate">{att.filename}</span>
                              <span className="text-[10px] text-muted-foreground">({att.size} bytes)</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {att.mimeType}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      No file attachments detected in this message.
                    </div>
                  )}

                  {/* URLs */}
                  {analysis.data?.layer4?.urls?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-semibold text-foreground">Embedded Links Inspected</span>
                      <div className="divide-y divide-border/50 border border-border/60 rounded-lg overflow-hidden text-xs font-mono">
                        {analysis.data.layer4.urls.map((u: any, i: number) => (
                          <div key={i} className="p-2.5 flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-foreground max-w-[280px]">{u.url}</span>
                            <Badge variant="outline" className={u.verdict === "malicious" ? "text-red-500 border-red-500/30 text-[10px]" : "text-emerald-500 border-emerald-500/30 text-[10px]"}>
                              {u.verdict || "CLEAN"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* TAB 6: RAW & HTML BODY */}
                <TabsContent value="body" className="space-y-3 pt-3">
                  <div className="p-3.5 rounded-lg border border-border/60 bg-muted/10 font-mono text-xs text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                    {detail.data.bodyText || "No plain text content available."}
                  </div>

                  {detail.data.bodyHtml && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium text-emerald-600 dark:text-emerald-400 py-1">
                        Inspect Raw HTML Rendering (Sandboxed)
                      </summary>
                      <iframe
                        className="mt-2 min-h-64 w-full rounded border border-border/80 bg-white"
                        title="Sandboxed Email HTML Body"
                        sandbox=""
                        srcDoc={detail.data.bodyHtml}
                      />
                    </details>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function ConnectState({ onConnect, loading }: { onConnect: () => void; loading: boolean }) {
  return (
    <Card className="rounded-xl border border-border/70 bg-card max-w-lg mx-auto my-12">
      <CardContent className="flex flex-col items-center justify-center text-center p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4">
          <Mail className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Connect Gmail Mailbox</h2>
        <p className="mt-2 text-xs text-muted-foreground max-w-sm">
          Authorize read-only access to inspect email headers, scan message attachments, and evaluate phishing threat telemetry.
        </p>
        <Button
          className="mt-6 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 shadow-xs"
          onClick={onConnect}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-3.5 animate-spin" /> Connecting...
            </>
          ) : (
            "Authenticate with Google"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function ErrorState({ onRetry, compact = false }: { onRetry: () => void; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "min-h-32 p-4" : "min-h-64 p-8"}`}>
      <AlertTriangle className="size-6 text-amber-500 mb-2" />
      <p className="text-xs text-muted-foreground">Session requires re-authentication or check network connection.</p>
      <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={onRetry}>
        Retry Query
      </Button>
    </div>
  )
}
