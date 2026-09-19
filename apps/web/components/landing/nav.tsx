'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { AnimatedThemeToggler } from '~/components/ui/animated-theme-toggler'
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
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
            'flex h-14 items-center justify-between border pr-2 pl-4 sm:pl-5 backdrop-blur-2xl backdrop-saturate-150 will-change-[border-radius,background-color,box-shadow]',
            EASE,
            scrolled
              ? 'rounded-none border-x-0 border-t-0 border-b border-border/60 bg-background/85 shadow-xs sm:pr-6 sm:pl-8'
              : 'rounded-xl border-border/60 bg-background/75 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_32px_-12px_rgba(0,0,0,0.7)]',
          )}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center text-foreground" aria-label="MailForensix home">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20main-nc40an0lSlDbAo9xfuFiWkUcd0qcTy.png"
              alt="MailForensix"
              className="h-9 w-auto max-w-[170px] object-contain sm:max-w-[200px]"
            />
          </Link>

          {/* Links + actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav aria-label="Primary" className="hidden items-center md:flex">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-1.5 text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-1.5 text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="ml-1 inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-[14px] font-semibold text-background transition-opacity duration-200 hover:opacity-90"
            >
              Sign up
            </Link>

            {/* Exact same theme toggler as dashboard placed in the corner */}
            {mounted ? (
              <AnimatedThemeToggler
                variant="circle"
                duration={400}
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onThemeChange={(t) => setTheme(t)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ml-1"
              />
            ) : (
              <div className="h-8 w-8 ml-1" />
            )}
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
      <circle cx="16.5" cy="15.5" r="3" fill="var(--background)" stroke="var(--mint)" strokeWidth="1.5" />
      <path d="M18.8 17.8l1.7 1.7" stroke="var(--mint)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

