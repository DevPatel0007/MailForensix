"use client";

import { Loader2 } from "lucide-react";
import { GmailViewer } from "~/components/gmail-viewer";
import { trpc } from "~/trpc/client";

export default function WorkspacePage() {
  const me = trpc.auth.me.useQuery();

  if (me.isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-mint" />
      </main>
    );
  }

  if (me.isError || !me.data) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6 text-center bg-background">
        <div className="max-w-md rounded-xl border border-hairline bg-surface p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">MailForensix Workspace</h1>
          <p className="mt-3 text-sm text-muted-foreground">Sign in with your Google account to securely inspect your email messages and headers.</p>
          <a
            className="mt-6 inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-mint-soft transition-colors"
            href="/api-auth/google"
          >
            Log in with Google
          </a>
        </div>
      </main>
    );
  }

  const user = me.data;
  return (
    <main className="min-h-svh bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-hairline pb-6">
          <div>
            <p className="font-mono text-xs text-mint">MailForensix Workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Email Investigation Workspace</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review your Gmail messages securely as {user.email}.</p>
          </div>
          <a
            href="/"
            className="rounded-lg border border-hairline bg-surface px-4 py-2 text-xs font-medium text-foreground hover:border-steel transition-colors"
          >
            Back to Landing
          </a>
        </div>
        <GmailViewer email={user.email} />
      </div>
    </main>
  );
}
