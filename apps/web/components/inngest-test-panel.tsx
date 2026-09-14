"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { trpc } from "~/trpc/client";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

const sampleEvent = {
  name: "mail.received",
  data: {
    gmailMessageId: "<enter-real-gmail-message-id>",
    userId: "<authenticated-user-id>",
    accountId: "<connected-google-account-id>",
    message: "<raw-rfc822-email>",
    senderIp: "0.0.0.0",
    helo: "",
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "Example message",
    date: "2026-09-09T12:00:00.000Z",
  },
};

export function InngestTestPanel() {
  const [messageId, setMessageId] = useState("");
  const scan = trpc.gmail.scan.useMutation();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Submit a Gmail message</CardTitle>
            <Badge variant="outline">mail.received</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Use a real Gmail message ID to run Layer 1 and Layer 2 sequentially through Gmail, Inngest, and MongoDB.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={messageId} onChange={(event) => setMessageId(event.target.value)} placeholder="Gmail message ID" aria-label="Gmail message ID" />
          <Button onClick={() => scan.mutate({ id: messageId })} disabled={!messageId.trim() || scan.isPending}>
            {scan.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ScanLine className="mr-2 size-4" />}
            {scan.isPending ? "Submitting..." : "Run full analysis"}
          </Button>
          {scan.isSuccess && <p className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="size-4" />Submitted. Layer 2 starts automatically after Layer 1.</p>}
          {scan.isError && <p className="text-sm text-destructive">{scan.error.message}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Event contract</CardTitle></CardHeader>
        <CardContent><pre className="max-h-[520px] overflow-auto rounded-lg bg-muted p-3 text-xs leading-5"><code>{JSON.stringify(sampleEvent, null, 2)}</code></pre></CardContent>
      </Card>
    </div>
  );
}