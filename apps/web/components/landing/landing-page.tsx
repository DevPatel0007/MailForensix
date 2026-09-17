'use client'

import { Nav } from './nav'
import { Hero } from './hero'
import { Pipeline } from './pipeline'
import { Evidence } from './evidence'
import { Report, CTA } from './report'
import { Footer } from './footer'
import { trpc } from '~/trpc/client'

export function LandingPage({ onOpenWorkspace }: { onOpenWorkspace?: () => void }) {
  const googleAuth = trpc.auth.googleAuthorizationUrl.useQuery({}, { enabled: false })

  const handleGoogleLogin = async () => {
    const res = await googleAuth.refetch()
    if (res.data?.url) {
      window.location.assign(res.data.url)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-mint/30">
      <Nav onGoogleLogin={handleGoogleLogin} />
      <main>
        <Hero onOpenWorkspace={onOpenWorkspace ?? handleGoogleLogin} />
        <Pipeline />
        <Evidence onOpenWorkspace={onOpenWorkspace ?? handleGoogleLogin} />
        <Report />
        <CTA onGoogleLogin={handleGoogleLogin} onOpenWorkspace={onOpenWorkspace ?? handleGoogleLogin} />
      </main>
      <Footer />
    </div>
  )
}
