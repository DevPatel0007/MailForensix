"use client";

import { useState } from "react";
import { FileText, Inbox, Loader2, LogOut, Mail, Paperclip, RefreshCw, Send, ShieldCheck, Star, Trash2 } from "lucide-react";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const icons: Record<string, typeof Inbox> = { INBOX: Inbox, SENT: Send, DRAFT: FileText, STARRED: Star, SPAM: ShieldCheck, TRASH: Trash2 };

type LabelId = "INBOX" | "SENT" | "DRAFT" | "STARRED" | "SPAM" | "TRASH" | "IMPORTANT";

export function GmailViewer({ email }: { email: string }) {
  const [labelId, setLabelId] = useState<LabelId>("INBOX");
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const connection = trpc.gmail.connection.useQuery();
  const labels = trpc.gmail.labels.useQuery(undefined, { enabled: connection.data?.connected === true });
  const messages = trpc.gmail.messages.useQuery({ labelId, maxResults: 20, pageToken }, { enabled: connection.data?.connected === true });
  const detail = trpc.gmail.message.useQuery({ id: selectedId ?? "" }, { enabled: Boolean(selectedId) });
  const connectUrl = trpc.gmail.connectUrl.useQuery(undefined, { enabled: false });
  const disconnect = trpc.gmail.disconnect.useMutation({ onSuccess: () => { void connection.refetch(); void labels.refetch(); } });

  const connect = async () => {
    const result = await connectUrl.refetch();
    if (result.data?.url) window.location.assign(result.data.url);
  };

  if (connection.isLoading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="size-6 animate-spin" /></div>;
  if (connection.isError) return <ErrorState onRetry={() => void connection.refetch()} />;
  if (!connection.data?.connected) return <ConnectState onConnect={connect} loading={connectUrl.isFetching} />;

  const activeLabel = labels.data?.labels.find((label) => label.id === labelId);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader><CardTitle className="text-base">{email}</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {(labels.data?.labels ?? []).map((label) => { const Icon = icons[label.id] ?? Mail; return <button key={label.id} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted ${label.id === labelId ? "bg-muted font-medium" : ""}`} onClick={() => { setLabelId(label.id as LabelId); setPageToken(undefined); setSelectedId(null); }}><span className="flex items-center gap-2"><Icon className="size-4" />{label.name}</span><span className="text-muted-foreground">{label.unread}</span></button>; })}
          <Button variant="outline" className="mt-4 w-full" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}><LogOut className="mr-2 size-4" />Disconnect</Button>
        </CardContent>
      </Card>
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>{activeLabel?.name ?? labelId}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{activeLabel?.total ?? 0} messages, {activeLabel?.unread ?? 0} unread</p></div><Button variant="ghost" size="icon" onClick={() => void messages.refetch()} aria-label="Refresh mailbox"><RefreshCw className="size-4" /></Button></CardHeader>
          <CardContent className="p-0">{messages.isLoading ? <div className="flex min-h-32 items-center justify-center"><Loader2 className="size-5 animate-spin" /></div> : messages.isError ? <ErrorState onRetry={() => void messages.refetch()} compact /> : messages.data?.messages.length ? <div>{messages.data.messages.map((message) => <button key={message.id} className={`block w-full border-t p-4 text-left hover:bg-muted ${selectedId === message.id ? "bg-muted" : ""}`} onClick={() => setSelectedId(message.id)}><div className="flex items-start justify-between gap-4"><span className="truncate font-medium">{message.subject}</span><time className="shrink-0 text-xs text-muted-foreground">{message.date ? new Date(message.date).toLocaleDateString() : ""}</time></div><p className="mt-1 truncate text-sm text-muted-foreground">{message.from || message.to}</p><p className="mt-1 truncate text-sm text-muted-foreground">{message.snippet}</p></button>)}</div> : <p className="p-6 text-sm text-muted-foreground">This folder is empty.</p>}
          {(messages.data?.nextPageToken || pageToken) && <div className="flex justify-between border-t p-4"><Button variant="outline" disabled={!pageToken} onClick={() => { setPageToken(undefined); setSelectedId(null); }}>Previous</Button><Button variant="outline" disabled={!messages.data?.nextPageToken} onClick={() => { setPageToken(messages.data?.nextPageToken ?? undefined); setSelectedId(null); }}>Next</Button></div>}
          </CardContent>
        </Card>
        {selectedId && <Card><CardHeader><CardTitle>{detail.isLoading ? "Loading message..." : detail.data?.subject}</CardTitle>{detail.data && <p className="text-sm text-muted-foreground">From {detail.data.from} · {detail.data.date}</p>}</CardHeader><CardContent>{detail.isError ? <ErrorState onRetry={() => void detail.refetch()} compact /> : detail.data && <div className="space-y-6"><div className="whitespace-pre-wrap text-sm">{detail.data.bodyText || "No plain-text body available."}</div>{detail.data.bodyHtml && <details><summary className="cursor-pointer text-sm font-medium">View HTML body</summary><iframe className="mt-3 min-h-64 w-full rounded border" title="Email HTML body" sandbox="" srcDoc={detail.data.bodyHtml} /></details>}{detail.data.attachments.length > 0 && <div><h3 className="mb-2 text-sm font-medium">Attachments</h3><ul className="space-y-2">{detail.data.attachments.map((attachment) => <li key={attachment.id} className="flex items-center gap-2 text-sm"><Paperclip className="size-4 text-muted-foreground" />{attachment.filename}<span className="text-muted-foreground">({attachment.mimeType}, {attachment.size} bytes)</span></li>)}</ul></div>}</div>}</CardContent></Card>}
      </div>
    </div>
  );
}

function ConnectState({ onConnect, loading }: { onConnect: () => void; loading: boolean }) { return <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><Mail className="mb-4 size-10 text-primary" /><h2 className="text-xl font-semibold">Connect Gmail</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Grant read-only Gmail access to view your inbox, sent mail, drafts, and message details.</p><Button className="mt-6" onClick={onConnect} disabled={loading}>{loading ? "Opening Google..." : "Connect with Google"}</Button></CardContent></Card>; }
function ErrorState({ onRetry, compact = false }: { onRetry: () => void; compact?: boolean }) { return <div className={`flex flex-col items-center justify-center text-center ${compact ? "min-h-32 p-6" : "min-h-64 p-6"}`}><p className="text-sm text-muted-foreground">Gmail access needs attention. Reconnect or try again.</p><Button variant="outline" className="mt-4" onClick={onRetry}>Try again</Button></div>; }
