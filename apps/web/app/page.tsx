"use client";

import { Loader2 } from "lucide-react";
import { GmailViewer } from "~/components/gmail-viewer";
import { trpc } from "~/trpc/client";

export default function HomePage() {
  const me = trpc.auth.me.useQuery();

  if (me.isLoading) return <main className="flex min-h-svh items-center justify-center"><Loader2 className="size-6 animate-spin" /></main>;
  if (me.isError) return <main className="flex min-h-svh items-center justify-center p-6 text-center"><div><h1 className="text-3xl font-semibold">Streamyst Gmail workspace</h1><p className="mt-2 text-muted-foreground">Sign in to securely inspect your Gmail messages.</p><a className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground" href="/login">Log in with Google</a></div></main>;

  const user = me.data;
  if (!user) return null;
  return <main className="min-h-svh bg-muted/30 p-6 md:p-10"><div className="mx-auto max-w-6xl"><div className="mb-8"><p className="text-sm font-medium text-primary">Streamyst</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Email workspace</h1><p className="mt-2 text-muted-foreground">Review your Gmail messages securely as {user.email}.</p></div><GmailViewer email={user.email} /></div></main>;
}
