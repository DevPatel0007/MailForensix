'use client'

import { useState, type ComponentType, type ReactNode } from 'react'
import {
  Activity,
  FileText,
  Globe,
  Inbox,
  MapPin,
  Network,
  Search,
  Server,
  Settings,
  ShieldAlert,
  Sparkles,
  Webhook,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvestigationMockup } from './investigation-mockup'
import {
  AskAnalystView,
  CampaignsView,
  ConnectorsView,
  CorrelationView,
  DomainIntelView,
  EvidenceTabView,
  GeolocationView,
  HeaderAnalysisView,
  IndicatorsView,
  IpAnalysisView,
  ReportTabView,
  WorkspaceView,
} from './hero-views'

type ViewId =
  | 'ask'
  | 'investigation'
  | 'headers'
  | 'domain'
  | 'ip'
  | 'geo'
  | 'correlation'
  | 'campaigns'
  | 'indicators'
  | 'connectors'
  | 'workspace'

type NavItem = { id: ViewId; icon: ComponentType<{ className?: string; strokeWidth?: number }>; label: string }

const primary: NavItem[] = [
  { id: 'ask', icon: Sparkles, label: 'Ask analyst' },
  { id: 'investigation', icon: Inbox, label: 'Investigation' },
  { id: 'headers', icon: FileText, label: 'Header analysis' },
  { id: 'domain', icon: Globe, label: 'Domain intelligence' },
  { id: 'ip', icon: Server, label: 'IP analysis' },
  { id: 'geo', icon: MapPin, label: 'Geolocation' },
  { id: 'correlation', icon: Network, label: 'Threat correlation' },
]

const secondary: NavItem[] = [
  { id: 'campaigns', icon: Activity, label: 'Campaigns' },
  { id: 'indicators', icon: ShieldAlert, label: 'Indicators' },
  { id: 'connectors', icon: Webhook, label: 'Connectors' },
  { id: 'workspace', icon: Settings, label: 'Workspace' },
]

type PageMeta = {
  eyebrow: string
  title: string
  subtitle: string
  tabs?: string[]
  caseScoped: boolean
}

const PAGES: Record<ViewId, PageMeta> = {
  ask: {
    eyebrow: 'AI analyst',
    title: 'Ask about any investigation',
    subtitle: 'Answers cite the evidence chain · Scoped to Acme Corp SOC',
    caseScoped: false,
  },
  investigation: {
    eyebrow: 'Case MFX-48211',
    title: 'Urgent verification required',
    subtitle: 'Reported by finance@acme-corp.com · Auto-triaged 09:42:11 UTC',
    tabs: ['Investigation', 'Evidence', 'Report'],
    caseScoped: true,
  },
  headers: {
    eyebrow: 'Case MFX-48211 · Header analysis',
    title: 'Received chain & authentication',
    subtitle: '4 hops · SPF fail · DKIM none · DMARC reject',
    caseScoped: true,
  },
  domain: {
    eyebrow: 'Case MFX-48211 · Domain intelligence',
    title: 'secure-payments.co',
    subtitle: 'Registered 3 days ago · Privacy WHOIS · Typosquat of securepayments.com',
    caseScoped: true,
  },
  ip: {
    eyebrow: 'Case MFX-48211 · IP analysis',
    title: '185.142.xxx.xxx',
    subtitle: 'AS9009 · M247 Europe · Bulletproof hosting · Abuse score 87',
    caseScoped: true,
  },
  geo: {
    eyebrow: 'Case MFX-48211 · Geolocation',
    title: 'Origin mismatch · 2,140 km',
    subtitle: 'Claimed London, UK · Resolved Chișinău, MD',
    caseScoped: true,
  },
  correlation: {
    eyebrow: 'Case MFX-48211 · Threat correlation',
    title: 'Linked to campaign THR-2291',
    subtitle: '4 of 7 indicators shared · 17 prior messages in workspace',
    caseScoped: true,
  },
  campaigns: {
    eyebrow: 'Workspace',
    title: 'Campaigns',
    subtitle: '6 active · 2 high severity · Last activity 38 minutes ago',
    caseScoped: false,
  },
  indicators: {
    eyebrow: 'Workspace',
    title: 'Indicators',
    subtitle: '1,284 IOCs · 312 added this week · Synced to Splunk & Sentinel',
    caseScoped: false,
  },
  connectors: {
    eyebrow: 'Workspace',
    title: 'Connectors',
    subtitle: '5 of 6 active · Mail ingestion, SIEM export and ticketing',
    caseScoped: false,
  },
  workspace: {
    eyebrow: 'Settings',
    title: 'Acme Corp SOC',
    subtitle: 'Team plan · 12 seats · eu-west-1 · SSO enforced',
    caseScoped: false,
  },
}

