import { Container } from './primitives'
import { Reveal } from './reveal'
import { cn } from '~/lib/utils'

export function Report() {
  return (
    <section id="report" className="border-t border-hairline">
      <Container className="py-24 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          <div>
            <Reveal>
              <p className="font-mono text-[12px] tracking-[0.08em] text-steel uppercase">Comprehensive Reports</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-display-lg mt-5 text-balance">Defense-grade reports in seconds.</h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-muted-foreground">
                Export verified IOCs, header traces, and AI threat reasoning formatted directly for incident response logs, PDF executive summaries, or STIX 2.1 intelligence feeds.
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative min-h-[380px] overflow-hidden rounded-xl border border-hairline bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-threat" />
                <span className="font-mono text-sm font-semibold">Incident Report MFX-48211</span>
              </div>
              <span className="font-mono text-xs text-mint">STIX 2.1 Ready</span>
            </div>
            <div className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between border-b border-hairline-soft pb-2">
                <span className="text-steel">Threat Type:</span>
                <span className="text-threat font-bold">Credential Phishing</span>
              </div>
              <div className="flex justify-between border-b border-hairline-soft pb-2">
                <span className="text-steel">Origin IP:</span>
                <span className="text-foreground">185.142.236.19 (Moldova)</span>
              </div>
              <div className="flex justify-between border-b border-hairline-soft pb-2">
                <span className="text-steel">Domain Age:</span>
                <span className="text-threat">3 Days (Privacy WHOIS)</span>
              </div>
              <div className="flex justify-between border-b border-hairline-soft pb-2">
                <span className="text-steel">Authentications:</span>
                <span className="text-threat">SPF FAIL · DKIM NONE · DMARC REJECT</span>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

export function CTA({ onGoogleLogin, onOpenWorkspace }: { onGoogleLogin?: () => void; onOpenWorkspace?: () => void }) {
  return (
    <section id="cta" className="border-t border-hairline">
      <Container className="py-24 lg:py-32">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[12px] tracking-[0.08em] text-steel uppercase">Ready when the next threat lands</p>
            <h2 className="text-display-lg mt-4 text-balance">Turn email threats into intelligence.</h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground">
              Start investigating suspicious messages instantly with real-time AI forensic analysis.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenWorkspace ?? onGoogleLogin}
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-mint-soft"
              >
                Start investigating
              </button>
              <button
                type="button"
                onClick={onGoogleLogin}
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-steel"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
