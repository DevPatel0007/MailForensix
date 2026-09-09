import { cn } from '@/lib/utils'
import { Container } from './primitives'
import { Reveal } from './reveal'

export function Report() {
  return (
    <section id="report" className="border-t border-hairline">
      <Container className="py-24 lg:py-32">
        {/* Split header — heading left, copy + link right */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <h2 className="text-display-lg text-balance">
              Investigate, verify,
              <br />
              and report
            </h2>
          </Reveal>
          <Reveal delay={100} className="flex flex-col gap-6 lg:max-w-md">
            <p className="text-xl leading-relaxed text-pretty text-muted-foreground">
              Every investigation exports as a structured report — verdict, confidence, indicators and the full evidence
              chain. Ready for SOC handoff, legal review or a customer notice.
            </p>
            <a
              href="#docs"
              className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/80 transition-colors duration-200 hover:text-foreground"
            >
              Learn more
              <ArrowIcon />
            </a>
          </Reveal>
        </div>

        {/* Layered mockup — evidence list overlapped by the report file, fading out */}
        <Reveal delay={200} className="relative mt-16 lg:mt-20">
          <div className="relative h-[440px] overflow-hidden sm:h-[480px] lg:h-[500px]">
            <EvidencePanel />
            <ReportPanel />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
              aria-hidden
            />
          </div>
        </Reveal>

        {/* Feature link row */}
        <Reveal delay={280} className="mt-10 lg:mt-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <p className="text-sm text-stone">Exports &amp; integrations</p>
            <div className="grid grid-cols-2 gap-8 sm:gap-10">
              <FeatureLinks items={['JSON report', 'PDF summary', 'STIX 2.1 bundle']} />
              <FeatureLinks items={['Splunk', 'Microsoft Sentinel', 'Jira and Slack']} divider />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function FeatureLinks({ items, divider }: { items: string[]; divider?: boolean }) {
  return (
    <ul className={cn('flex flex-col gap-2', divider && 'border-l border-hairline pl-8 sm:pl-10')}>
      {items.map((label) => (
        <li key={label}>
          <a
            href="#docs"
            className="inline-flex items-center gap-1.5 text-[15px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {label}
            <PlusIcon />
          </a>
        </li>
      ))}
    </ul>
  )
}

const GROUPS = [
  {
    title: 'Flagged',
    count: 3,
    tone: 'threat' as const,
    rows: [
      { id: 'IOC-2498', text: 'SPF hard fail from 185.142.xxx.xxx' },
      { id: 'IOC-2380', text: 'DMARC policy p=reject not honoured' },
      { id: 'IOC-2039', text: 'Sender domain registered 3 days ago' },
    ],
  },
  {
    title: 'Verified',
    count: 4,
    tone: 'mint' as const,
    rows: [
      { id: 'IOC-2076', text: 'Return-Path mismatch vs. From header' },
      { id: 'IOC-2108', text: 'Origin AS9009 · known bulletproof hosting' },
      { id: 'IOC-2143', text: 'Geolocation mismatch · 2,140 km' },
      { id: 'IOC-2187', text: 'Landing page clones vendor login form' },
    ],
  },
  {
    title: 'Pending',
    count: 4,
    tone: 'steel' as const,
    rows: [
      { id: 'IOC-2254', text: 'Cross-reference with THR-2291 campaign' },
      { id: 'IOC-2291', text: 'Passive DNS pivot on shared nameserver' },
      { id: 'IOC-2327', text: 'Attachment sandbox detonation' },
      { id: 'IOC-2358', text: 'Notify downstream recipients' },
    ],
  },
]

function EvidencePanel() {
  return (
    <div className="absolute top-6 left-0 w-[62%] overflow-hidden rounded-xl border border-hairline bg-surface/80 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] backdrop-blur-sm lg:w-[56%]">
      <div className="flex flex-col py-2">
        {GROUPS.map((g, gi) => (
          <div key={g.title} className={cn(gi > 0 && 'mt-1')}>
            <div className="flex items-center gap-2.5 bg-surface-code/50 px-4 py-2 text-[12px]">
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className="text-steel">
                <path d="M1 2.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
              <GroupDot tone={g.tone} />
              <span className="font-medium text-foreground">{g.title}</span>
              <span className="text-steel">{g.count}</span>
            </div>
            <ul>
              {g.rows.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-2 text-[12px]">
                  <Bars muted={g.tone === 'steel'} />
                  <span className="font-mono text-[11px] text-steel">{r.id}</span>
                  <GroupDot tone={g.tone} />
                  <span className={cn('truncate', g.tone === 'steel' ? 'text-stone' : 'text-foreground')}>{r.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupDot({ tone }: { tone: 'threat' | 'mint' | 'steel' }) {
  return (
    <span
      className={cn(
        'size-3 shrink-0 rounded-full border',
        tone === 'threat' && 'border-threat bg-threat/20',
        tone === 'mint' && 'border-mint bg-mint/20',
        tone === 'steel' && 'border-steel',
      )}
      aria-hidden
    />
  )
}

function Bars({ muted }: { muted?: boolean }) {
  return (
    <span className={cn('flex items-end gap-px', muted ? 'text-hairline' : 'text-steel')} aria-hidden>
      <span className="h-1.5 w-0.5 bg-current" />
      <span className="h-2.5 w-0.5 bg-current" />
      <span className="h-3.5 w-0.5 bg-current" />
    </span>
  )
}

type Tok = { t: string; c?: string }
const REPORT_LINES: { toks: Tok[]; hl?: boolean }[] = [
  { toks: [{ t: '{' }] },
  { toks: [{ t: '  "investigation_id": ', c: 'text-foreground' }, { t: '"MFX-48211"', c: 'text-mint-soft' }, { t: ',' }] },
  { toks: [{ t: '  "verdict": ', c: 'text-foreground' }, { t: '"credential_phishing"', c: 'text-mint-soft' }, { t: ',' }], hl: true },
  { toks: [{ t: '  "threat_level": ', c: 'text-foreground' }, { t: '"HIGH"', c: 'text-threat' }, { t: ',' }] },
  { toks: [{ t: '  "confidence": ', c: 'text-foreground' }, { t: '0.964', c: 'text-mint' }, { t: ',' }] },
  { toks: [{ t: '' }] },
  { toks: [{ t: '  "evidence": [', c: 'text-foreground' }] },
  { toks: [{ t: '    { "type": ', c: 'text-foreground' }, { t: '"auth"', c: 'text-mint-soft' }, { t: ', "finding": ' }, { t: '"SPF fail, DMARC reject"', c: 'text-mint-soft' }, { t: ' },' }], hl: true },
  { toks: [{ t: '    { "type": ', c: 'text-foreground' }, { t: '"domain"', c: 'text-mint-soft' }, { t: ', "finding": ' }, { t: '"registered 3 days ago"', c: 'text-mint-soft' }, { t: ' },' }] },
  { toks: [{ t: '    { "type": ', c: 'text-foreground' }, { t: '"infra"', c: 'text-mint-soft' }, { t: ', "finding": ' }, { t: '"AS9009, abuse score 87"', c: 'text-mint-soft' }, { t: ' },' }] },
  { toks: [{ t: '    { "type": ', c: 'text-foreground' }, { t: '"geo"', c: 'text-mint-soft' }, { t: ', "finding": ' }, { t: '"2,140 km mismatch"', c: 'text-mint-soft' }, { t: ' },' }] },
  { toks: [{ t: '    { "type": ', c: 'text-foreground' }, { t: '"correlation"', c: 'text-mint-soft' }, { t: ', "finding": ' }, { t: '"4 IOCs in THR-2291"', c: 'text-mint-soft' }, { t: ' }' }], hl: true },
  { toks: [{ t: '  ],', c: 'text-foreground' }] },
  { toks: [{ t: '' }] },
  { toks: [{ t: '  "campaign": ', c: 'text-foreground' }, { t: '"THR-2291"', c: 'text-mint-soft' }, { t: ',' }] },
  { toks: [{ t: '  "analyst_summary": ', c: 'text-foreground' }, { t: '"Vendor impersonation to harvest credentials."', c: 'text-mint-soft' }] },
  { toks: [{ t: '}' }] },
]

function ReportPanel() {
  return (
    <div className="absolute top-0 right-0 w-[70%] overflow-hidden rounded-xl border border-hairline bg-surface shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),0_0_120px_-40px_rgba(0,212,164,0.15)] lg:w-[64%]">
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-2.5">
        <div className="flex items-center gap-2.5 font-mono text-[11px] text-steel">
          <FileIcon />
          <span className="truncate">investigations/MFX-48211/report.json</span>
        </div>
        <span className="hidden items-center gap-1.5 font-mono text-[11px] text-steel sm:flex">
          MailForensix
          <span className="size-1.5 rounded-full bg-mint" aria-hidden />
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <CodeColumn lines={REPORT_LINES} />
        <div className="hidden border-l border-hairline md:block">
          <CodeColumn lines={REPORT_LINES} ghost />
        </div>
      </div>
    </div>
  )
}

function CodeColumn({ lines, ghost }: { lines: typeof REPORT_LINES; ghost?: boolean }) {
  return (
    <pre className={cn('overflow-hidden py-4 font-mono text-[12px] leading-[1.7]', ghost && 'opacity-40')}>
      <code className="block">
        {lines.map((l, i) => (
          <span
            key={i}
            className={cn('flex whitespace-pre', l.hl && 'border-l-2 border-mint bg-mint/[0.06]')}
          >
            <span className={cn('w-12 shrink-0 select-none pr-3 text-right text-steel', l.hl && 'text-mint')}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="truncate text-muted-foreground">
              {l.toks.map((tok, j) => (
                <span key={j} className={tok.c}>
                  {tok.t}
                </span>
              ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="text-steel">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 1.5h5.5L13 5v9.5H4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

export function CTA() {
  return (
    <section id="cta" className="border-t border-hairline">
      <Container className="py-24 lg:py-32">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[12px] tracking-[0.08em] text-steel uppercase">Ready when the next one lands</p>
            <h2 className="text-display-lg mt-4 text-balance">Turn email threats into intelligence.</h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground">
              Start with a single suspicious message. No agent to install, no mailbox access required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/sign-up"
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-mint-soft"
              >
                Start investigating
              </a>
              <a
                href="#docs"
                className="inline-flex items-center rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-steel"
              >
                Read the docs
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