export function HeroApp({ className }: { className?: string }) {
  const [view, setView] = useState<ViewId>('investigation')
  const [tab, setTab] = useState(0)
  const page = PAGES[view]

  const select = (id: ViewId) => {
    setView(id)
    setTab(0)
  }

  return (
    <div
      className={cn(
        'mockup-shadow grid overflow-hidden rounded-xl bg-background grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)]',
        className,
      )}
    >
      {/* Sidebar */}
      <aside className="hidden flex-col border-r border-hairline bg-surface/60 md:flex" aria-label="App navigation">
        <div className="flex items-center gap-2 px-4 py-4">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20main-nc40an0lSlDbAo9xfuFiWkUcd0qcTy.png"
            alt="MailForensix"
            className="h-7 w-auto max-w-[150px] object-contain"
          />
        </div>
        <NavList items={primary} active={view} onSelect={select} />
        <div className="mx-4 my-3 border-t border-hairline" />
        <NavList items={secondary} active={view} onSelect={select} muted />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 border-b border-hairline px-5">
          <div className="flex min-h-[41px] items-center gap-5">
            {page.tabs ? (
              page.tabs.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(i)}
                  aria-pressed={tab === i}
                  className={cn(
                    'border-b py-3 text-[12px] transition-colors duration-200',
                    tab === i
                      ? 'border-mint text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t}
                </button>
              ))
            ) : (
              <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="text-steel">Acme Corp SOC</span>
                <span className="text-steel">/</span>
                <span className="text-foreground">{titleFor(view)}</span>
              </span>
            )}
          </div>
          <div className="hidden items-center gap-2 py-2 sm:flex">
            <span className="flex items-center gap-2 rounded-sm border border-hairline bg-surface px-2.5 py-1.5 text-[11px] text-steel">
              <Search className="size-3" />
              Search indicators
              <span className="ml-6 font-mono text-[10px]">⌘K</span>
            </span>
            <button
              type="button"
              onClick={() => select('ask')}
              className={cn(
                'flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[11px] transition-colors duration-200',
                view === 'ask'
                  ? 'border-mint/40 text-mint'
                  : 'border-hairline text-muted-foreground hover:border-steel hover:text-foreground',
              )}
            >
              <Sparkles className="size-3" />
              Ask AI
            </button>
          </div>
        </div>

        {/* Page header */}
        <div key={view} className="mf-view-in px-5 pt-5">
          <p className={cn('text-[12px]', page.caseScoped ? 'text-mint' : 'text-steel')}>{page.eyebrow}</p>
          <h3 className="mt-1 truncate text-[18px] font-medium tracking-tight">{page.title}</h3>
          <p className="mt-1 truncate text-[12px] text-muted-foreground">{page.subtitle}</p>
        </div>

        {/* Page body */}
        <div key={`${view}-${tab}`} className="mf-view-in mt-4 border-t border-hairline">
          {renderView(view, tab)}
        </div>
      </div>
    </div>
  )
}

function titleFor(id: ViewId) {
  return [...primary, ...secondary].find((n) => n.id === id)?.label ?? ''
}

function renderView(view: ViewId, tab: number): ReactNode {
  switch (view) {
    case 'ask':
      return <AskAnalystView />
    case 'investigation':
      if (tab === 1) return <EvidenceTabView />
      if (tab === 2) return <ReportTabView />
      return <InvestigationMockup frameless />
    case 'headers':
      return <HeaderAnalysisView />
    case 'domain':
      return <DomainIntelView />
    case 'ip':
      return <IpAnalysisView />
    case 'geo':
      return <GeolocationView />
    case 'correlation':
      return <CorrelationView />
    case 'campaigns':
      return <CampaignsView />
    case 'indicators':
      return <IndicatorsView />
    case 'connectors':
      return <ConnectorsView />
    case 'workspace':
      return <WorkspaceView />
  }
}

function NavList({
  items,
  active,
  onSelect,
  muted,
}: {
  items: NavItem[]
  active: ViewId
  onSelect: (id: ViewId) => void
  muted?: boolean
}) {
  return (
    <ul className="flex flex-col gap-0.5 px-2">
      {items.map(({ id, icon: Icon, label }) => {
        const isActive = active === id
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-[12px] transition-colors duration-200',
                isActive
                  ? 'bg-mint/10 text-mint'
                  : muted
                    ? 'text-steel hover:bg-surface hover:text-muted-foreground'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
              {label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
