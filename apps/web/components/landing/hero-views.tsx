'use client'

import type { ReactNode } from 'react'
import { ArrowUp, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Status } from './primitives'

/* ------------------------------------------------------------------ */
/* Shared micro-primitives for the in-app views                        */
/* ------------------------------------------------------------------ */

function Pane({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-w-0 p-5', className)}>{children}</div>
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-micro text-steel">{children}</p>
}

function KV({ rows, className }: { rows: { k: string; v: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-[96px_1fr] gap-y-2 font-mono text-[12px] leading-relaxed', className)}>
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="text-steel">{r.k}</dt>
          <dd className="min-w-0 truncate text-foreground">{r.v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Pill({ tone = 'neutral', children }: { tone?: 'threat' | 'mint' | 'neutral'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-xs border px-1.5 py-0.5 font-mono text-[11px]',
        tone === 'threat' && 'border-threat/40 text-threat',
        tone === 'mint' && 'border-mint/40 text-mint',
        tone === 'neutral' && 'border-hairline text-steel',
      )}
    >
      {children}
    </span>
  )
}

function Table({
  cols,
  rows,
  widths,
}: {
  cols: string[]
  rows: ReactNode[][]
  widths: string
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-hairline">
      <div
        className="grid items-center gap-3 border-b border-hairline bg-surface-code/50 px-3 py-2 text-micro text-steel"
        style={{ gridTemplateColumns: widths }}
      >
        {cols.map((c) => (
          <span key={c} className="truncate">
            {c}
          </span>
        ))}
      </div>
      <ul>
        {rows.map((r, i) => (
          <li
            key={i}
            className="grid items-center gap-3 border-b border-hairline-soft px-3 py-2 text-[12px] last:border-b-0"
            style={{ gridTemplateColumns: widths }}
          >
            {r.map((cell, j) => (
              <span key={j} className="min-w-0 truncate">
                {cell}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Meter({ value, tone = 'mint' }: { value: number; tone?: 'mint' | 'threat' }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-16 overflow-hidden rounded-full bg-hairline">
        <span
          className={cn('block h-full rounded-full', tone === 'mint' ? 'bg-mint' : 'bg-threat')}
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">{value}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Views                                                               */
/* ------------------------------------------------------------------ */

export function AskAnalystView() {
  return (
    <Pane className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="self-end rounded-lg rounded-tr-xs border border-hairline bg-surface px-3.5 py-2.5 text-[12px] text-foreground">
          Why was MFX-48211 flagged as credential phishing?
        </div>
        <div className="flex gap-3">
          <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-mint/10 text-mint">
            <Sparkles className="size-3" />
          </span>
          <div className="min-w-0 flex-1 text-[12px] leading-relaxed text-muted-foreground">
            <p>
              The message fails all three sender-identity checks (SPF <span className="text-threat">FAIL</span>, DKIM{' '}
              <span className="text-steel">NONE</span>, DMARC <span className="text-threat">REJECT</span>) while
              impersonating a known vendor. The sending domain{' '}
              <span className="font-mono text-foreground">secure-payments.co</span> was registered 3 days ago, and the
              origin IP belongs to AS9009 — infrastructure shared with 17 prior messages in campaign{' '}
              <span className="font-mono text-mint">THR-2291</span>.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['header-analysis §3', 'domain-intel §1', 'ip-analysis §2', 'correlation §4'].map((c) => (
                <span key={c} className="rounded-xs border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-steel">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-md border border-hairline bg-surface px-3 py-2">
        <span className="flex-1 text-[12px] text-steel">Ask a follow-up about this investigation…</span>
        <span className="flex size-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
          <ArrowUp className="size-3" />
        </span>
      </div>
    </Pane>
  )
}

const HOPS = [
  { n: '01', host: 'mail-relay.hostix.md', ip: '185.142.xxx.xxx', delay: '+0.0s', flag: true },
  { n: '02', host: 'mx2.secure-payments.co', ip: '91.204.xxx.xxx', delay: '+0.8s', flag: true },
  { n: '03', host: 'inbound-smtp.eu-west-1.amazonaws.com', ip: '52.94.xxx.xxx', delay: '+1.2s', flag: false },
  { n: '04', host: 'mx.acme-corp.com', ip: '203.0.113.xxx', delay: '+1.4s', flag: false },
]

export function HeaderAnalysisView() {
  return (
    <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <Pane className="border-b border-hairline md:border-r md:border-b-0">
        <Label>Received chain · 4 hops</Label>
        <ol className="mt-4 flex flex-col">
          {HOPS.map((h, i) => (
            <li key={h.n} className="flex gap-3 py-2">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full border font-mono text-[10px]',
                    h.flag ? 'border-threat/50 text-threat' : 'border-hairline text-steel',
                  )}
                >
                  {h.n}
                </span>
                {i < HOPS.length - 1 && <span className="mt-1 h-full w-px bg-hairline" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[12px] text-foreground">{h.host}</p>
                <p className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  {h.ip}
                  <span className="text-steel">{h.delay}</span>
                  {h.flag && <Pill tone="threat">untrusted</Pill>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Pane>
      <Pane>
        <Label>Authentication results</Label>
        <ul className="mt-4 flex flex-col">
          {[
            { k: 'SPF', v: 'fail', d: 'ip 185.142.xxx.xxx not permitted', tone: 'threat' as const },
            { k: 'DKIM', v: 'none', d: 'no signature present', tone: 'pending' as const },
            { k: 'DMARC', v: 'fail', d: 'policy p=reject · aligned=no', tone: 'threat' as const },
            { k: 'ARC', v: 'none', d: 'chain not sealed', tone: 'pending' as const },
          ].map((r) => (
            <li
              key={r.k}
              className="flex items-start justify-between gap-3 border-b border-hairline-soft py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-mono text-[12px] text-foreground">{r.k}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{r.d}</p>
              </div>
              <Status tone={r.tone}>{r.v}</Status>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-hairline pt-4">
          <Label>Header anomalies</Label>
          <ul className="mt-3 flex flex-col gap-1.5 text-[12px] text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-threat">•</span> Return-Path domain differs from From
            </li>
            <li className="flex gap-2">
              <span className="text-threat">•</span> Message-ID host does not match any hop
            </li>
            <li className="flex gap-2">
              <span className="text-steel">•</span> X-Mailer: PHPMailer 6.8
            </li>
          </ul>
        </div>
      </Pane>
    </div>
  )
}

export function DomainIntelView() {
  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Pane className="border-b border-hairline md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3">
          <Label>WHOIS · secure-payments.co</Label>
          <Pill tone="threat">3 days old</Pill>
        </div>
        <KV
          className="mt-4"
          rows={[
            { k: 'Registered', v: '2026-08-31 22:14 UTC' },
            { k: 'Registrar', v: 'NameSilo, LLC' },
            { k: 'Registrant', v: <span className="text-steel">Redacted · privacy proxy</span> },
            { k: 'Nameservers', v: 'ns1.dns-parking.com' },
            { k: 'Expires', v: '2027-08-31' },
            { k: 'TLS cert', v: "Let's Encrypt · issued 2 days ago" },
          ]}
        />
        <div className="mt-5 border-t border-hairline pt-4">
          <Label>DNS records</Label>
          <ul className="mt-3 flex flex-col gap-1.5 font-mono text-[11px]">
            <li className="flex gap-3">
              <span className="w-8 text-steel">A</span>
              <span className="text-foreground">91.204.xxx.xxx</span>
            </li>
            <li className="flex gap-3">
              <span className="w-8 text-steel">MX</span>
              <span className="text-foreground">mx2.secure-payments.co</span>
            </li>
            <li className="flex gap-3">
              <span className="w-8 text-steel">TXT</span>
              <span className="truncate text-threat">v=spf1 +all</span>
            </li>
          </ul>
        </div>
      </Pane>
      <Pane>
        <Label>Lookalike analysis</Label>
        <ul className="mt-4 flex flex-col">
          {[
            { d: 'securepayments.com', s: 94, note: 'Legitimate vendor' },
            { d: 'secure-payment.co', s: 88, note: 'Parked' },
            { d: 'secure-payments.net', s: 86, note: 'Flagged · THR-2291' },
          ].map((r) => (
            <li key={r.d} className="flex items-center justify-between gap-3 border-b border-hairline-soft py-2.5 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate font-mono text-[12px] text-foreground">{r.d}</p>
                <p className="text-[11px] text-muted-foreground">{r.note}</p>
              </div>
              <Meter value={r.s} />
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-hairline pt-4">
          <Label>Reputation</Label>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="threat">Newly registered</Pill>
            <Pill tone="threat">Typosquat</Pill>
            <Pill tone="threat">Open SPF</Pill>
            <Pill>No web history</Pill>
          </div>
        </div>
      </Pane>
    </div>
  )
}

export function IpAnalysisView() {
  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Pane className="border-b border-hairline md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3">
          <Label>Origin · 185.142.xxx.xxx</Label>
          <Status tone="threat">Abuse 87</Status>
        </div>
        <KV
          className="mt-4"
          rows={[
            { k: 'ASN', v: 'AS9009 · M247 Europe' },
            { k: 'Reverse DNS', v: 'mail-relay.hostix.md' },
            { k: 'Country', v: 'Moldova (MD)' },
            { k: 'Type', v: <span className="text-threat">Bulletproof hosting</span> },
            { k: 'First seen', v: '14 days ago' },
            { k: 'Messages', v: '17 in workspace · 2,380 global' },
          ]}
        />
        <div className="mt-5 border-t border-hairline pt-4">
          <Label>Open services</Label>
          <div className="mt-3 flex flex-wrap gap-1.5 font-mono">
            {['25/smtp', '465/smtps', '587/submission', '80/http', '443/https'].map((p) => (
              <Pill key={p}>{p}</Pill>
            ))}
          </div>
        </div>
      </Pane>
      <Pane>
        <Label>Threat feeds</Label>
        <ul className="mt-4 flex flex-col">
          {[
            { f: 'Spamhaus SBL', v: 'listed', tone: 'threat' as const },
            { f: 'AbuseIPDB', v: '87 / 100', tone: 'threat' as const },
            { f: 'Talos', v: 'poor', tone: 'threat' as const },
            { f: 'GreyNoise', v: 'not seen', tone: 'pending' as const },
            { f: 'Internal blocklist', v: 'clear', tone: 'complete' as const },
          ].map((r) => (
            <li key={r.f} className="flex items-center justify-between gap-3 border-b border-hairline-soft py-2.5 last:border-b-0">
              <span className="text-[12px] text-foreground">{r.f}</span>
              <Status tone={r.tone}>{r.v}</Status>
            </li>
          ))}
        </ul>
      </Pane>
    </div>
  )
}

export function GeolocationView() {
  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Pane className="border-b border-hairline md:border-r md:border-b-0">
        <Label>Claimed origin</Label>
        <KV
          className="mt-4"
          rows={[
            { k: 'From domain', v: 'secure-payments.co' },
            { k: 'Claimed HQ', v: 'London, United Kingdom' },
            { k: 'Timezone', v: 'Europe/London (+01:00)' },
            { k: 'Date header', v: '09:41:58 +0000' },
          ]}
        />
        <div className="mt-5 border-t border-hairline pt-4">
          <Label>Actual origin</Label>
          <KV
            className="mt-4"
            rows={[
              { k: 'Resolved IP', v: '185.142.xxx.xxx' },
              { k: 'Location', v: <span className="text-threat">Chișinău, Moldova</span> },
              { k: 'Coordinates', v: '47.0105° N, 28.8638° E' },
              { k: 'Accuracy', v: 'City · 25 km radius' },
            ]}
          />
        </div>
      </Pane>
      <Pane className="flex flex-col">
        <Label>Mismatch</Label>
        <div className="relative mt-4 flex-1 overflow-hidden rounded-sm border border-hairline bg-surface-code/40 p-4">
          <div className="hairline-grid absolute inset-0 opacity-60" aria-hidden />
          <div className="relative flex h-full min-h-[140px] flex-col justify-between">
            <div className="flex items-center gap-2 self-start">
              <span className="size-2 rounded-full bg-steel" />
              <span className="font-mono text-[11px] text-muted-foreground">London · claimed</span>
            </div>
            <div className="flex items-center gap-3 self-center">
              <span className="h-px w-16 bg-gradient-to-r from-steel to-threat" />
              <span className="font-mono text-[12px] text-threat">2,140 km</span>
              <span className="h-px w-16 bg-gradient-to-r from-threat to-threat" />
            </div>
            <div className="flex items-center gap-2 self-end">
              <span className="font-mono text-[11px] text-threat">Chișinău · actual</span>
              <span className="size-2 rounded-full bg-threat shadow-[0_0_12px_var(--color-threat)]" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Pill tone="threat">Country mismatch</Pill>
          <Pill tone="threat">TZ offset −2h</Pill>
          <Pill>No VPN signature</Pill>
        </div>
      </Pane>
    </div>
  )
}

export function CorrelationView() {
  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Pane className="border-b border-hairline md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3">
          <Label>Campaign match</Label>
          <Status tone="threat">High confidence</Status>
        </div>
        <p className="mt-3 font-mono text-[14px] text-mint">THR-2291</p>
        <p className="mt-1 text-[12px] text-muted-foreground">Vendor invoice impersonation · active 14 days</p>
        <KV
          className="mt-4"
          rows={[
            { k: 'Messages', v: '17 in workspace' },
            { k: 'Targets', v: 'finance@, ap@, billing@' },
            { k: 'Shared IOCs', v: '4 of 7' },
            { k: 'Last seen', v: '38 minutes ago' },
          ]}
        />
      </Pane>
      <Pane>
        <Label>Matched indicators</Label>
        <ul className="mt-4 flex flex-col">
          {[
            { t: 'ip', v: '185.142.xxx.xxx', hits: 17 },
            { t: 'asn', v: 'AS9009', hits: 42 },
            { t: 'ns', v: 'ns1.dns-parking.com', hits: 9 },
            { t: 'url', v: 'secure-payments.co/verify', hits: 6 },
          ].map((r) => (
            <li key={r.v} className="flex items-center justify-between gap-3 border-b border-hairline-soft py-2.5 last:border-b-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <Pill>{r.t}</Pill>
                <span className="truncate font-mono text-[12px] text-foreground">{r.v}</span>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{r.hits} hits</span>
            </li>
          ))}
        </ul>
      </Pane>
    </div>
  )
}

export function CampaignsView() {
  return (
    <Pane>
      <div className="flex items-center justify-between gap-3">
        <Label>Active campaigns · 6</Label>
        <span className="font-mono text-[11px] text-steel">Sorted by last activity</span>
      </div>
      <div className="mt-4">
        <Table
          cols={['Campaign', 'Tactic', 'Messages', 'Severity', 'Last seen']}
          widths="92px minmax(0,1fr) 72px 72px 80px"
          rows={[
            [<span key="c" className="font-mono text-mint">THR-2291</span>, 'Vendor invoice impersonation', '17', <Status key="s" tone="threat">High</Status>, '38m ago'],
            [<span key="c" className="font-mono text-foreground">THR-2284</span>, 'Payroll redirect', '5', <Status key="s" tone="threat">High</Status>, '2h ago'],
            [<span key="c" className="font-mono text-foreground">THR-2279</span>, 'MFA fatigue lure', '31', <Status key="s" tone="neutral">Medium</Status>, '6h ago'],
            [<span key="c" className="font-mono text-foreground">THR-2263</span>, 'DocuSign clone', '12', <Status key="s" tone="neutral">Medium</Status>, '1d ago'],
            [<span key="c" className="font-mono text-foreground">THR-2250</span>, 'Shipping notice spam', '204', <Status key="s" tone="pending">Low</Status>, '3d ago'],
            [<span key="c" className="font-mono text-foreground">THR-2241</span>, 'Executive gift card', '3', <Status key="s" tone="pending">Low</Status>, '5d ago'],
          ]}
        />
      </div>
    </Pane>
  )
}

export function IndicatorsView() {
  return (
    <Pane>
      <div className="flex items-center justify-between gap-3">
        <Label>Indicators of compromise · 1,284</Label>
        <div className="flex gap-1.5">
          <Pill tone="mint">All</Pill>
          <Pill>ip</Pill>
          <Pill>domain</Pill>
          <Pill>url</Pill>
          <Pill>hash</Pill>
        </div>
      </div>
      <div className="mt-4">
        <Table
          cols={['Type', 'Value', 'Confidence', 'Campaign', 'Added']}
          widths="56px minmax(0,1fr) 96px 80px 64px"
          rows={[
            [<Pill key="t">ip</Pill>, <span key="v" className="font-mono text-foreground">185.142.xxx.xxx</span>, <Meter key="m" value={96} tone="threat" />, <span key="c" className="font-mono text-mint">THR-2291</span>, '2h'],
            [<Pill key="t">domain</Pill>, <span key="v" className="font-mono text-foreground">secure-payments.co</span>, <Meter key="m" value={94} tone="threat" />, <span key="c" className="font-mono text-mint">THR-2291</span>, '2h'],
            [<Pill key="t">url</Pill>, <span key="v" className="font-mono text-foreground">secure-payments.co/verify</span>, <Meter key="m" value={91} tone="threat" />, <span key="c" className="font-mono text-mint">THR-2291</span>, '2h'],
            [<Pill key="t">hash</Pill>, <span key="v" className="font-mono text-foreground">e3b0c442…b855</span>, <Meter key="m" value={78} />, <span key="c" className="font-mono text-foreground">THR-2263</span>, '1d'],
            [<Pill key="t">ip</Pill>, <span key="v" className="font-mono text-foreground">91.204.xxx.xxx</span>, <Meter key="m" value={72} />, <span key="c" className="font-mono text-foreground">THR-2284</span>, '2d'],
            [<Pill key="t">domain</Pill>, <span key="v" className="font-mono text-foreground">hr-payroll-update.net</span>, <Meter key="m" value={64} />, <span key="c" className="font-mono text-foreground">THR-2284</span>, '2d'],
          ]}
        />
      </div>
    </Pane>
  )
}

export function ConnectorsView() {
  const items = [
    { n: 'Microsoft 365', d: 'Mailbox journaling · 3 tenants', s: 'Connected', on: true },
    { n: 'Google Workspace', d: 'Gmail API · 1 domain', s: 'Connected', on: true },
    { n: 'Splunk', d: 'HEC · verdicts & IOCs', s: 'Connected', on: true },
    { n: 'Microsoft Sentinel', d: 'Log Analytics workspace', s: 'Syncing', on: true },
    { n: 'Jira', d: 'Auto-create on HIGH verdicts', s: 'Connected', on: true },
    { n: 'Slack', d: '#soc-alerts', s: 'Not connected', on: false },
  ]
  return (
    <Pane>
      <Label>Connectors · 5 of 6 active</Label>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((c) => (
          <li key={c.n} className="flex items-center justify-between gap-3 rounded-sm border border-hairline bg-surface px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-foreground">{c.n}</p>
              <p className="truncate text-[11px] text-muted-foreground">{c.d}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase">
              <span className={cn('size-1.5 rounded-full', c.on ? 'bg-mint' : 'bg-steel')} />
              <span className={c.on ? 'text-mint' : 'text-steel'}>{c.s}</span>
            </span>
          </li>
        ))}
      </ul>
    </Pane>
  )
}

export function WorkspaceView() {
  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Pane className="border-b border-hairline md:border-r md:border-b-0">
        <Label>Workspace</Label>
        <KV
          className="mt-4"
          rows={[
            { k: 'Name', v: 'Acme Corp SOC' },
            { k: 'Plan', v: 'Team · 12 seats' },
            { k: 'Region', v: 'eu-west-1' },
            { k: 'Retention', v: '365 days · hashed & immutable' },
            { k: 'SSO', v: <span className="text-mint">Okta · enforced</span> },
          ]}
        />
        <div className="mt-5 border-t border-hairline pt-4">
          <Label>Auto-triage rules</Label>
          <ul className="mt-3 flex flex-col gap-2 text-[12px] text-muted-foreground">
            {['Quarantine on DMARC reject + new domain', 'Create Jira issue for HIGH verdicts', 'Notify reporter on verdict'].map((r) => (
              <li key={r} className="flex items-center gap-2">
                <Check className="size-3 text-mint" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </Pane>
      <Pane>
        <Label>Members</Label>
        <ul className="mt-4 flex flex-col">
          {[
            { n: 'Dana Whitfield', e: 'dana@acme-corp.com', r: 'Owner' },
            { n: 'Marcus Okafor', e: 'marcus@acme-corp.com', r: 'Analyst' },
            { n: 'Priya Natarajan', e: 'priya@acme-corp.com', r: 'Analyst' },
            { n: 'Jonas Lindqvist', e: 'jonas@acme-corp.com', r: 'Viewer' },
          ].map((m) => (
            <li key={m.e} className="flex items-center justify-between gap-3 border-b border-hairline-soft py-2.5 last:border-b-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[10px] text-muted-foreground">
                  {m.n.split(' ').map((p) => p[0]).join('')}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-foreground">{m.n}</p>
                  <p className="truncate font-mono text-[11px] text-steel">{m.e}</p>
                </div>
              </div>
              <Pill tone={m.r === 'Owner' ? 'mint' : 'neutral'}>{m.r}</Pill>
            </li>
          ))}
        </ul>
      </Pane>
    </div>
  )
}

/* Investigation sub-tabs ------------------------------------------- */

export function EvidenceTabView() {
  return (
    <Pane>
      <Label>Evidence chain · 7 items</Label>
      <ul className="mt-4 flex flex-col">
        {[
          { t: 'auth', f: 'SPF fail, DMARC reject', w: 0.31, tone: 'threat' as const },
          { t: 'domain', f: 'Registered 3 days ago, privacy WHOIS', w: 0.22, tone: 'threat' as const },
          { t: 'infra', f: 'AS9009, abuse score 87', w: 0.18, tone: 'threat' as const },
          { t: 'correlation', f: '4 IOCs shared with THR-2291', w: 0.17, tone: 'threat' as const },
          { t: 'geo', f: '2,140 km origin mismatch', w: 0.12, tone: 'neutral' as const },
          { t: 'content', f: 'Urgency language, credential lure', w: 0.08, tone: 'neutral' as const },
          { t: 'attachment', f: 'None', w: 0, tone: 'pending' as const },
        ].map((e) => (
          <li key={e.t} className="flex items-center justify-between gap-3 border-b border-hairline-soft py-2.5 last:border-b-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <Pill>{e.t}</Pill>
              <span className="truncate text-[12px] text-foreground">{e.f}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground">w={e.w.toFixed(2)}</span>
              <Status tone={e.tone}>{e.tone === 'threat' ? 'strong' : e.tone === 'neutral' ? 'weak' : 'n/a'}</Status>
            </div>
          </li>
        ))}
      </ul>
    </Pane>
  )
}

export function ReportTabView() {
  return (
    <Pane>
      <div className="flex items-center justify-between gap-3">
        <Label>report.json · 2.1 KB</Label>
        <div className="flex gap-1.5">
          <Pill tone="mint">JSON</Pill>
          <Pill>PDF</Pill>
          <Pill>STIX 2.1</Pill>
        </div>
      </div>
      <pre className="mt-4 overflow-hidden rounded-sm border border-hairline bg-surface-code/40 p-4 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
        <code>
          {'{\n  '}
          <span className="text-foreground">&quot;investigation_id&quot;</span>: <span className="text-mint-soft">&quot;MFX-48211&quot;</span>
          {',\n  '}
          <span className="text-foreground">&quot;verdict&quot;</span>: <span className="text-mint-soft">&quot;credential_phishing&quot;</span>
          {',\n  '}
          <span className="text-foreground">&quot;threat_level&quot;</span>: <span className="text-threat">&quot;HIGH&quot;</span>
          {',\n  '}
          <span className="text-foreground">&quot;confidence&quot;</span>: <span className="text-mint">0.964</span>
          {',\n  '}
          <span className="text-foreground">&quot;campaign&quot;</span>: <span className="text-mint-soft">&quot;THR-2291&quot;</span>
          {',\n  '}
          <span className="text-foreground">&quot;evidence&quot;</span>: [ <span className="text-steel">7 items</span> ],
          {'\n  '}
          <span className="text-foreground">&quot;analyst_summary&quot;</span>:{' '}
          <span className="text-mint-soft">&quot;Vendor impersonation to harvest credentials.&quot;</span>
          {'\n}'}
        </code>
      </pre>
    </Pane>
  )
}
