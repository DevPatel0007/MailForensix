'use client'

import type { ReactNode } from 'react'
import { ArrowUp, Check, Sparkles } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Status } from './primitives'

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

export function AskAnalystView() {
  return (
    <Pane className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-micro text-mint">
        <Sparkles className="size-3.5" />
        Analyst reasoning · Case MFX-48211
      </div>
      <div className="rounded-lg border border-hairline bg-surface-code/40 p-4 font-mono text-[12px] leading-relaxed text-foreground">
        <p className="text-muted-foreground">
          &quot;Why was this message flagged despite passing MX resolution?&quot;
        </p>
        <p className="mt-3 text-foreground">
          The originating IP <span className="text-threat">185.142.xxx.xxx</span> resolved to AS9009 (known bulletproof
          hosting). The domain <span className="text-mint">secure-payments.co</span> was registered 3 days prior with
          hidden WHOIS and impersonates the legitimate vendor <span className="text-foreground">securepayments.com</span>.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-sm border border-hairline bg-surface px-3 py-2 text-[12px]">
        <span className="text-steel">Ask follow-up (e.g. &quot;Draft Splunk query for this ASN&quot;)</span>
        <span className="flex size-6 items-center justify-center rounded-xs bg-mint text-background">
          <ArrowUp className="size-3.5" />
        </span>
      </div>
    </Pane>
  )
}

export function HeaderAnalysisView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Received chain (4 hops)</Label>
      <Table
        cols={['#', 'Host / IP', 'Protocol', 'Delay', 'Status']}
        widths="24px 1.8fr 1fr 60px 80px"
        rows={[
          ['01', 'mail-relay.hostix.md (185.142.xxx.xxx)', 'ESMTPA', '0s', <Pill key="1" tone="threat">Suspicious</Pill>],
          ['02', 'mx2.secure-payments.co (91.203.xxx.xxx)', 'ESMTP', '2s', <Pill key="2">Pass</Pill>],
          ['03', 'inbound-smtp.eu-west-1.amazonaws.com', 'TLSv1.3', '1s', <Pill key="3">Pass</Pill>],
          ['04', 'mx.acme-corp.com (203.0.113.7)', 'Internal', '0s', <Pill key="4">Verified</Pill>],
        ]}
      />
    </Pane>
  )
}

export function DomainIntelView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>WHOIS & DNS posture</Label>
      <KV
        rows={[
          { k: 'Domain', v: 'secure-payments.co' },
          { k: 'Registered', v: <span className="text-threat">01 Sep 2026 (3 days ago)</span> },
          { k: 'Registrar', v: 'NameSilo LLC · WHOIS Privacy' },
          { k: 'Nameservers', v: 'ns1.hostix-dns.net, ns2.hostix-dns.net' },
          { k: 'Lookalike score', v: <Meter value={91} tone="threat" /> },
        ]}
      />
    </Pane>
  )
}

export function IpAnalysisView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Origin IP intelligence</Label>
      <KV
        rows={[
          { k: 'IP address', v: '185.142.xxx.xxx' },
          { k: 'ASN', v: 'AS9009 (M247 Europe SRL)' },
          { k: 'Category', v: 'Bulletproof / High-risk hosting' },
          { k: 'Abuse score', v: <Meter value={87} tone="threat" /> },
          { k: 'Blacklists', v: 'Listed in Spamhaus DBL, AbuseIPDB' },
        ]}
      />
    </Pane>
  )
}

export function GeolocationView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Location verification</Label>
      <KV
        rows={[
          { k: 'Claimed origin', v: 'London, United Kingdom (From header)' },
          { k: 'Resolved IP', v: <span className="text-mint">Chișinău, Moldova (47.01°N, 28.86°E)</span> },
          { k: 'Distance delta', v: <span className="text-threat">2,140 km mismatch</span> },
          { k: 'Corporate footprint', v: 'No regional offices in MD' },
        ]}
      />
    </Pane>
  )
}

export function CorrelationView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Campaign THR-2291 linkage</Label>
      <Table
        cols={['Indicator', 'Type', 'Confidence', 'Matches']}
        widths="1.5fr 1fr 1fr 80px"
        rows={[
          ['secure-payments.co', 'Domain', <Meter key="m1" value={98} tone="threat" />, '17 msgs'],
          ['185.142.xxx.xxx', 'IPv4', <Meter key="m2" value={94} tone="threat" />, '42 msgs'],
          ['invoice_sept_2026.pdf.html', 'Attachment', <Meter key="m3" value={89} tone="threat" />, '8 msgs'],
          ['ns1.hostix-dns.net', 'Nameserver', <Meter key="m4" value={76} tone="mint" />, '104 msgs'],
        ]}
      />
    </Pane>
  )
}

