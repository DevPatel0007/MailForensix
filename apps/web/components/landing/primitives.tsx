import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-6 lg:px-8', className)}>{children}</div>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('text-micro inline-flex items-center gap-2 text-stone', className)}>
      <span className="size-1.5 rounded-full bg-mint" aria-hidden />
      {children}
    </span>
  )
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-[13px] leading-snug', className)}>{children}</span>
}

type StatusTone = 'complete' | 'running' | 'pending' | 'threat' | 'neutral'

export function Status({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  const toneClass: Record<StatusTone, string> = {
    complete: 'text-mint',
    running: 'text-foreground mf-pulse',
    pending: 'text-steel',
    threat: 'text-threat',
    neutral: 'text-muted-foreground',
  }
  return (
    <span className={cn('font-mono text-[11px] font-medium tracking-[0.08em] uppercase', toneClass[tone])}>
      {children}
    </span>
  )
}

export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mockup-shadow overflow-hidden rounded-lg bg-surface', className)}>{children}</div>
  )
}

export function FrameHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-hairline" aria-hidden />
        <span className="size-2 shrink-0 rounded-full bg-hairline" aria-hidden />
        <span className="size-2 shrink-0 rounded-full bg-hairline" aria-hidden />
        <span className="ml-2 truncate font-mono text-[11px] tracking-[0.08em] text-steel uppercase">{title}</span>
      </div>
      {meta ? <span className="hidden shrink-0 font-mono text-[11px] text-steel sm:inline">{meta}</span> : null}
    </div>
  )
}
