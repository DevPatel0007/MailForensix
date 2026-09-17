import { cn } from '@/lib/utils'
import { Container, Status } from './primitives'
import { Reveal } from './reveal'
import { InvestigationMockup } from './investigation-mockup'

export function Evidence() {
  return (
    <section id="evidence" className="border-t border-hairline">
      <Container className="flex flex-col gap-10 py-24 lg:gap-14 lg:py-32">
        {/* Headline row */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="relative pl-6 lg:pl-8">
            <span className="absolute top-1 left-0 h-9 w-0.5 bg-mint" aria-hidden />
            <h2 className="text-h2 text-balance">
              One workspace for the
              <br />
              entire investigation.
              <br />
              <span className="text-muted-foreground">Evidence that holds up under review.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-mint-soft"
            >
              Start investigating
              <ChevronIcon />
            </a>
          </Reveal>
        </div>

        {/* Bento — uniform 16px gutter between every card, rows included */}
        <div className="flex flex-col gap-4">
          {/* Row 1 — 2 / 1 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <BentoCard className="lg:col-span-2" label="Header forensics" delay={0}>
              <HopChainVisual />
            </BentoCard>
            <BentoCard label="Geolocation mismatch" delay={100}>
              <GeoVisual />
            </BentoCard>
          </div>

          {/* Row 2 — 1 / 1 / 1 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BentoCard label="Authentication verdicts" delay={0}>
              <AuthVisual />
            </BentoCard>
            <BentoCard label="Infrastructure resolution" delay={100}>
              <InfraVisual />
            </BentoCard>
            <BentoCard label="Threat correlation" delay={200}>
              <CorrelationVisual />
            </BentoCard>
          </div>

          {/* Row 3 — full width */}
          <BentoCard label="Built on top of your existing mail stack" tall delay={0}>
            <StackVisual />
          </BentoCard>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function BentoCard({
  label,
  children,
  className,
  tall,
  delay,
}: {
  label: string
  children: React.ReactNode
  className?: string
  tall?: boolean
  delay?: number
}) {
  return (
    <Reveal delay={delay} className={cn('min-w-0', className)}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
        <div className={cn('relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden', tall && 'min-h-[320px] lg:min-h-[380px]')}>
          {children}
        </div>
        <p className="relative px-6 pt-2 pb-6 text-[15px] font-medium text-foreground">{label}</p>
      </div>
    </Reveal>
  )
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Thin mint strands used as card backgrounds. */
function Strands({
  className,
  count = 14,
  from = [0, 60],
  to = [400, 120],
  bend = 60,
  spread = 7,
}: {
  className?: string
  count?: number
  from?: [number, number]
  to?: [number, number]
  bend?: number
  spread?: number
}) {
  const id = `mf-strand-${from.join('-')}-${to.join('-')}`
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="none" className={cn('absolute inset-0 h-full w-full', className)} fill="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--mint-deep)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--mint)" />
          <stop offset="1" stopColor="var(--mint-soft)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="0.8">
        {Array.from({ length: count }, (_, i) => {
          const o = (i - count / 2) * spread
          const d = `M ${from[0]} ${from[1] + o} C ${(from[0] + to[0]) / 2} ${from[1] + o + bend}, ${(from[0] + to[0]) / 2} ${to[1] + o - bend}, ${to[0]} ${to[1] + o}`
          return <path key={i} d={d} opacity={0.35 + 0.6 * (1 - Math.abs(i / (count - 1) - 0.5) * 2)} />
        })}
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------ */

function HopChainVisual() {
  const hops = [
    { n: '01', host: 'mail-relay.hostix.md', ip: '185.142.xxx.xxx', flag: true },
    { n: '02', host: 'mx2.secure-payments.co', ip: '91.203.xxx.xxx', flag: false },
    { n: '03', host: 'inbound-smtp.eu-west-1.amazonaws.com', ip: '52.94.xxx.xxx', flag: false },
    { n: '04', host: 'mx.acme-corp.com', ip: '203.0.113.7', flag: false },
  ]
  return (
    <>
      <Strands from={[-20, 40]} to={[420, 200]} bend={90} count={16} className="opacity-70" />
      <div className="relative w-full max-w-md px-6">
        <ol className="flex flex-col gap-2">
          {hops.map((h, i) => (
            <li
              key={h.n}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3.5 py-2.5 backdrop-blur-sm',
                h.flag ? 'border-threat/40 bg-background/90' : 'border-hairline bg-background/80',
              )}
              style={{ marginLeft: `${i * 18}px` }}
            >
              <span className="font-mono text-[11px] text-steel">{h.n}</span>
              <span className={cn('size-1.5 shrink-0 rounded-full', h.flag ? 'bg-threat' : 'bg-mint')} aria-hidden />
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground">{h.host}</span>
              <span className="hidden font-mono text-[11px] text-steel sm:inline">{h.ip}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}

function GeoVisual() {
  return (
    <>
      <div className="hairline-grid absolute inset-0 opacity-50" aria-hidden />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 260" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <path d="M70 190 C 140 90, 240 60, 330 80" stroke="var(--mint)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="70" cy="190" r="4" fill="var(--surface)" stroke="var(--steel)" strokeWidth="1.5" />
        <circle cx="330" cy="80" r="4" fill="var(--surface)" stroke="var(--mint)" strokeWidth="1.5" />
        <circle cx="330" cy="80" r="14" stroke="var(--mint)" strokeOpacity="0.3" strokeWidth="1" className="mf-pulse" />
      </svg>
      <div className="absolute bottom-8 left-6 rounded-md border border-hairline bg-background/90 px-3 py-2 font-mono text-[11px] leading-relaxed">
        <span className="text-steel">CLAIMED</span>
        <br />
        <span className="text-muted-foreground">London, GB</span>
      </div>
      <div className="absolute top-8 right-6 rounded-md border border-mint/40 bg-background/90 px-3 py-2 text-right font-mono text-[11px] leading-relaxed">
        <span className="text-steel">RESOLVED</span>
        <br />
        <span className="text-mint">Chișinău, MD</span>
      </div>
    </>
  )
}

function AuthVisual() {
  const rows = [
    { k: 'SPF', v: 'FAIL', tone: 'threat' as const },
    { k: 'DKIM', v: 'NONE', tone: 'pending' as const },
    { k: 'DMARC', v: 'REJECT', tone: 'threat' as const },
  ]
  return (
    <div className="relative flex w-full flex-col gap-2 px-8">
      {rows.map((r, i) => (
        <div
          key={r.k}
          className={cn(
            'flex items-center justify-between rounded-lg border px-4 py-3',
            i === 0 ? 'border-mint/40 bg-background' : 'border-hairline bg-background/70',
          )}
        >
          <span className="font-mono text-[12px] text-foreground">{r.k}</span>
          <Status tone={r.tone}>{r.v}</Status>
        </div>
      ))}
    </div>
  )
}

function InfraVisual() {
  return (
    <>
      <Strands from={[-40, 200]} to={[440, 40]} bend={-70} count={12} className="opacity-50" />
      <div className="relative w-full px-8">
        <div className="rounded-lg border border-hairline bg-background/90 p-4 backdrop-blur-sm">
          <dl className="grid grid-cols-[76px_1fr] gap-y-2 font-mono text-[11px] leading-relaxed">
            <dt className="text-steel">DOMAIN</dt>
            <dd className="truncate text-foreground">secure-payments.co</dd>
            <dt className="text-steel">AGE</dt>
            <dd className="text-threat">3 days</dd>
            <dt className="text-steel">ASN</dt>
            <dd className="truncate text-muted-foreground">AS9009 · M247</dd>
            <dt className="text-steel">ABUSE</dt>
            <dd className="text-foreground">87 / 100</dd>
          </dl>
        </div>
      </div>
    </>
  )
}

function CorrelationVisual() {
  const nodes = [
    { label: 'THR-2291', x: 50, y: 50, primary: true },
    { label: 'MSG-1104', x: 22, y: 22 },
    { label: 'MSG-1187', x: 78, y: 24 },
    { label: 'MSG-1203', x: 20, y: 78 },
    { label: 'MSG-1218', x: 80, y: 76 },
  ]
  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden>
        {nodes.slice(1).map((n) => (
          <line key={n.label} x1="50" y1="50" x2={n.x} y2={n.y} stroke="var(--mint)" strokeOpacity="0.45" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {nodes.map((n) => (
        <span
          key={n.label}
          className={cn(
            'absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-2.5 py-1 font-mono text-[11px] whitespace-nowrap',
            n.primary ? 'border-mint bg-background text-mint' : 'border-hairline bg-background/90 text-muted-foreground',
          )}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {n.label}
        </span>
      ))}
    </div>
  )
}

function StackVisual() {
  return (
    <>
      <Strands from={[-40, 60]} to={[220, 200]} bend={60} count={18} spread={6} className="w-1/2! opacity-80 lg:opacity-100" />
      <Strands from={[180, 40]} to={[440, 220]} bend={-60} count={18} spread={6} className="left-1/2! w-1/2! opacity-80 lg:opacity-100" />
      <div className="relative w-full max-w-3xl px-6 pt-8 lg:pt-10">
        <div className="overflow-hidden rounded-t-xl border border-b-0 border-hairline bg-surface shadow-[0_-20px_80px_-40px_var(--mint-deep)]">
          <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
            <span className="size-2 rounded-full bg-hairline" aria-hidden />
            <span className="size-2 rounded-full bg-hairline" aria-hidden />
            <span className="size-2 rounded-full bg-hairline" aria-hidden />
            <span className="ml-2 font-mono text-[11px] tracking-[0.08em] text-steel uppercase">Investigation · MFX-48211</span>
          </div>
          <div className="max-h-[220px] overflow-hidden lg:max-h-[280px]">
            <InvestigationMockup frameless />
          </div>
        </div>
      </div>
    </>
  )
}
