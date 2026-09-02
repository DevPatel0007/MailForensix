"use client"

import { useEffect, useRef, useState } from "react"
import { trpc } from "~/trpc/client"

export default function GoogleCallbackPage() {
  const callback = trpc.auth.googleCallback.useMutation()
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const state = params.get("state")
    if (!code || !state) {
      setError("Google sign-in was not completed.")
      return
    }

    callback.mutate(
      { code, state },
      {
        onSuccess: () => window.location.assign("/"),
        onError: () => setError("Google sign-in failed. Please try again."),
      },
    )
  }, [callback])

  if (error) {
    return <main className="flex min-h-svh items-center justify-center p-6">{error}</main>
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      Completing Google sign-in...
    </main>
  )
}
