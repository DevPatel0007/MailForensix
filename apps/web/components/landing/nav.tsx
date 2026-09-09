'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const links = [
  { href: '#pipeline', label: 'Product' },
  { href: '#evidence', label: 'Solutions' },
  { href: '#report', label: 'Resources' },
  { href: '#cta', label: 'Pricing' },
]

// Long, front-loaded curve (Apple-style) so the bar glides to the edge instead of snapping.
const EASE = 'transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setScrolled(window.scrollY > 24)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 will-change-[padding]',
        EASE,
        scrolled ? 'px-0 pt-0' : 'px-4 pt-4 sm:px-6',
      )}
    >
      <div className={cn('mx-auto w-full will-change-[max-width]', EASE, scrolled ? 'max-w-[100vw]' : 'max-w-6xl')}>
        <div
          className={cn(
            'flex h-14 items-center justify-between border border-foreground/10 pr-2 pl-5 backdrop-blur-2xl backdrop-saturate-150 will-change-[border-radius,background-color,box-shadow]',
            EASE,
            scrolled
              ? 'rounded-none border-transparent border-b-white/10 bg-black/70 shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_12px_40px_-16px_rgba(0,0,0,0.7)] sm:pr-6 sm:pl-8'
              : 'rounded-lg bg-black/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_32px_-12px_rgba(0,0,0,0.7)]',
          )}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center text-foreground" aria-label="MailForensix home">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20main-nc40an0lSlDbAo9xfuFiWkUcd0qcTy.png"
              alt="MailForensix"
              className="h-10 w-auto max-w-[180px] object-contain sm:max-w-[210px]"
            />
          </Link>

          {/* Links + action */}
          <div className="flex items-center gap-1">
            <nav aria-label="Primary" className="hidden items-center md:flex">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-1.5 text-[15px] font-medium text-foreground/55 transition-colors duration-200 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <Link
              href="/sign-in"
              className="hidden rounded-lg px-3 py-1.5 text-[15px] font-medium text-foreground/55 transition-colors duration-200 hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="ml-2 inline-flex h-10 items-center rounded-lg bg-foreground px-5 text-[15px] font-semibold text-background transition-opacity duration-200 hover:opacity-90"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className={className}>
      <rect x="1.5" y="4.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 6l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16.5" cy="15.5" r="3" fill="#0a0a0a" stroke="#00d4a4" strokeWidth="1.5" />
      <path d="M18.8 17.8l1.7 1.7" stroke="#00d4a4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
