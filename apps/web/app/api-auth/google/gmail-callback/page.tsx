"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";

export default function GmailCallbackPage() {
  const callback = trpc.gmail.callback.useMutation();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) { setError("Gmail connection was not completed."); return; }
    callback.mutate({ code, state }, {
      onSuccess: () => window.location.assign("/"),
      onError: (cause) => setError(cause.message || "Gmail connection failed. Please try again."),
    });
  }, [callback]);

  return <main className="flex min-h-svh items-center justify-center p-6 text-center">{error ? <div><p>{error}</p><Link className="mt-4 inline-block underline" href="/">Return to workspace</Link></div> : "Completing Gmail connection..."}</main>;
}
