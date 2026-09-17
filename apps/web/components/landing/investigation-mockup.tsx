'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Frame, FrameHeader, Status } from './primitives'

const STAGES = [
  { label: 'Header analysis', done: 'Complete', detail: 'SPF fail · DKIM none · DMARC reject' },
  { label: 'Domain intelligence', done: 'Complete', detail: 'Registered 3 days ago · Privacy WHOIS' },
  { label: 'IP analysis', done: 'Complete', detail: '185.142.xxx.xxx · AS9009 · Bulletproof hosting' },
  { label: 'Geolocation', done: 'Resolved', detail: 'Chișinău, MD · Mismatch vs. claimed origin' },
  { label: 'Threat correlation', done: 'Complete', detail: '4 indicators matched · Campaign THR-2291' },
] as const

const STEP_MS = 900

export function InvestigationMockup({ frameless = false }: { frameless?: boolean }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step > STAGES.length) return
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 700 : STEP_MS)
    return () => clearTimeout(t)
  }, [step])

  const verdictReady = step > STAGES.length
  const Wrapper = frameless ? 'div' : Frame

  return (
    <Wrapper className="w-full">
      {frameless ? null : <FrameHeader title="Investigation · MFX-48211" meta="09:42:11 UTC" />}

      <div className="grid gap-0 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Message pane */}
        <div className="min-w-0 border-b border-hairline p-5 md:border-r md:border-b-0">
          <p className="text-micro text-steel">Suspicious message</p>
          <dl className="mt-4 grid grid-cols-[72px_1fr] gap-y-2 font-mono text-[13px] leading-relaxed">
            <dt className="text-steel">From</dt>
            <dd className="truncate text-foreground">
              billing@<span className="text-mint">secure-payments.co</span>
            </dd>
            <dt className="text-steel">To</dt>
            <dd className="truncate text-muted-foreground">finance@acme-corp.com</dd>
            <dt className="text-steel">Subject</dt>
            <dd className="text-foreground">Urgent verification required</dd>
            <dt className="text-steel">Received</dt>
            <dd className="min-w-0 truncate text-muted-foreground">Tue, 03 Sep 2026 09:41:58 +0000</dd>
          </dl>

          <div className="mt-5 border-t border-hairline pt-4">
            <p className="text-micro text-steel">Sender identity</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['SPF', 'DKIM', 'DMARC'].map((k, i) => (
                <span
                  key={k}
                  className={cn(
                    'rounded-xs border px-1.5 py-0.5 font-mono text-[11px] transition-colors duration-500',
                    step >= 1
                      ? i === 1
                        ? 'border-hairline text-steel'
                        : 'border-threat/40 text-threat'
                      : 'border-hairline text-steel',
                  )}
                >
                  {k} {step >= 1 ? (i === 1 ? 'NONE' : 'FAIL') : '—'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline pane */}
        <div className="min-w-0 p-5">
          <p className="text-micro text-steel">Analysis pipeline</p>
          <ol className="mt-4 flex flex-col">
            {STAGES.map((s, i) => {
              const state = step > i + 1 ? 'complete' : step === i + 1 ? 'running' : 'pending'
              return (
                <li
                  key={s.label}
                  className="flex items-start justify-between gap-4 border-b border-hairline-soft py-2.5 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-[13px] font-medium transition-colors duration-300',
                        state === 'pending' ? 'text-steel' : 'text-foreground',
                      )}
                    >
                      {s.label}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 truncate font-mono text-[11px] text-muted-foreground transition-opacity duration-500',
                        state === 'complete' ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {s.detail}
                    </p>
                  </div>
                  <span className="shrink-0 pt-0.5">
                    <Status tone={state}>{state === 'complete' ? s.done : state === 'running' ? 'Running' : 'Queued'}</Status>
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {/* Verdict bar */}
      <div className="grid grid-cols-2 border-t border-hairline sm:grid-cols-4">
        {[
          { k: 'Threat level', v: 'HIGH', tone: 'threat' as const },
          { k: 'Confidence', v: '96.4%', tone: 'complete' as const },
          { k: 'Indicators', v: '4 / 7', tone: 'neutral' as const },
          { k: 'Verdict', v: 'Credential phishing', tone: 'neutral' as const },
        ].map((item, i) => (
          <div
            key={item.k}
            className={cn(
              'border-hairline px-5 py-4 transition-all duration-500',
              i < 3 && 'sm:border-r',
              i % 2 === 0 && 'border-r sm:border-r',
              i < 2 && 'border-b sm:border-b-0',
              verdictReady ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
            )}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <p className="text-micro text-steel">{item.k}</p>
            <p
              className={cn(
                'mt-1.5 font-mono text-sm font-medium',
                item.tone === 'threat' && 'text-threat',
                item.tone === 'complete' && 'text-mint',
                item.tone === 'neutral' && 'text-foreground',
              )}
            >
              {item.v}
            </p>
          </div>
        ))}
      </div>
    </Wrapper>
  )
}