export function CampaignsView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Active threat campaigns</Label>
      <Table
        cols={['Campaign ID', 'Target', 'Severity', 'Volume', 'Status']}
        widths="1fr 1.2fr 90px 80px 90px"
        rows={[
          ['THR-2291', 'Finance / AP', <Pill tone="threat">High</Pill>, '128 msgs', <Status key="s1" tone="running">Active</Status>],
          ['THR-2284', 'HR / Payroll', <Pill tone="threat">High</Pill>, '44 msgs', <Status key="s2" tone="complete">Contained</Status>],
          ['THR-2260', 'Exec Assistants', <Pill tone="neutral">Medium</Pill>, '19 msgs', <Status key="s3" tone="complete">Closed</Status>],
        ]}
      />
    </Pane>
  )
}

export function IndicatorsView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Global workspace IOC repository</Label>
      <Table
        cols={['IOC Value', 'Type', 'First seen', 'SIEM Sync']}
        widths="2fr 1fr 1fr 100px"
        rows={[
          ['https://secure-payments.co/login', 'URL', '3 days ago', <span key="sync1" className="flex items-center gap-1 text-mint"><Check className="size-3" /> Splunk</span>],
          ['185.142.236.19', 'IPv4', '5 days ago', <span key="sync2" className="flex items-center gap-1 text-mint"><Check className="size-3" /> Sentinel</span>],
          ['a9f82c11...4b', 'SHA256', '1 week ago', <span key="sync3" className="flex items-center gap-1 text-mint"><Check className="size-3" /> CrowdStrike</span>],
        ]}
      />
    </Pane>
  )
}

export function ConnectorsView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Integration connectors</Label>
      <Table
        cols={['Integration', 'Direction', 'Status', 'Rate']}
        widths="1.5fr 1.2fr 100px 90px"
        rows={[
          ['Google Workspace / Gmail', 'Ingestion', <Status key="c1" tone="complete">Connected</Status>, '120 msg/m'],
          ['Microsoft 365 Defender', 'Ingestion & Action', <Status key="c2" tone="complete">Connected</Status>, '340 msg/m'],
          ['Splunk HTTP Event Collector', 'Export (STIX2.1)', <Status key="c3" tone="complete">Active</Status>, 'Realtime'],
          ['Jira Service Management', 'Ticketing', <Status key="c4" tone="pending">Standby</Status>, 'On event'],
        ]}
      />
    </Pane>
  )
}

export function WorkspaceView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>SOC Organization configuration</Label>
      <KV
        rows={[
          { k: 'Workspace', v: 'Acme Corp Cyber Defense Center' },
          { k: 'Region', v: 'AWS eu-west-1 (Ireland)' },
          { k: 'Retention', v: '365 days immutable audit log' },
          { k: 'SSO Provider', v: 'Okta Enterprise OIDC' },
        ]}
      />
    </Pane>
  )
}

export function EvidenceTabView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Full evidence chain export (JSON / STIX 2.1)</Label>
      <div className="rounded-lg border border-hairline bg-surface-code p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
        <pre className="overflow-x-auto">
{`{
  "type": "indicator",
  "spec_version": "2.1",
  "id": "indicator--8e2e2d2b-16d8-4522-ab84-79a6018b3d6d",
  "pattern": "[domain-name:value = 'secure-payments.co']",
  "valid_from": "2026-09-03T09:42:11Z",
  "confidence": 96.4
}`}
        </pre>
      </div>
    </Pane>
  )
}

export function ReportTabView() {
  return (
    <Pane className="flex flex-col gap-4">
      <Label>Executive & SOC incident report</Label>
      <div className="rounded-lg border border-hairline bg-surface p-4 text-[13px] leading-relaxed text-foreground">
        <h4 className="font-semibold text-mint">Verdict: Credential Phishing Attempt</h4>
        <p className="mt-2 text-muted-foreground">
          Message MFX-48211 originated from non-standard infrastructure in Moldova pretending to be securepayments.com.
          Headers indicate SPF failure and missing DKIM signatures. Immediate domain blocking recommended.
        </p>
      </div>
    </Pane>
  )
}
